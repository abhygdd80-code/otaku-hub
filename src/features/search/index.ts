// ─── Search Engine ──────────────────────────────────────────────────
// Client-side search across all products with fuzzy matching, typo
// tolerance, scoring, and ranking.

import { type Product } from '@/data/products';
import { getCatalogProducts } from '@/features/catalog';

// ─── Types ─────────────────────────────────────────────────────────

export interface SearchResultItem {
  product: Product;
  score: number;
}

// ─── Image Mapping ─────────────────────────────────────────────────
// Map local product handles to real image URLs.

const SEARCH_IMAGE_MAP: Record<string, string> = {
  'shadow-realm-hoodie': '/images/products/hoodie_cyber.jpg',
  'cyber-oni-hoodie': '/images/products/hoodie_cyber.jpg',
  'neo-tokyo-oversized-tee': '/images/hero_anime_model.jpg',
  'ghost-shell-tee': '/images/hero_anime_model.jpg',
  'spirit-guardian-figure': '/images/products/figure_cyber.jpg',
  'valkyrie-statue': '/images/products/figure_cyber.jpg',
  'crimson-wave-umbrella': '/images/hero_anime_model.jpg',
  'ronin-umbrella': '/images/hero_anime_model.jpg',
  'neo-tokyo-jacket': '/images/hero_anime_model.jpg',
};

export function getSearchProductImage(product: Product): string {
  return SEARCH_IMAGE_MAP[product.handle] || '/images/hero_anime_model.jpg';
}

// ─── Fuzzy Matching ────────────────────────────────────────────────

/**
 * Compute Levenshtein distance between two strings.
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[] = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }

  return dp[n];
}

/**
 * Normalize a string for comparison.
 */
function normalize(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Compute score for a single field against query tokens.
 * Returns the cumulative score.
 */
function scoreField(
  tokens: string[],
  fieldValue: string,
  weight: number
): number {
  const normalized = normalize(fieldValue);
  let score = 0;

  for (const token of tokens) {
    // Exact match
    if (normalized === token) {
      score += 100 * weight;
      continue;
    }
    // Starts with
    if (normalized.startsWith(token)) {
      score += 80 * weight;
      continue;
    }
    // Contains token as a whole word
    const words = normalized.split(/\s+/);
    if (words.some(w => w === token)) {
      score += 70 * weight;
      continue;
    }
    // Contains substring
    if (normalized.includes(token)) {
      score += 50 * weight;
      continue;
    }
    // Fuzzy match for tokens of length >= 3
    if (token.length >= 3) {
      for (const word of words) {
        if (word.length < 3) continue;
        if (word.startsWith(token) || token.startsWith(word)) {
          score += 40 * weight;
          break;
        }
        const dist = levenshtein(token, word);
        const threshold = Math.max(
          1,
          Math.floor(Math.min(token.length, word.length) / 3)
        );
        if (dist <= threshold) {
          score += 25 * weight;
          break;
        }
      }
    }
  }

  return score;
}

// ─── Search ─────────────────────────────────────────────────────────

/**
 * Search all products by the given query.
 * Returns results ranked by relevance (highest score first).
 * Empty or whitespace-only queries return an empty array.
 */
export function searchProducts(query: string): SearchResultItem[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const tokens = normalize(trimmed).split(/\s+/).filter(Boolean);

  if (tokens.length === 0) return [];

  const results: SearchResultItem[] = [];

  for (const product of getCatalogProducts()) {
    let totalScore = 0;

    // Name — highest weight
    totalScore += scoreField(tokens, product.name, 1.0);

    // Category
    totalScore += scoreField(tokens, product.category, 0.7);

    // Tags
    for (const tag of product.tags) {
      totalScore += scoreField(tokens, tag, 0.5);
    }

    // Description — lowest weight
    totalScore += scoreField(tokens, product.description, 0.25);

    if (totalScore > 0) {
      results.push({ product, score: totalScore });
    }
  }

  // Sort by score descending; tie-break by name alphabetically
  results.sort((a, b) => {
    const diff = b.score - a.score;
    if (diff !== 0) return diff;
    return a.product.name.localeCompare(b.product.name);
  });

  return results;
}

// ─── Trending / Popular Data ───────────────────────────────────────

export const TRENDING_SEARCHES: string[] = [
  'Shadow Realm Hoodie',
  'Gojo Oversized Tee',
  'Samurai Collection',
  'Limited Edition',
  'Cyber Oni',
  'Valkyrie Statue',
];

export const POPULAR_PRODUCT_HANDLES: string[] = [
  'shadow-realm-hoodie',
  'cyber-oni-hoodie',
  'neo-tokyo-oversized-tee',
  'valkyrie-statue',
  'neo-tokyo-jacket',
];
