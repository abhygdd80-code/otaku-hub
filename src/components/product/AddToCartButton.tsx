'use client';

import { useState, useCallback } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AddToCartButtonProps {
  /** Product name used in the toast message */
  productName: string;
  /** Disable interactions (e.g. variant not selected) */
  disabled?: boolean;
  className?: string;
  /** Called when the user clicks add to cart */
  onAddToCart?: () => void;
}

/**
 * Full-width add-to-cart button with the OtakuSaga shine-sweep hover effect.
 *
 * ── Behaviour ──────────────────────────────────────────────
 * • 800 ms simulated "adding" state.
 * • Success toast with the product name.
 * • `disabled` prop for out-of-stock / no-variant-selected states.
 *
 * The confirmation toast is fired by `useCart().addToCart` (the single
 * source of truth for cart mutations) — this button only animates the
 * adding state so the two never stack.
 */
export function AddToCartButton({
  productName,
  disabled = false,
  className,
  onAddToCart,
}: AddToCartButtonProps) {
  const [adding, setAdding] = useState(false);

  const handleClick = useCallback(() => {
    if (disabled || adding) return;

    setAdding(true);
    onAddToCart?.();

    // Simulate network delay before re-arming the button
    setTimeout(() => {
      setAdding(false);
    }, 800);
  }, [disabled, adding, productName, onAddToCart]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || adding}
      className={cn(
        'group relative w-full overflow-hidden',
        'px-6 py-4 rounded-xl',
        'bg-accent text-white',
        'font-bold text-sm tracking-wider uppercase',
        'transition-all duration-300',
        'hover:shadow-[0_0_30px_rgba(229,9,20,0.4)]',
        'hover:-translate-y-0.5 active:translate-y-0',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      aria-label={adding ? 'Adding to cart…' : `Add ${productName} to cart`}
    >
      {/* Shine sweep */}
      <span
        className={cn(
          'absolute inset-0 -translate-x-full',
          'bg-gradient-to-r from-transparent via-white/15 to-transparent',
          'transition-transform duration-700',
          'group-hover:translate-x-full',
          'group-disabled:transition-none'
        )}
      />

      <span className="relative z-10 inline-flex items-center justify-center gap-2.5">
        {adding ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Adding…</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Cart</span>
          </>
        )}
      </span>
    </button>
  );
}
