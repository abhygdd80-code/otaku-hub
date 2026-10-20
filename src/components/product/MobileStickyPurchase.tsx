'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/lib/utils';
import { Z_INDEX } from '@/constants';
import { AddToCartButton } from './AddToCartButton';
import { WishlistButton } from '@/components/wishlist/WishlistButton';

export interface MobileStickyPurchaseProps {
  /** Product name used in button labels */
  productName: string;
  /** Product handle used by the wishlist toggle */
  productHandle: string;
  /** Price in the supplied currency */
  price: number;
  /** ISO 4217 currency code for the price */
  currencyCode?: string;
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
  currencyCode = 'INR',
  compareAtPrice,
  onAddToCart,
  disabled = false,
  targetRef,
}: MobileStickyPurchaseProps) {
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const updateVisibility = (nextVisible: boolean) => {
      // Do not leave keyboard users focused on a control that is about to be
      // removed when they scroll back to the primary purchase block.
      if (!nextVisible && barRef.current?.contains(document.activeElement)) {
        const replacement = target.querySelector<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        );
        replacement?.focus();
      }

      setVisible(nextVisible);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Keep the bar hidden on the initial page load when the purchase
        // block starts below the fold. A non-zero scroll position is enough
        // to distinguish that state without a second scroll listener.
        updateVisibility(window.scrollY > 0 && !entry.isIntersecting);
      },
      // Shrink the bottom of the observation window so the bar appears
      // just before the block fully exits — no dead zone mid-scroll.
      { rootMargin: '0px 0px -72px 0px' }
    );
    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [targetRef]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={barRef}
          role="region"
          aria-label="Sticky purchase options"
          initial={prefersReducedMotion ? false : { y: 96 }}
          animate={{ y: 0 }}
          exit={prefersReducedMotion ? undefined : { y: 96 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.3, ease: 'easeOut' }
          }
          style={{
            // Keep page content below the bar, while leaving the navbar and
            // drawer/modal layers free to cover it when they are open.
            zIndex: Z_INDEX.navbar - 1,
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)',
          }}
          className={cn(
            'fixed inset-x-0 bottom-0 lg:hidden',
            'border-t border-white/[0.08] bg-background/85 backdrop-blur-xl',
            'pt-2.5'
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
                  {formatPrice(price, currencyCode)}
                </span>
                {compareAtPrice != null && compareAtPrice > price && (
                  <span className="text-xs text-zinc-500 line-through">
                    {formatPrice(compareAtPrice, currencyCode)}
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
