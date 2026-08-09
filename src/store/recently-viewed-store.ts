// ─── Recently Viewed Store ─────────────────────────────────────────────
// Persists recently viewed product handles (newest first, max 8) so a
// horizontal "Keep exploring" rail can follow users across pages.
//
// Mirrors the search-store pattern: `partialize` excludes ephemeral state
// and `onRehydrateStorage` flags when localStorage has been loaded so the
// rail never flashes empty on first paint.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const MAX_RECENTLY_VIEWED = 8;

interface RecentlyViewedState {
  /** Product handles, newest first */
  items: string[];
  /** Whether the store has rehydrated from localStorage */
  isLoaded: boolean;

  // Actions
  recordView: (handle: string) => void;
  removeItem: (handle: string) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoaded: false,

      recordView: (handle: string) => {
        if (!handle) return;
        const { items } = get();
        // Move to front (dedupe) and cap the list, dropping the oldest.
        const deduped = items.filter(h => h !== handle);
        set({ items: [handle, ...deduped].slice(0, MAX_RECENTLY_VIEWED) });
      },

      removeItem: (handle: string) =>
        set(state => ({
          items: state.items.filter(h => h !== handle),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'otaku-recently-viewed',
      partialize: state => ({ items: state.items }),
      onRehydrateStorage: () => () => {
        useRecentlyViewedStore.setState({ isLoaded: true });
      },
    }
  )
);
