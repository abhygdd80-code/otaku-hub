'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isShopifyConfigured } from '@/lib/shopify/config';
import type {
  AuthStore,
  LoginCredentials,
  ProfileUpdateInput,
  SignupCredentials,
  UserProfile,
} from '@/types/auth';

// ─── Helpers ───────────────────────────────────────────────────

const STORAGE_KEY = 'otaku-auth';
const USERS_KEY = 'otaku-users';

function generateId(): string {
  return `usr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Read registered demo accounts from localStorage.
 *
 * No password is ever persisted: this is a client-side mock auth layer with
 * no backend, so credentials are validated only on the signup form and then
 * discarded. Legacy records that predate this fix may still carry a `password`
 * field — strip it on read and rewrite the key so the plaintext is removed.
 */
function getStoredUsers(): Record<string, UserProfile> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<
      string,
      Partial<UserProfile> & { password?: string }
    >;
    if (!parsed || typeof parsed !== 'object') return {};

    const clean: Record<string, UserProfile> = {};
    let sanitized = false;

    for (const [email, record] of Object.entries(parsed)) {
      if (!record || typeof record !== 'object') continue;
      const { password, ...profile } = record;
      if (password !== undefined) sanitized = true;
      clean[email] = profile as UserProfile;
    }

    if (sanitized) {
      try {
        localStorage.setItem(USERS_KEY, JSON.stringify(clean));
      } catch {
        // Non-critical — the in-memory copy is already clean.
      }
    }

    return clean;
  } catch {
    return {};
  }
}

function storeUser(data: UserProfile): void {
  const users = getStoredUsers();
  users[data.email] = data;
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.warn('Failed to persist account:', error);
  }
}

// ─── API helpers (Shopify-configured path) ─────────────────────

/** POST to an auth endpoint and return the JSON response. */
async function postAuth<T>(
  url: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'same-origin',
  });
  return (await res.json()) as T;
}

// ─── Initial State ─────────────────────────────────────────────

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// ─── Store ─────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      initSession: async () => {
        // Nothing to reconcile when Shopify auth is unavailable — the mock
        // session is trusted as-is.
        if (!isShopifyConfigured()) return;

        try {
          const res = await fetch('/api/auth/me', {
            credentials: 'same-origin',
          });
          if (res.status === 401) {
            // Cookie is gone (expired / logged out elsewhere) — reconcile
            // the persisted store so UI guards reflect reality.
            if (get().isAuthenticated) {
              set({ user: null, isAuthenticated: false, error: null });
            }
            return;
          }
          const json = (await res.json()) as { user: UserProfile | null };
          if (json.user) {
            set({ user: json.user, isAuthenticated: true, error: null });
          }
        } catch {
          // Network failure — leave the persisted session untouched rather
          // than logging the user out on a transient error.
        }
      },

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        if (isShopifyConfigured()) {
          try {
            const json = await postAuth<{ user?: UserProfile; error?: string }>(
              '/api/auth/login',
              { ...credentials }
            );
            if (json.user) {
              set({ user: json.user, isAuthenticated: true, isLoading: false });
              return;
            }
            set({
              isLoading: false,
              error: json.error ?? 'Invalid email or password.',
            });
          } catch {
            set({
              isLoading: false,
              error: 'Something went wrong. Please try again later.',
            });
          }
          return;
        }

        // Mock auth: passwords are never stored client-side, so sign-in
        // succeeds for any known demo account. Wire to a real backend
        // (hashed credentials over HTTPS) before production launch.
        await new Promise(r => setTimeout(r, 800));

        const users = getStoredUsers();
        const user = users[credentials.email];

        if (!user) {
          set({ isLoading: false, error: 'Invalid email or password.' });
          return;
        }

        set({ user, isAuthenticated: true, isLoading: false, error: null });
      },

      signup: async (credentials: SignupCredentials) => {
        set({ isLoading: true, error: null });

        if (credentials.password !== credentials.confirmPassword) {
          set({ isLoading: false, error: 'Passwords do not match.' });
          return;
        }

        if (isShopifyConfigured()) {
          try {
            const json = await postAuth<{ user?: UserProfile; error?: string }>(
              '/api/auth/signup',
              {
                name: credentials.name,
                email: credentials.email,
                password: credentials.password,
              }
            );
            if (json.user) {
              set({ user: json.user, isAuthenticated: true, isLoading: false });
              return;
            }
            set({
              isLoading: false,
              error: json.error ?? 'Unable to create your account.',
            });
          } catch {
            set({
              isLoading: false,
              error: 'Something went wrong. Please try again later.',
            });
          }
          return;
        }

        // Mock auth path (existing behavior).
        await new Promise(r => setTimeout(r, 800));

        if (credentials.password.length < 8) {
          set({
            isLoading: false,
            error: 'Password must be at least 8 characters.',
          });
          return;
        }

        const users = getStoredUsers();

        if (users[credentials.email]) {
          set({
            isLoading: false,
            error: 'An account with this email already exists.',
          });
          return;
        }

        const user: UserProfile = {
          id: generateId(),
          email: credentials.email,
          name: credentials.name,
          createdAt: new Date().toISOString(),
        };

        storeUser(user);

        set({ user, isAuthenticated: true, isLoading: false, error: null });
      },

      logout: async () => {
        if (isShopifyConfigured()) {
          try {
            await fetch('/api/auth/logout', { method: 'POST' });
          } catch {
            // Local sign-out must still succeed even if the server call fails.
          }
        }
        set({ user: null, isAuthenticated: false, error: null });
      },

      updateProfile: async (data: ProfileUpdateInput) => {
        const current = get().user;
        if (!current) return;

        if (isShopifyConfigured()) {
          set({ isLoading: true, error: null });
          try {
            const res = await fetch('/api/auth/me', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                acceptsMarketing: data.acceptsMarketing,
              }),
            });
            const json = (await res.json()) as {
              user?: UserProfile;
              error?: string;
            };
            if (res.ok && json.user) {
              set({ user: json.user, isLoading: false, error: null });
              return;
            }
            set({
              isLoading: false,
              error: json.error ?? 'Unable to update profile.',
            });
          } catch {
            set({
              isLoading: false,
              error: 'Something went wrong. Please try again later.',
            });
          }
          return;
        }

        // Mock path — local name/avatar update.
        const updated = { ...current, ...data };
        set({ user: updated });

        const users = getStoredUsers();
        if (users[current.email]) {
          users[current.email] = { ...users[current.email], ...data };
          try {
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
          } catch (error) {
            console.warn('Failed to persist profile update:', error);
          }
        }
      },

      clearError: () => {
        set({ error: null });
      },

      requestPasswordReset: async (email: string) => {
        set({ isLoading: true, error: null });

        if (isShopifyConfigured()) {
          try {
            const json = await postAuth<{ ok?: boolean; error?: string }>(
              '/api/auth/forgot-password',
              { email }
            );
            if (json.ok) {
              set({ isLoading: false, error: null });
              return;
            }
            set({
              isLoading: false,
              error: json.error ?? 'Unable to send reset email.',
            });
          } catch {
            set({
              isLoading: false,
              error: 'Something went wrong. Please try again later.',
            });
          }
          return;
        }

        // Mock path.
        await new Promise(r => setTimeout(r, 800));

        const users = getStoredUsers();
        if (!users[email]) {
          set({
            isLoading: false,
            error: 'No account found with this email address.',
          });
          return;
        }

        set({ isLoading: false, error: null });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      migrate: persistedState => {
        // v0 → v1: validate shape and guarantee no sensitive fields survive.
        const state = persistedState as {
          user?: unknown;
          isAuthenticated?: unknown;
        } | null;
        if (!state || typeof state !== 'object') {
          return { user: null, isAuthenticated: false };
        }
        const { user, isAuthenticated } = state;
        return {
          user: user && typeof user === 'object' ? (user as UserProfile) : null,
          isAuthenticated: Boolean(isAuthenticated),
        };
      },
    }
  )
);
