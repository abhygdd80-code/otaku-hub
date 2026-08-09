'use client';

import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { SearchResultItem } from '@/features/search';
import { SearchResult } from './SearchResult';

interface SearchGridProps {
  results: SearchResultItem[];
  /** Called when a result is selected (clicked or navigated to) */
  onSelect?: () => void;
  /** Currently highlighted index for keyboard navigation */
  highlightedIndex?: number;
}

/**
 * Animated grid of search results with stagger reveal.
 * Each result links to the product detail page.
 */
export function SearchGrid({
  results,
  onSelect,
  highlightedIndex = -1,
}: SearchGridProps) {
  const staggerVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 12 },
      visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * 0.04,
          duration: 0.3,
          ease: 'easeOut' as const,
        },
      }),
    }),
    []
  );

  const handleSelect = useCallback(() => {
    onSelect?.();
  }, [onSelect]);

  if (results.length === 0) return null;

  return (
    <div
      id="search-results"
      role="listbox"
      aria-label="Search results"
      className="space-y-1"
    >
      {/* Results count */}
      <p className="px-5 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {results.length} {results.length === 1 ? 'Result' : 'Results'}
      </p>

      {/* Result items */}
      {results.map((item, index) => (
        <motion.div
          key={item.product.id}
          custom={index}
          initial="hidden"
          animate="visible"
          variants={staggerVariants}
        >
          <SearchResult
            product={item.product}
            index={index}
            isHighlighted={index === highlightedIndex}
            onSelect={handleSelect}
          />
        </motion.div>
      ))}
    </div>
  );
}
