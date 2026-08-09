'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Skeleton loader for search results.
 * Matches the layout of SearchResult items with a premium shimmer.
 */
export function SearchSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1" aria-hidden="true">
      {/* Results count placeholder */}
      <div className="px-5 py-2">
        <Skeleton variant="text" className="h-3 w-20" />
      </div>

      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 px-5 py-3">
          {/* Image placeholder */}
          <Skeleton
            variant="rectangular"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shrink-0"
          />

          {/* Text placeholders */}
          <div className="flex-1 min-w-0 pt-0.5 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <Skeleton variant="text" className="h-4 w-3/5" />
                <Skeleton variant="text" className="h-3 w-2/5 bg-border/30" />
              </div>
              <Skeleton variant="text" className="h-4 w-14 shrink-0" />
            </div>
            <Skeleton variant="text" className="h-3 w-4/5 bg-border/30" />
          </div>
        </div>
      ))}
    </div>
  );
}
