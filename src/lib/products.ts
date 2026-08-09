import { type Product } from '@/data/products';
import { getCatalogProducts } from '@/features/catalog';

/**
 * Look up a product by its URL-safe handle.
 * Returns `undefined` when no match is found.
 *
 * @example
 *   const hoodie = getProductByHandle('shadow-realm-hoodie');
 *   // → { handle: 'shadow-realm-hoodie', name: 'Shadow Realm Hoodie', … }
 */
export function getProductByHandle(handle: string): Product | undefined {
  return getCatalogProducts().find(p => p.handle === handle);
}

/**
 * Return the full product catalog.
 */
export function getAllProducts(): Product[] {
  return getCatalogProducts();
}

/**
 * Filter products whose `tags` array includes the given tag.
 *
 * @example
 *   getProductsByTag('bestseller')
 *   // → [Shadow Realm Hoodie, …]
 */
export function getProductsByTag(tag: string): Product[] {
  return getCatalogProducts().filter(p => p.tags.includes(tag));
}

/**
 * Return the first product marked as `featured`, or `undefined`.
 */
export function getFeaturedProduct(): Product | undefined {
  return getCatalogProducts().find(p => p.featured);
}

/**
 * Return products sorted by `createdAt` descending (newest first).
 */
export function getNewestProducts(limit?: number): Product[] {
  const sorted = [...getCatalogProducts()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return limit ? sorted.slice(0, limit) : sorted;
}

// ─── Recommended Products ────────────────────────────────────

/**
 * Price window (in dollars) inside which a product is considered
 * "similarly priced" for recommendation purposes.
 */
const PRICE_MATCH_BAND = 25;

/**
 * Score products as recommendations for the given product.
 *
 * ── Scoring rubric ────────────────────────────────────────
 * • Same category            — strong signal (+100)
 * • Shared tags              — +12 per overlapping tag
 * • Similar price (±$25)     — +10
 * • Bestseller tag           — +6 (boosts fallback picks)
 * • New tag                  — +4 (fresher inventory)
 *
 * The current product is always excluded. Results are sorted by
 * score descending, then by price distance ascending so ties
 * favor the closest-priced item.
 */
export function getRecommendedProducts(handle: string, limit = 4): Product[] {
  const current = getProductByHandle(handle);
  if (!current) return getNewestProducts(limit);

  const candidates = getCatalogProducts().filter(p => p.handle !== handle);
  const currentCategory = current.category;
  const currentTags = new Set(current.tags);

  return candidates
    .map(product => {
      let score = 0;

      if (product.category === currentCategory) score += 100;

      for (const tag of product.tags) {
        if (currentTags.has(tag)) score += 12;
      }

      if (Math.abs(product.price - current.price) <= PRICE_MATCH_BAND) {
        score += 10;
      }

      if (product.tags.includes('bestseller')) score += 6;
      if (product.tags.includes('new')) score += 4;

      const priceDistance = Math.abs(product.price - current.price);

      return { product, score, priceDistance };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.priceDistance - b.priceDistance;
    })
    .slice(0, limit)
    .map(entry => entry.product);
}
