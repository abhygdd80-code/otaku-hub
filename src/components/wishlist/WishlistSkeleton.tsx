'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Loading skeleton for the wishlist page.
 *
 * Mirrors the wishlist layout — header (pre-label, title, clear-all)
 * followed by the 4-column product grid — so the first paint feels
 * continuous while the persisted wishlist store rehydrates.
 */
export function WishlistSkeleton() {
  return (
    <div className="space-y-10" aria-hidden="true">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton variant="text" className="h-4 w-32" />
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-3">
            <Skeleton variant="text" className="h-12 w-64 sm:h-14 sm:w-80" />
            <Skeleton variant="text" className="h-4 w-40" />
          </div>
          <Skeleton variant="rectangular" className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-surface border border-border/80 p-3 overflow-hidden"
          >
            <Skeleton
              variant="rectangular"
              className="aspect-square w-full rounded-xl"
            />
            <div className="pt-4 pb-2 px-1 space-y-3">
              <Skeleton variant="text" className="h-3 w-20" />
              <Skeleton variant="text" className="h-5 w-full" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton variant="text" className="h-6 w-16" />
                <Skeleton variant="text" className="h-4 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
