// ─── Shopify Search API ────────────────────────────────────────────
// Predictive search via the Storefront API, returning results in the
// app's native `SearchResultItem` shape so the search dialog works
// unchanged regardless of data source.

import type { SearchResultItem } from '@/features/search';
import { shopifyFetch } from './client';
import { mapPredictiveProduct } from './mappers';
import { PREDICTIVE_SEARCH_QUERY } from './queries';
import type { PredictiveSearchQueryResponse } from './types';

/**
 * Default search limit — matches the original local search's tendency
 * to surface a handful of top results.
 */
const DEFAULT_LIMIT = 20;

/**
 * Search the Shopify storefront by query and return ranked results.
 * A relevance score is synthesised from position (closer = better),
 * the same way the original fuzzy engine ranks.
 */
export async function searchShopifyProducts(
  query: string,
  limit: number = DEFAULT_LIMIT
): Promise<SearchResultItem[]> {
  const data = await shopifyFetch<PredictiveSearchQueryResponse>(
    PREDICTIVE_SEARCH_QUERY,
    { query, first: limit }
  );

  const results: SearchResultItem[] = [];
  const edges = data.predictiveSearch?.products.edges ?? [];

  for (let i = 0; i < edges.length; i++) {
    const product = mapPredictiveProduct(edges[i].node);
    // Position-weighted score: closer to top = higher score.
    const score = 100 - i * 2;
    results.push({ product, score: Math.max(score, 1) });
  }

  return results;
}
