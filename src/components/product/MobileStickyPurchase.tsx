'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { AddToCartButton } from './AddToCartButton';
import { WishlistButton } from '@/components/wishlist/WishlistButton';

export interface MobileStickyPurchaseProps {
  /** Product name used in button labels */
  productName: string;
  /** Product handle used by the wishlist toggle */
  productHandle: string;
  /** Price in whole dollars */
  price: number;
  /** Optional compare-at price (strikethrough) */
  compareAtPrice?: number | null;
  /** Called when add-to-cart is pressed (reuses the main panel handler) */
  onAddToCart: () => void;
  /** Disable interactions (e.g. out of stock) */
  disabled?: boolean;
  /** While this block is in view the bar stays hidden */
  targetRef: React.RefObject<HTMLElement | null>;
}

/**
 * Mobile-only sticky purchase bar.
 *
 * Pins price + Add to Cart to the bottom of the viewport once the main
 * purchase block scrolls out of view, so the buy action is always one
 * tap away while browsing the gallery, reviews, and recommendations.
 *
 * ── Behaviour ──────────────────────────────────────────────
 * • IntersectionObserver on the main purchase block — when it leaves
 *   the viewport after the user has scrolled down, the bar slides in.
 *   Scrolling back up to the block hides it again.
 * • `lg:hidden` — desktop keeps the in-panel sticky column instead.
 * • `AnimatePresence` slide-up/slide-down honoring the global
 *   `prefers-reduced-motion` (MotionConfig in AppProviders).
 *
 * ── Accessibility ──────────────────────────────────────────
 * The bar reuses the same labelled Add-to-Cart and Wishlist buttons as
 * the main panel, so focus and aria-labels stay consistent. It is never
 * focus-trapped; keyboard users tab to it normally once it appears.
 */
export function MobileStickyPurchase({
  productName,
  productHandle,
  price,
  compareAtPrice,
  onAddToCart,
  disabled = false,
  targetRef,
}: MobileStickyPurchaseProps) {
  const [visible, setVisible] = useState(false);

  // Track whether the user has actually scrolled down the page. This
  // guards against flashing the bar on short viewports where the
  // purchase block starts below the fold on first paint.
  const scrolledDown = useRef(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    let lastY = window.scrollY;
    const onScroll = () => {
      if (window.scrollY > lastY + 4) scrolledDown.current = true;
      lastY = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show only once the block has left the viewport and the page
        // has been scrolled down at all.
        setVisible(scrolledDown.current && !entry.isIntersecting);
      },
      // Shrink the bottom of the observation window so the bar appears
      // just before the block fully exits — no dead zone mid-scroll.
      { rootMargin: '0px 0px -72px 0px' }
    );
    observer.observe(target);

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [targetRef]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 96 }}
          animate={{ y: 0 }}
          exit={{ y: 96 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'fixed inset-x-0 bottom-0 z-40 lg:hidden',
            'border-t border-white/[0.08] bg-background/85 backdrop-blur-xl',
            'pt-2.5 pb-[max(env(safe-area-inset-bottom),0.75rem)]'
          )}
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4">
            {/* ── Price ─────────────────────────────────────── */}
            <div className="shrink-0 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Total
              </p>
              <p className="flex items-baseline gap-2">
                <span className="font-display text-lg font-extrabold text-white tabular-nums">
                  ${price.toFixed(2)}
                </span>
                {compareAtPrice != null && compareAtPrice > price && (
                  <span className="text-xs text-zinc-500 line-through">
                    ${compareAtPrice.toFixed(2)}
                  </span>
                )}
              </p>
            </div>

            {/* ── Actions ───────────────────────────────────── */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="min-w-0 flex-1">
                <AddToCartButton
                  productName={productName}
                  onAddToCart={onAddToCart}
                  disabled={disabled}
                  className="px-4 py-3 text-xs"
                />
              </div>
              <WishlistButton
                productHandle={productHandle}
                size="md"
                productName={productName}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
