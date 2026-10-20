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

const STORAGE_KEY = 'otaku-auth';
export const AUTH_UNAVAILABLE_MESSAGE =
  'Account access is unavailable until the real account integration is enabled.';
const SESSION_VERIFICATION_MESSAGE =
  'We could not verify your account session. Please sign in again.';

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
        // Local catalog mode has no secure account backend. Never trust a
        // persisted mock session, even if it was created by an older build.
        if (!isShopifyConfigured()) {
          try {
            localStorage.removeItem('otaku-users');
          } catch {
            // Storage may be unavailable; the in-memory session is still
            // cleared below.
          }
          set({ user: null, isAuthenticated: false, error: null });
          return;
        }

        try {
          const res = await fetch('/api/auth/me', {
            credentials: 'same-origin',
          });
          if (!res.ok) {
            set({
              user: null,
              isAuthenticated: false,
              error: res.status === 401 ? null : SESSION_VERIFICATION_MESSAGE,
            });
            return;
          }
          const json = (await res.json()) as { user: UserProfile | null };
          if (json.user) {
            set({ user: json.user, isAuthenticated: true, error: null });
          } else {
            set({ user: null, isAuthenticated: false, error: null });
          }
        } catch {
          // A persisted client record is not proof of a live server session.
          set({
            user: null,
            isAuthenticated: false,
            error: SESSION_VERIFICATION_MESSAGE,
          });
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

        // There is no safe local password verifier. Do not authenticate from
        // the profile-only records used by the old mock implementation.
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: AUTH_UNAVAILABLE_MESSAGE,
        });
      },

      signup: async (credentials: SignupCredentials) => {
        set({ isLoading: true, error: null });

        if (!isShopifyConfigured()) {
          // Account creation also requires a real backend to store and verify
          // credentials. Never create a local account that cannot be secured.
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: AUTH_UNAVAILABLE_MESSAGE,
          });
          return;
        }

        if (credentials.password !== credentials.confirmPassword) {
          set({ isLoading: false, error: 'Passwords do not match.' });
          return;
        }

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

        // A local profile is not an authenticated account and must not be
        // presented as mutable account data.
        set({
          user: null,
          isAuthenticated: false,
          error: AUTH_UNAVAILABLE_MESSAGE,
        });
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

        // A reset email cannot be sent without a real account backend.
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: AUTH_UNAVAILABLE_MESSAGE,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 3,
      partialize: () => ({
        // Never persist a client-side session. Real sessions are reconciled
        // against the server cookie by initSession on protected routes.
        user: null,
        isAuthenticated: false,
      }),
      migrate: persistedState => {
        // v0/v1 records may be mock sessions with no password verification.
        // They must never be promoted into an authenticated state.
        void persistedState;
        return { user: null, isAuthenticated: false };
      },
    }
  )
);
