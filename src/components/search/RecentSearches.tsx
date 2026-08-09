'use client';

import React, { useCallback } from 'react';
import { Clock, X } from 'lucide-react';
import { useSearchStore } from '@/store/search-store';

interface RecentSearchesProps {
  onSelect: (term: string) => void;
}

/**
 * Recent searches section displayed when no query is active.
 * Reads from persisted store, allows individual removal and clear-all.
 * Each recent search pill triggers the search when clicked.
 */
export function RecentSearches({ onSelect }: RecentSearchesProps) {
  const recentSearches = useSearchStore(s => s.recentSearches);
  const removeRecentSearch = useSearchStore(s => s.removeRecentSearch);
  const clearRecentSearches = useSearchStore(s => s.clearRecentSearches);

  const handleRemove = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      e.preventDefault();
      removeRecentSearch(index);
    },
    [removeRecentSearch]
  );

  if (recentSearches.length === 0) return null;

  return (
    <section aria-label="Recent searches">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3 h-3" aria-hidden="true" />
          Recent Searches
        </h3>
        <button
          type="button"
          onClick={clearRecentSearches}
          className="text-xs text-accent hover:text-accent/80 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-1"
        >
          Clear All
        </button>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="list"
        aria-label="Recent search terms"
      >
        {recentSearches.map((term, index) => (
          <div
            key={`${term}-${index}`}
            role="listitem"
            className="group relative"
          >
            {/* Pill wrapper — non-interactive so the term and remove
                controls are siblings (nested buttons are invalid ARIA). */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border text-sm text-secondary-text hover:text-primary hover:border-accent/40 transition-colors">
              {/* Term — activates the search */}
              <span
                role="button"
                tabIndex={0}
                onClick={() => onSelect(term)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(term);
                  }
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                aria-label={`Search for "${term}"`}
              >
                {term}
              </span>
              {/* Remove — deletes this term */}
              <span
                role="button"
                tabIndex={0}
                onClick={e => handleRemove(e, index)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    removeRecentSearch(index);
                  }
                }}
                className="ml-1 p-0.5 rounded-full text-zinc-600 hover:text-foreground hover:bg-border/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={`Remove "${term}" from recent searches`}
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
