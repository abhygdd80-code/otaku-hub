// ─── Z-Index Scale ─────────────────────────────────────────
export const Z_INDEX = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 100,
  navbar: 50,
  navbarDropdown: 55,
  drawer: 60,
  drawerBackdrop: 50,
  modal: 70,
  modalBackdrop: 65,
  popover: 80,
  tooltip: 90,
  toast: 100,
  cursor: 9999,
} as const;

// ─── Animation Durations (seconds) ─────────────────────────
export const DURATION = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  slower: 0.8,
  slowest: 1.2,
  pageTransition: 0.5,
  stagger: {
    fast: 0.04,
    normal: 0.08,
    slow: 0.12,
  },
} as const;

// ─── Routes ────────────────────────────────────────────────
export const ROUTES = {
  home: '/',
  shop: '/collections/all',
  collections: '/collections',
  newArrivals: '/collections/new',
  orderConfirmed: '/order/confirmed',
  account: {
    root: '/account',
    profile: '/account/profile',
    orders: '/account/orders',
    addresses: '/account/addresses',
    settings: '/account/settings',
  },
} as const;
