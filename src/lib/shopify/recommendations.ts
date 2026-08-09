// ─── Shopify Product Recommendations API ────────────────────────────
// Fetches the storefront's product associations for two intents:
//   RELATED        — products Shopify considers related ("customers also bought")
//   COMPLEMENTARY  — products that complete the item ("complete the look" / FBT)
//
// Always called behind `isShopifyConfigured()`; the local scoring engine
// in `lib/products.ts` remains the fallback when the fetch fails or the
// store returns nothing.

import type { Product } from '@/data/products';
import { shopifyFetch } from './client';
import { mapShopifyProduct } from './mappers';
import { PRODUCT_RECOMMENDATIONS_QUERY } from './queries';
import type {
  ProductRecommendationsQueryResponse,
  ShopifyRecommendationIntent,
} from './types';

/**
 * Fetch recommendations for a product id + intent.
 * Returns an empty array when the store has no associations.
 */
export async function fetchProductRecommendations(
  productId: string,
  intent: ShopifyRecommendationIntent = 'RELATED'
): Promise<Product[]> {
  const data = await shopifyFetch<ProductRecommendationsQueryResponse>(
    PRODUCT_RECOMMENDATIONS_QUERY,
    {
      productId,
      intent,
    }
  );

  return (data.productRecommendations ?? []).map(mapShopifyProduct);
}

/** De-duplicate products by handle, preserving order. */
export function dedupeProducts(products: Product[]): Product[] {
  const seen = new Set<string>();
  const result: Product[] = [];
  for (const product of products) {
    if (seen.has(product.handle)) continue;
    seen.add(product.handle);
    result.push(product);
  }
  return result;
}
