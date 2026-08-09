'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { TRENDING_SEARCHES } from '@/features/search';

interface TrendingSearchesProps {
  onSelect: (term: string) => void;
}

/**
 * Static trending searches section shown when no query is active.
 * Displays demo trending search terms as clickable pills.
 */
export function TrendingSearches({ onSelect }: TrendingSearchesProps) {
  if (TRENDING_SEARCHES.length === 0) return null;

  return (
    <section aria-label="Trending searches">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <TrendingUp className="w-3 h-3" aria-hidden="true" />
        Trending Searches
      </h3>

      <div
        className="flex flex-wrap gap-2"
        role="list"
        aria-label="Trending search terms"
      >
        {TRENDING_SEARCHES.map((term, index) => (
          <div key={`${term}-${index}`} role="listitem">
            <button
              type="button"
              onClick={() => onSelect(term)}
              className="px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-sm text-accent hover:bg-accent/20 hover:border-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={`Search trending: "${term}"`}
            >
              {term}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
