// ─── Search Store ───────────────────────────────────────────────────
// Manages search query state and persists recent searches to localStorage.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_RECENT = 10;

interface SearchState {
  /** Current search query string */
  query: string;
  /** List of recent search terms (newest first, max 10) */
  recentSearches: string[];
  /** Whether recent searches have been rehydrated from storage */
  isRecentLoaded: boolean;

  // Actions
  setQuery: (query: string) => void;
  addRecentSearch: (term: string) => void;
  removeRecentSearch: (index: number) => void;
  clearRecentSearches: () => void;
  clearQuery: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: '',
      recentSearches: [],
      isRecentLoaded: false,

      setQuery: (query: string) => set({ query }),

      addRecentSearch: (term: string) => {
        const trimmed = term.trim();
        if (!trimmed) return;

        const { recentSearches } = get();
        // Remove duplicate if exists (case-insensitive), add to front
        const filtered = recentSearches.filter(
          s => s.toLowerCase() !== trimmed.toLowerCase()
        );
        set({ recentSearches: [trimmed, ...filtered].slice(0, MAX_RECENT) });
      },

      removeRecentSearch: (index: number) => {
        const { recentSearches } = get();
        set({
          recentSearches: recentSearches.filter((_, i) => i !== index),
        });
      },

      clearRecentSearches: () => set({ recentSearches: [] }),

      clearQuery: () => set({ query: '' }),
    }),
    {
      name: 'otaku-recent-searches',
      // Only persist recent searches — query is ephemeral
      partialize: state => ({
        recentSearches: state.recentSearches,
      }),
      // Mark as loaded after rehydration
      onRehydrateStorage: () => () => {
        // Called after storage is loaded
        useSearchStore.setState({ isRecentLoaded: true });
      },
    }
  )
);
