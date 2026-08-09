'use client';

import { useSyncExternalStore } from 'react';
import {
  subscribeCatalog,
  getCatalogSnapshot,
  getCatalogServerSnapshot,
} from '@/features/catalog';
import type { Product } from '@/data/products';

/**
 * Client-side hook that reacts to catalog changes via `useSyncExternalStore`.
 *
 * Returns the current product catalog. When Shopify is configured and the
 * `CatalogHydrator` has populated the store, this returns live Shopify
 * products; otherwise it falls back to the built-in local catalog.
 *
 * @example
 * ```tsx
 * const products = useCatalogProducts();
 * const featured = products.find(p => p.featured);
 * ```
 */
export function useCatalogProducts(): Product[] {
  return useSyncExternalStore(
    subscribeCatalog,
    getCatalogSnapshot,
    getCatalogServerSnapshot
  );
}
