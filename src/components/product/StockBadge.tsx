'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { getInventoryInfo, type InventoryStatus } from '@/data/inventory';

export interface StockBadgeProps {
  /** Product handle used to resolve the mock stock level */
  productHandle: string;
  className?: string;
}

const TONE: Record<
  InventoryStatus,
  { dot: string; text: string; chip: string }
> = {
  'in-stock': {
    dot: 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.7)]',
    text: 'text-success',
    chip: 'border-success/25 bg-success/[0.06]',
  },
  'only-n-left': {
    dot: 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.7)]',
    text: 'text-warning',
    chip: 'border-warning/30 bg-warning/[0.06]',
  },
  'low-stock': {
    dot: 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    text: 'text-warning',
    chip: 'border-warning/20 bg-warning/[0.05]',
  },
  'out-of-stock': {
    dot: 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.7)]',
    text: 'text-destructive',
    chip: 'border-destructive/30 bg-destructive/[0.06]',
  },
};

/**
 * Compact live inventory status chip for the product page.
 *
 * Resolves the (mock) stock level via `getInventoryInfo`, then shows
 * a colored status dot + label. The dot pulses gently on mount; the
 * whole chip fades up. Announces via `role="status"` so screen readers
 * hear the stock state without focus.
 *
 * ── States ──────────────────────────────────────────────
 * In Stock (green) · Only N Left (amber) · Low Stock (amber)
 * Out of Stock (red).
 */
export function StockBadge({ productHandle, className }: StockBadgeProps) {
  const { status, label, quantity } = getInventoryInfo(productHandle);
  const tone = TONE[status];

  return (
    <motion.span
      role="status"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1',
        tone.chip,
        className
      )}
    >
      <motion.span
        aria-hidden="true"
        className={cn('h-1.5 w-1.5 rounded-full', tone.dot)}
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span
        className={cn('text-xs font-bold uppercase tracking-wider', tone.text)}
      >
        {label}
      </span>
      <span className="sr-only">
        {status === 'in-stock'
          ? 'In stock'
          : status === 'out-of-stock'
            ? 'Out of stock'
            : `${quantity} units remaining`}
      </span>
    </motion.span>
  );
}
