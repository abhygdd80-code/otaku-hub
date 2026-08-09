// ─── Wishlist Store ─────────────────────────────────────────────────
// Manages wishlist items (product handles) with localStorage persistence.
//
// When the app is Shopify-backed and the user is signed in, the store also
// keeps the customer's server-side wishlist in sync:
//   • every add/remove/clear pushes the new state to /api/wishlist
//   • signing in merges the guest wishlist (localStorage) with the
//     customer's saved wishlist and writes the union back to the server
//
// The public API is unchanged — all existing consumers (WishlistButton,
// WishlistNavIcon, WishlistPageClient, compare-store, etc.) continue to
// work identically whether or not server sync is active.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './auth-store';
import { isShopifyConfigured } from '@/lib/shopify/config';

interface WishlistState {
  /** Array of product handles */
  items: string[];

  // Actions
  addItem: (handle: string) => void;
  removeItem: (handle: string) => void;
  toggleItem: (handle: string) => void;
  clearWishlist: () => void;
  isWishlisted: (handle: string) => boolean;
}

// ─── Server sync helpers ────────────────────────────────────────────
// All network access lives behind these helpers so the rest of the store
// stays synchronous; a failed write never blocks the UI.

const MAX_HANDLES = 200;

/** Serialized write queue so rapid toggles hit the server in order. */
let writeQueue: Promise<unknown> = Promise.resolve();

/** Whether we should sync mutations to the server right now. */
function canSyncToServer(): boolean {
  return (
    typeof window !== 'undefined' &&
    isShopifyConfigured() &&
    useAuthStore.getState().isAuthenticated
  );
}

/**
 * Persist the current full state to the server. Failures are swallowed —
 * the next successful push sends the full list, so state converges.
 */
function pushToServer(handles: string[]): Promise<void> {
  const run = async () => {
    try {
      await fetch('/api/wishlist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ handles }),
      });
    } catch {
      // Network failure — keep the local list; it persists in localStorage.
    }
  };
  const task = writeQueue.then(run);
  writeQueue = task.catch(() => undefined);
  return task;
}

type ServerFetchResult = { ok: true; handles: string[] } | { ok: false };

/** Read the server wishlist; distinguishes "empty" from "unreachable". */
async function fetchFromServer(): Promise<ServerFetchResult> {
  try {
    const res = await fetch('/api/wishlist', {
      credentials: 'same-origin',
    });
    if (!res.ok) return { ok: false };
    const json = (await res.json()) as { handles?: unknown };
    if (!Array.isArray(json.handles)) return { ok: false };
    const handles = json.handles
      .filter((h): h is string => typeof h === 'string')
      .slice(0, MAX_HANDLES);
    return { ok: true, handles };
  } catch {
    return { ok: false };
  }
}

// ─── Store ─────────────────────────────────────────────────────────

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (handle: string) => {
        const items = get().items.includes(handle)
          ? get().items
          : [...get().items, handle];
        set({ items });
        if (canSyncToServer()) void pushToServer(items);
      },

      removeItem: (handle: string) => {
        const items = get().items.filter(h => h !== handle);
        set({ items });
        if (canSyncToServer()) void pushToServer(items);
      },

      toggleItem: (handle: string) => {
        const items = get().items.includes(handle)
          ? get().items.filter(h => h !== handle)
          : [...get().items, handle];
        set({ items });
        if (canSyncToServer()) void pushToServer(items);
      },

      clearWishlist: () => {
        set({ items: [] });
        if (canSyncToServer()) void pushToServer([]);
      },

      isWishlisted: (handle: string) => get().items.includes(handle),
    }),
    {
      name: 'otaku-wishlist',
    }
  )
);

// ─── Login merge ────────────────────────────────────────────────────
// When the auth store transitions to signed-in (login, signup, or a
// persisted session reconciling on boot), merge the guest wishlist from
// localStorage with the customer's server-side wishlist and write the
// union back to the server so both copies converge.

let merging = false;

export async function syncWishlistWithServer(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!isShopifyConfigured()) return;
  if (!useAuthStore.getState().isAuthenticated) return;
  if (merging) return;

  merging = true;
  try {
    const remote = await fetchFromServer();

    // A failed read must not overwrite the customer's saved wishlist with
    // the guest list — abort and keep the local (guest) state untouched.
    if (!remote.ok) return;

    const local = useWishlistStore.getState().items;
    const merged = Array.from(new Set([...local, ...remote.handles])).slice(
      0,
      MAX_HANDLES
    );

    // Only update the local state when the guest list had items the server
    // didn't already have.
    const guestHasExtras = local.some(h => !remote.handles.includes(h));
    if (guestHasExtras || merged.length !== local.length) {
      useWishlistStore.setState({ items: merged });
    }

    // Always write the union to the server so any guest-only items are
    // persisted under the customer account — but skip when nothing changed
    // (avoids a redundant PUT on every page load).
    const serverNeedsWrite =
      local.some(h => !remote.handles.includes(h)) ||
      remote.handles.some(h => !local.includes(h));
    if (serverNeedsWrite) {
      await pushToServer(merged);
    }
  } finally {
    merging = false;
  }
}

// ─── Subscribe to auth transitions ──────────────────────────────────
// Runs on the client only. Listens for the auth store going from
// signed-out → signed-in and triggers the login merge. Also reconciles
// once on boot when the session is already authenticated (e.g. a
// page refresh with a persisted cookie).

if (typeof window !== 'undefined') {
  useAuthStore.subscribe((state, prev) => {
    if (state.isAuthenticated && !prev.isAuthenticated) {
      void syncWishlistWithServer();
    }
  });

  // Boot: if the persisted session is already signed in, reconcile the
  // wishlist against the server once the client store has rehydrated.
  if (useAuthStore.getState().isAuthenticated) {
    void syncWishlistWithServer();
  }

  // Cross-tab sync: when another tab writes to the wishlist localStorage
  // entry, rehydrate the in-memory store so the badge count stays
  // accurate and subsequent server writes in this tab don't clobber the
  // other tab's changes.
  window.addEventListener('storage', e => {
    if (e.key !== 'otaku-wishlist') return;
    try {
      const parsed = JSON.parse(e.newValue ?? '') as {
        state?: { items?: string[] };
      };
      const items = parsed?.state?.items;
      if (Array.isArray(items)) {
        useWishlistStore.setState({ items });
        // Re-sync with server so stale in-memory state doesn't cause a
        // PUT that overwrites the other tab's changes.
        if (useAuthStore.getState().isAuthenticated) {
          void syncWishlistWithServer();
        }
      }
    } catch {
      // Malformed localStorage — ignored; the next write will correct it.
    }
  });
}
