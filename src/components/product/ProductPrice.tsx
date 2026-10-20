'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/lib/utils';

export interface ProductPriceProps {
  /** Price in the supplied currency */
  price: number;
  /** ISO 4217 currency code (e.g. "INR", "USD") */
  currencyCode?: string;
  /** Optional compare-at price (strikethrough) */
  compareAtPrice?: number | null;
  /** Compare-at price currency code */
  compareAtCurrencyCode?: string;
  className?: string;
}

/**
 * Product price display with optional compare-at strikethrough.
 * Animates in on mount via Framer Motion.
 */
export function ProductPrice({
  price,
  currencyCode = 'INR',
  compareAtPrice,
  compareAtCurrencyCode,
  className,
}: ProductPriceProps) {
  const formatted = formatPrice(price, currencyCode);
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
          {formatPrice(compareAtPrice!, compareAtCurrencyCode ?? currencyCode)}
        </span>
      )}
    </motion.div>
  );
}
