// ─── Compare Store ─────────────────────────────────────────────────────
// Tracks products queued for comparison (max 4) plus the visibility of
// the comparison drawer. Selections persist across sessions; the drawer
// state is intentionally ephemeral (`partialize`).

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const MAX_COMPARE_ITEMS = 4;

interface CompareState {
  /** Product handles selected for comparison */
  items: string[];
  /** Whether the comparison drawer is open */
  isOpen: boolean;
  /** Whether the store has rehydrated from localStorage */
  isLoaded: boolean;

  // Actions
  toggleItem: (handle: string) => void;
  removeItem: (handle: string) => void;
  clearAll: () => void;
  setIsOpen: (isOpen: boolean) => void;
  isCompared: (handle: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoaded: false,

      toggleItem: (handle: string) => {
        if (!handle) return;
        const { items } = get();

        if (items.includes(handle)) {
          set({ items: items.filter(h => h !== handle) });
          return;
        }

        if (items.length >= MAX_COMPARE_ITEMS) {
          // At capacity — drop the oldest selection to make room.
          set({ items: [...items.slice(1), handle] });
          return;
        }

        set({ items: [...items, handle] });
      },

      removeItem: (handle: string) =>
        set(state => ({
          items: state.items.filter(h => h !== handle),
        })),

      clearAll: () => set({ items: [] }),

      setIsOpen: (isOpen: boolean) => set({ isOpen }),

      isCompared: (handle: string) => get().items.includes(handle),
    }),
    {
      name: 'otaku-compare',
      partialize: state => ({ items: state.items }),
      onRehydrateStorage: () => () => {
        useCompareStore.setState({ isLoaded: true });
      },
    }
  )
);
