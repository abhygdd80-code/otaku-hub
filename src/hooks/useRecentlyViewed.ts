'use client';

import { useMemo } from 'react';
import { useRecentlyViewedStore } from '@/store';
import { getProductByHandle } from '@/lib/products';
import type { Product } from '@/data/products';

/**
 * Reusable hook that provides recently viewed products as full Product
 * objects, mapped from the persisted handle list.
 *
 * Deduplicates against `excludeHandle` (useful on the PDP to hide the
 * current product from the "Recently Viewed" rail).
 *
 * @example
 * ```ts
 * const { products, isLoaded, clear } = useRecentlyViewed();
 * ```
 */
export function useRecentlyViewed(excludeHandle?: string) {
  const items = useRecentlyViewedStore(s => s.items);
  const isLoaded = useRecentlyViewedStore(s => s.isLoaded);
  const clear = useRecentlyViewedStore(s => s.clear);

  const products = useMemo(() => {
    return items
      .map(handle => getProductByHandle(handle))
      .filter(
        (p): p is Product => p !== undefined && p.handle !== excludeHandle
      );
  }, [items, excludeHandle]);

  return { products, isLoaded, clear, count: products.length };
}
