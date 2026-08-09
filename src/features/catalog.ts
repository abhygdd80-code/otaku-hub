// ─── Product Catalog (module-level, swappable) ──────────────────────
// A tiny, synchronous module-level store that all data accessors read
// from. By default it returns the built-in local catalog; when Shopify
// is configured, server pages call `setCatalogProducts()` during render
// and client widgets receive a hydrated catalog via React context.
//
// Client-side, `subscribeCatalog()` provides `useSyncExternalStore`
// support so components react to catalog updates without re-fetching.

import { PRODUCTS, type Product } from '@/data/products';

// ─── Internal state ────────────────────────────────────────────────

let catalogProducts: Product[] | null = null;
const listeners = new Set<() => void>();

// ─── Public API ────────────────────────────────────────────────────

/**
 * Return the active catalog.
 * When no override is set (local dev, no credentials) this returns the
 * built-in `PRODUCTS` array — identical to the pre-Phase 15 behavior.
 */
export function getCatalogProducts(): Product[] {
  return catalogProducts ?? PRODUCTS;
}

/**
 * Replace the active catalog with Shopify-sourced products.
 * Calling this fires all subscribed listeners (client components re-render
 * via `useSyncExternalStore`).
 */
export function setCatalogProducts(products: Product[]): void {
  catalogProducts = products;
  // Fire synchronously so useSyncExternalStore picks up the new snapshot.
  for (const listener of listeners) {
    listener();
  }
}

/** Reset the catalog back to the built-in local products. */
export function resetCatalogProducts(): void {
  catalogProducts = null;
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Subscribe to catalog changes. Returns an unsubscribe function.
 * Used by `useSyncExternalStore` in the client `useCatalogProducts` hook.
 */
export function subscribeCatalog(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Snapshot getter for `useSyncExternalStore`. Must return the same reference
 * for the same logical state so React can detect changes.
 */
export function getCatalogSnapshot(): Product[] {
  return getCatalogProducts();
}

/**
 * Server snapshot getter for `useSyncExternalStore` (required for SSR).
 * Returns the same data as the client snapshot — on the server the catalog
 * is pre-populated by `CatalogHydrator` during the same render pass.
 */
export function getCatalogServerSnapshot(): Product[] {
  return getCatalogProducts();
}
