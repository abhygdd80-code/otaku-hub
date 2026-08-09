// ─── Shopify Collection API ─────────────────────────────────────────
// Fetches collections and their products from the live storefront.
// When Shopify is configured, the collection page and homepage source
// real Shopify collections; otherwise the local tag-based logic is used.

import type { Product } from '@/data/products';
import { shopifyFetch } from './client';
import { mapShopifyProduct } from './mappers';
import { COLLECTIONS_QUERY, COLLECTION_PRODUCTS_QUERY } from './queries';
import type {
  CollectionsQueryResponse,
  CollectionProductsQueryResponse,
} from './types';

/** Maximum collections to retrieve in a single request. */
const MAX_COLLECTIONS = 25;

/** Maximum products per collection to retrieve in a single request. */
const MAX_PRODUCTS_PER_COLLECTION = 100;

/**
 * All available Shopify collections.
 * Returns an empty array on error (no crash — fallback to local catalog).
 */
export async function fetchShopifyCollections(): Promise<
  { handle: string; title: string; description?: string | null }[]
> {
  const data = await shopifyFetch<CollectionsQueryResponse>(COLLECTIONS_QUERY, {
    first: MAX_COLLECTIONS,
  });
  return data.collections.edges.map(e => e.node);
}

/**
 * Fetch all products in a Shopify collection by handle.
 * Returns an empty array if the collection doesn't exist.
 */
export async function fetchShopifyCollectionProducts(
  collectionHandle: string
): Promise<Product[]> {
  const data = await shopifyFetch<CollectionProductsQueryResponse>(
    COLLECTION_PRODUCTS_QUERY,
    { handle: collectionHandle, first: MAX_PRODUCTS_PER_COLLECTION }
  );

  if (!data.collection) return [];
  return data.collection.products.edges.map(e => mapShopifyProduct(e.node));
}
