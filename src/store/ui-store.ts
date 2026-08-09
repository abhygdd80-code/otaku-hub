import { create } from 'zustand';

interface UIState {
  /** Whether the mobile menu is open */
  isMobileMenuOpen: boolean;
  /** Whether search bar is visible */
  isSearchOpen: boolean;
  /** Whether the custom cursor is active */
  isCustomCursorActive: boolean;

  // Actions
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setCustomCursor: (active: boolean) => void;
}

export const useUIStore = create<UIState>(set => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isCustomCursorActive: false,

  setMobileMenuOpen: open => set({ isMobileMenuOpen: open }),
  toggleMobileMenu: () => set(s => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  setSearchOpen: open => set({ isSearchOpen: open }),
  toggleSearch: () => set(s => ({ isSearchOpen: !s.isSearchOpen })),
  setCustomCursor: active => set({ isCustomCursorActive: active }),
}));
