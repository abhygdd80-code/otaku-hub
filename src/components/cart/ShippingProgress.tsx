'use client';

import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/lib/utils';
import { useCart } from './CartContext';

/** Orders at or above this subtotal ship free. */
export const FREE_SHIPPING_THRESHOLD = 100;

/**
 * Animated free-shipping progress bar shown inside the cart drawer.
 *
 * Auto-updates as the cart changes: the bar animates toward the new
 * subtotal and the "remaining to unlock" copy recalculates live.
 * Once the threshold is crossed the bar flips to a success state.
 *
 * Renders nothing when the cart is empty.
 */
export function ShippingProgress() {
  const { subtotal } = useCart();

  if (subtotal === 0) return null;

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const percent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const unlocked = remaining === 0;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
            unlocked
              ? 'border-success/30 bg-success/10 text-success'
              : 'border-accent/30 bg-accent/10 text-accent'
          )}
        >
          <Truck className="h-4 w-4" aria-hidden="true" />
        </span>

        <motion.p
          key={unlocked ? 'unlocked' : 'locked'}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="text-xs font-semibold leading-snug text-white"
        >
          {unlocked ? (
            <>
              You&rsquo;ve unlocked <span className="text-success">FREE</span>{' '}
              shipping!
            </>
          ) : (
            <>
              You&rsquo;re{' '}
              <span className="text-accent">{formatPrice(remaining)}</span> away
              from free shipping
            </>
          )}
        </motion.p>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-label="Progress toward free shipping"
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
      >
        <motion.div
          className={cn(
            'h-full rounded-full',
            unlocked
              ? 'bg-success shadow-[0_0_12px_rgba(34,197,94,0.6)]'
              : 'bg-accent shadow-[0_0_12px_rgba(229,9,20,0.5)]'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 22 }}
        />
      </div>
    </div>
  );
}
