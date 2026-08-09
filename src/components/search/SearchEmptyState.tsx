'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { SearchX, Sparkles } from 'lucide-react';
import { staggerContainer, fadeInUp } from '@/animations/framer/variants';
import { DURATION } from '@/constants';
import { TRENDING_SEARCHES } from '@/features/search';

interface SearchEmptyStateProps {
  query: string;
  onTrendingSelect: (term: string) => void;
}

/**
 * Premium empty state shown when search returns no results.
 * Provides helpful suggestions and popular fallback options,
 * with a staggered cinematic entrance.
 */
export function SearchEmptyState({
  query,
  onTrendingSelect,
}: SearchEmptyStateProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center px-6 py-16 text-center"
    >
      {/* ── Icon ───────────────────────────────────────────── */}
      <motion.div variants={fadeInUp} className="relative mb-6">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface">
          <SearchX
            className="h-7 w-7 text-muted-foreground"
            aria-hidden="true"
          />
          {/* Soft glow */}
          <div
            className="absolute -inset-3 rounded-full bg-accent/5 blur-xl"
            aria-hidden="true"
          />
        </div>
        {/* Animated ring */}
        <span
          className="absolute inset-0 animate-ping rounded-full border border-accent/10"
          aria-hidden="true"
        />
        {/* Sparkle badge */}
        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent/20">
          <Sparkles className="h-3 w-3 text-accent" aria-hidden="true" />
        </div>
      </motion.div>

      {/* ── Message ────────────────────────────────────────── */}
      <motion.div variants={fadeInUp}>
        <h3 className="mb-2 font-display text-lg font-semibold text-primary">
          No results for &ldquo;{query}&rdquo;
        </h3>
        <p className="mb-8 max-w-sm text-sm text-muted-foreground">
          We couldn&apos;t find any products matching your search. Try adjusting
          your keywords or browse our collections.
        </p>
      </motion.div>

      {/* ── Suggestions ───────────────────────────────────── */}
      <motion.div variants={fadeInUp} className="w-full max-w-sm space-y-4">
        {/* Suggestion tips */}
        <div className="space-y-2 text-left text-sm text-secondary-text">
          <p className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60"
              aria-hidden="true"
            />
            Check your spelling
          </p>
          <p className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60"
              aria-hidden="true"
            />
            Try more general keywords
          </p>
          <p className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60"
              aria-hidden="true"
            />
            Browse by{' '}
            <Link
              href="/collections"
              className="text-accent underline underline-offset-2 transition-colors hover:text-accent/80"
              onClick={() => onTrendingSelect('')}
            >
              collection
            </Link>
          </p>
        </div>

        {/* Trending suggestions fallback */}
        <div className="border-t border-border pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Try trending searches
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {TRENDING_SEARCHES.slice(0, 4).map((term, i) => (
              <motion.button
                key={term}
                type="button"
                onClick={() => onTrendingSelect(term)}
                initial={{ opacity: 0, y: 8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.15 + i * DURATION.stagger.normal },
                }}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-secondary-text transition-colors hover:border-accent/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {term}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
