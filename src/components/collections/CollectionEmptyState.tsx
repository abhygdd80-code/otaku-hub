'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { SearchX, RotateCcw, Sparkles } from 'lucide-react';
import { fadeInUp } from '@/animations/framer/variants';
import { ROUTES } from '@/constants';

interface CollectionEmptyStateProps {
  /** Callback to reset all filters to defaults */
  onResetFilters: () => void;
}

/**
 * Premium "No Products Found" screen with reset button.
 * Shown when active filters produce zero results.
 */
export function CollectionEmptyState({
  onResetFilters,
}: CollectionEmptyStateProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center px-4 py-24 text-center"
      role="status"
    >
      {/* ── Icon ───────────────────────────────────────────── */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mb-8"
      >
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-accent/20 bg-accent/10">
          <SearchX className="h-10 w-10 text-accent/60" aria-hidden="true" />
          {/* Soft glow */}
          <div
            className="absolute -inset-4 rounded-full bg-accent/5 blur-xl"
            aria-hidden="true"
          />
        </div>
        {/* Animated rings */}
        <span
          className="absolute inset-0 animate-ping rounded-full border border-accent/10"
          aria-hidden="true"
        />
        {/* Sparkle badge */}
        <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent/20">
          <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        </div>
      </motion.div>

      {/* ── Text ───────────────────────────────────────────── */}
      <h2 className="mb-3 font-display text-2xl font-bold text-primary">
        No Products Found
      </h2>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-secondary-text">
        We couldn&apos;t find any products matching your current filters. Try
        adjusting your selection or browse the full collection.
      </p>

      {/* ── Actions ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-[0_0_30px_rgba(229,9,20,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Clear all filters and show all products"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset Filters
        </button>
        <Link
          href={ROUTES.shop}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-zinc-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
          Browse All Products
        </Link>
      </div>
    </motion.div>
  );
}
