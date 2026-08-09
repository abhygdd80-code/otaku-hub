'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface ProductPriceProps {
  /** Price in whole dollars */
  price: number;
  /** Optional compare-at price (strikethrough) */
  compareAtPrice?: number | null;
  className?: string;
}

/**
 * Product price display with optional compare-at strikethrough.
 * Animates in on mount via Framer Motion.
 */
export function ProductPrice({
  price,
  compareAtPrice,
  className,
}: ProductPriceProps) {
  const formatted = `$${price.toFixed(2)}`;
  const hasDiscount = compareAtPrice != null && compareAtPrice > price;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn('flex items-baseline gap-3', className)}
    >
      <span className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
        {formatted}
      </span>

      {hasDiscount && (
        <span className="text-lg text-zinc-500 line-through decoration-zinc-600">
          ${compareAtPrice!.toFixed(2)}
        </span>
      )}
    </motion.div>
  );
}
