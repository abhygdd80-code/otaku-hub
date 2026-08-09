'use client';

import Link from 'next/link';
import { cn } from '@/utils/cn';
import type { Product } from '@/data/products';

export interface RecentlyViewedCardProps {
  product: Product;
  className?: string;
}

/**
 * Compact rail card for the Recently Viewed slider — gradient thumbnail,
 * category, name and price. Links to the product detail page.
 */
export function RecentlyViewedCard({
  product,
  className,
}: RecentlyViewedCardProps) {
  return (
    <Link
      href={product.href}
      className={cn(
        'group flex w-40 sm:w-48 shrink-0 snap-start flex-col overflow-hidden rounded-xl',
        'border border-white/[0.06] bg-white/[0.02]',
        'transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-white/[0.04]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      aria-label={`${product.name} — $${product.price.toFixed(2)}`}
    >
      {/* Gradient thumbnail */}
      <span
        className={cn('relative h-32 w-full overflow-hidden', product.gradient)}
        aria-hidden="true"
      >
        <span className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <span className="absolute inset-0 bg-accent/0 transition-colors duration-300 group-hover:bg-accent/10" />
      </span>

      <span className="p-3">
        <span className="block truncate text-[11px] font-semibold uppercase tracking-widest text-accent">
          {product.category}
        </span>
        <span className="mt-1 block truncate text-sm font-bold text-white transition-colors group-hover:text-accent">
          {product.name}
        </span>
        <span className="mt-1 block text-sm font-bold text-zinc-300">
          ${product.price.toFixed(2)}
        </span>
      </span>
    </Link>
  );
}
