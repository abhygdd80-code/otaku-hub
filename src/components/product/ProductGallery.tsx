'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { ProductImage } from '@/data/products';

export interface ProductGalleryProps {
  /** Array of gradient-placeholder images from the product data */
  images: ProductImage[];
  /** Product name used in aria-labels */
  productName: string;
  className?: string;
}

/**
 * Gradient-placeholder product gallery with thumbnail navigation.
 *
 * ── Layout ─────────────────────────────────────────────
 * • Main image area (`aspect-[4/5]`) displaying the active gradient.
 * • Horizontal thumbnail strip below.
 *
 * ── Animations ─────────────────────────────────────────
 * • Entry: container fades in + y-offset via Framer Motion.
 * • Image switch: cross-fade via `AnimatePresence`.
 * • Thumbnail active state: accent border + background scale.
 *
 * ── Visual language ────────────────────────────────────
 * Matches the homepage card aesthetics:
 * • Noise texture overlay at 0.04 opacity.
 * • Vignette gradient from background.
 * • Glass edge ring (`ring-1 ring-inset ring-white/[0.04]`).
 * • Rounded corners consistent with the rest of the site.
 */
export function ProductGallery({
  images,
  productName,
  className,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = images[activeIndex];

  const handleThumbnailClick = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // ── Empty state ─────────────────────────────────────
  if (!images.length) {
    return (
      <div
        className={cn(
          'aspect-[4/5] rounded-2xl bg-surface border border-white/[0.06]',
          'flex items-center justify-center',
          className
        )}
      >
        <span className="text-xs text-zinc-500 uppercase tracking-wider">
          No images available
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={cn('space-y-4', className)}
    >
      {/* ── Main image ─────────────────────────────────── */}
      <div
        className={cn(
          'relative aspect-[4/5] w-full overflow-hidden rounded-2xl',
          'border border-white/[0.06] bg-surface',
          'group cursor-crosshair'
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            {/* Gradient placeholder */}
            <div
              className={cn(
                'absolute inset-0 transition-transform duration-700 ease-out',
                'group-hover:scale-105',
                activeImage.gradient
              )}
            />

            {/* Noise texture */}
            <div className="texture-noise absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" />

            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/10" />
          </motion.div>
        </AnimatePresence>

        {/* Glass edge ring */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.04] pointer-events-none" />

        {/* Image counter badge */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-black/60 backdrop-blur-sm rounded-md">
            {activeIndex + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* ── Thumbnail strip ────────────────────────────── */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
          {images.map((img, i) => {
            const active = i === activeIndex;
            return (
              <motion.button
                key={i}
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleThumbnailClick(i)}
                className={cn(
                  'relative shrink-0 w-20 h-20 overflow-hidden rounded-xl',
                  'border transition-all duration-300',
                  active
                    ? 'border-accent ring-1 ring-accent/30'
                    : 'border-white/[0.06] hover:border-white/20',
                  'bg-surface'
                )}
                aria-label={`${productName} — view ${i + 1}`}
                aria-current={active ? 'true' : undefined}
              >
                {/* Gradient swatch */}
                <div
                  className={cn(
                    'absolute inset-0 transition-transform duration-500',
                    'group-hover:scale-110',
                    img.gradient
                  )}
                />

                {/* Noise */}
                <div className="texture-noise absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" />

                {/* Active indicator line */}
                {active && (
                  <motion.div
                    layoutId="thumbnail-active"
                    className="absolute inset-x-2 bottom-0 h-0.5 bg-accent rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}

                {/* Glass edge ring */}
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/[0.04] pointer-events-none" />
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
