// ─── Shopify Product API ───────────────────────────────────────────
// Async product retrieval from the live storefront. These are only ever
// called when `isShopifyConfigured()` is true; adapters fall back to the
// local catalog on any error.

import type { Product } from '@/data/products';
import { shopifyFetch } from './client';
import { mapShopifyProduct } from './mappers';
import { PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY } from './queries';
import type {
  ProductsQueryResponse,
  ProductByHandleQueryResponse,
} from './types';

/** Page size for catalog fetches. */
const PAGE_SIZE = 100;

/** Maximum pages to walk for the full catalog (safety cap). */
const MAX_PAGES = 5;

/**
 * Fetch the full product catalog from Shopify (paginated).
 * Returns an empty array if the store returns nothing.
 */
export async function fetchShopifyProducts(): Promise<Product[]> {
  const products: Product[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const data: ProductsQueryResponse =
      await shopifyFetch<ProductsQueryResponse>(PRODUCTS_QUERY, {
        first: PAGE_SIZE,
        cursor,
      });

    const edges: ProductsQueryResponse['products']['edges'] =
      data.products.edges;
    for (const edge of edges) {
      products.push(mapShopifyProduct(edge.node));
    }

    if (edges.length < PAGE_SIZE) break;
    const last = edges[edges.length - 1];
    cursor = last?.cursor ?? null;
    if (!cursor) break;
  }

  return products;
}

/**
 * Fetch a single product by handle. Returns `undefined` when the store
 * has no product with that handle.
 */
export async function fetchShopifyProductByHandle(
  handle: string
): Promise<Product | undefined> {
  const data = await shopifyFetch<ProductByHandleQueryResponse>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle }
  );

  if (!data.product) return undefined;
  return mapShopifyProduct(data.product);
}
