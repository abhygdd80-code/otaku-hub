'use client';

import { useCallback, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { Product } from '@/data/products';
import { ProductCard } from '@/components/featured/ProductCard';

export interface RelatedProductsProps {
  /** Recommended products (should exclude the current PDP product) */
  products: Product[];
  /** Label above the rail */
  title?: string;
  className?: string;
}

/**
 * "You May Also Like" — responsive carousel of recommended products.
 *
 * Wired to the smart `getRecommendedProducts` scoring (same category →
 * shared tags → similar price → bestsellers) via the PDP. Reuses
 * `ProductCard` for visual + interaction consistency.
 *
 * ── Layout ─────────────────────────────────────────────
 * Snapped horizontal rail: ~1 card on mobile, 2 on small, 3 on
 * tablet, 4 on desktop, with a partial peek inviting a swipe.
 *
 * ── Animation ──────────────────────────────────────────
 * Framer Motion fade-up with stagger (skipped under
 * `prefers-reduced-motion` via the global MotionConfig).
 *
 * ── Interactions ───────────────────────────────────────
 * Keyboard-accessible arrow buttons page the rail by the visible
 * width; swipe works on touch. Renders nothing if empty.
 */
export function RelatedProducts({
  products,
  title = 'You May Also Like',
  className,
}: RelatedProductsProps) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollRail = useCallback((direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * rail.clientWidth * 0.9,
      behavior: 'smooth',
    });
  }, []);

  if (!products.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
      className={cn('space-y-8', className)}
    >
      {/* ── Section header ────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <p className="text-xs font-bold text-accent tracking-[0.25em] uppercase">
            More to Explore
          </p>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollRail(-1)}
            aria-label="Scroll recommendations left"
            className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-300 transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollRail(1)}
            aria-label="Scroll recommendations right"
            className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-300 transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ── Carousel rail ─────────────────────────────────────── */}
      <div
        ref={railRef}
        className="flex snap-x snap-mandatory gap-5 sm:gap-6 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
      >
        <div className="sr-only">
          Horizontal carousel of recommended products. Use the arrow buttons or
          swipe to browse.
        </div>
        {products.map((product, i) => (
          <motion.div
            key={product.handle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 * i, ease: 'easeOut' }}
            className="w-[80%] sm:w-1/2 lg:w-1/4 shrink-0 snap-start"
          >
            <ProductCard
              name={product.name}
              category={product.category}
              price={product.price}
              currencyCode={product.currencyCode}
              badge={product.badge}
              gradient={product.gradient}
              href={product.href}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
