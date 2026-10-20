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

// ─── Request deduplication cache ────────────────────────────────────
// In-flight / completed search requests are cached by normalized query
// so that identical concurrent or repeated queries reuse the same
// Shopify request. Completed entries expire and the cache is bounded;
// failures and empty results are evicted so a retry can proceed.

const SEARCH_CACHE_TTL_MS = 60_000;
const MAX_SEARCH_CACHE_ENTRIES = 100;

type SearchCacheEntry = {
  promise: Promise<SearchResultItem[]>;
  expiresAt: number | null;
};

const searchCache = new Map<string, SearchCacheEntry>();

function normalizeQuery(raw: string): string {
  return raw.trim();
}

function pruneSearchCache(now: number): void {
  for (const [key, entry] of searchCache) {
    if (entry.expiresAt !== null && entry.expiresAt <= now) {
      searchCache.delete(key);
    }
  }

  // Keep in-flight entries for request deduplication. They are removed when
  // settled, while completed entries are evicted oldest-first at the bound.
  while (searchCache.size >= MAX_SEARCH_CACHE_ENTRIES) {
    const oldestCompleted = [...searchCache.entries()].find(
      ([, entry]) => entry.expiresAt !== null
    );

    if (!oldestCompleted) break;
    searchCache.delete(oldestCompleted[0]);
  }
}

/**
 * Search the Shopify storefront by query and return ranked results.
 * A relevance score is synthesised from position (closer = better),
 * the same way the original fuzzy engine ranks.
 *
 * Deduplicates identical concurrent or repeated queries by normalizing
 * the query (trim) and reusing the in-flight or completed Promise.
 * Successful non-empty results are cached briefly; failures and empty
 * results are evicted so a later retry can proceed.
 */
export async function searchShopifyProducts(
  query: string,
  limit: number = DEFAULT_LIMIT
): Promise<SearchResultItem[]> {
  const normalized = normalizeQuery(query);
  const cacheKey = `${normalized}:${limit}`;
  const now = Date.now();

  pruneSearchCache(now);

  // Return existing in-flight or completed request
  const cached = searchCache.get(cacheKey);
  if (cached && (cached.expiresAt === null || cached.expiresAt > now)) {
    return cached.promise;
  }

  if (cached) searchCache.delete(cacheKey);

  // Create the request and store it
  const promise = (async (): Promise<SearchResultItem[]> => {
    const data = await shopifyFetch<PredictiveSearchQueryResponse>(
      PREDICTIVE_SEARCH_QUERY,
      { query: normalized, first: limit }
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
  })();

  let wrappedPromise: Promise<SearchResultItem[]>;
  wrappedPromise = promise.then(
    results => {
      const current = searchCache.get(cacheKey);
      if (current?.promise !== wrappedPromise) return results;

      if (results.length === 0) {
        searchCache.delete(cacheKey);
      } else {
        current.expiresAt = Date.now() + SEARCH_CACHE_TTL_MS;
        pruneSearchCache(Date.now());
      }

      return results;
    },
    error => {
      if (searchCache.get(cacheKey)?.promise === wrappedPromise) {
        searchCache.delete(cacheKey);
      }
      throw error;
    }
  );

  pruneSearchCache(Date.now());
  // If every slot is currently occupied by an in-flight request, do not add
  // another completed-cache entry beyond the bound. The request still runs,
  // but it is intentionally not retained after it settles.
  if (searchCache.size >= MAX_SEARCH_CACHE_ENTRIES) {
    return wrappedPromise;
  }

  searchCache.set(cacheKey, { promise: wrappedPromise, expiresAt: null });
  return wrappedPromise;
}
