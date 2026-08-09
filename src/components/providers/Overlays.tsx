'use client';

import dynamic from 'next/dynamic';

/**
 * Lazily-loaded overlay shells — cart drawer, quick view, size guide,
 * and compare drawer.
 *
 * Each overlay renders nothing until it is opened (all are gated on an
 * `isOpen` flag), so splitting them out of the initial bundle is
 * invisible to the user while cutting the initial client JS payload by
 * ~1.8k lines of drawer/modal code. The chunks load on first open.
 *
 * Mounted inside `AppProviders` so the overlays stay within the
 * provider tree they consume (Cart / QuickView / SizeGuide / Compare).
 */
const CartDrawer = dynamic(
  () => import('@/components/cart/CartDrawer').then(m => m.CartDrawer),
  { ssr: false }
);

const QuickViewModal = dynamic(
  () =>
    import('@/components/quickview/QuickViewModal').then(m => m.QuickViewModal),
  { ssr: false }
);

const SizeGuideModal = dynamic(
  () =>
    import('@/components/sizeguide/SizeGuideModal').then(m => m.SizeGuideModal),
  { ssr: false }
);

const CompareDrawer = dynamic(
  () => import('@/components/compare/CompareDrawer').then(m => m.CompareDrawer),
  { ssr: false }
);

export function Overlays() {
  return (
    <>
      <CartDrawer />
      <QuickViewModal />
      <SizeGuideModal />
      <CompareDrawer />
    </>
  );
}

export default Overlays;
