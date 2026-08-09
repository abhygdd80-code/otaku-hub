'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface CollectionSkeletonProps {
  count?: number;
}

/**
 * Animated skeleton grid that matches ProductCard layout.
 * Used during page loading / dynamic import suspense.
 */
export function CollectionSkeleton({ count = 8 }: CollectionSkeletonProps) {
  return (
    <div className="space-y-8" aria-hidden="true">
      {/* Header skeleton */}
      <div className="space-y-4 pb-8 border-b border-border">
        <Skeleton variant="text" className="h-4 w-32" />
        <Skeleton variant="text" className="h-12 w-3/4 sm:h-16" />
        <Skeleton variant="text" className="h-4 w-full max-w-md" />
        <Skeleton variant="text" className="h-6 w-28 rounded-full" />
      </div>

      {/* Sort bar skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <Skeleton variant="text" className="h-5 w-24" />
        <Skeleton variant="rectangular" className="h-10 w-40 rounded-xl" />
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {Array.from({ length: count }).map((_, i) => (
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
