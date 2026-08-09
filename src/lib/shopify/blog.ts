// ─── Shopify Blog API ──────────────────────────────────────────────
// Async article retrieval from the store's online store. Only ever
// called when `isShopifyConfigured()` is true; `BlogHydrator` falls back
// to the local `LOCAL_POSTS` on any error.

import type { BlogPost } from '@/data/blog';
import { shopifyFetch } from './client';
import { mapShopifyArticle } from './mappers';
import { ARTICLES_QUERY, ARTICLE_BY_HANDLE_QUERY } from './queries';
import type {
  ArticlesQueryResponse,
  ArticleByHandleQueryResponse,
} from './types';

/** Page size for article fetches. */
const PAGE_SIZE = 50;

/** Maximum pages to walk for the full article list (safety cap). */
const MAX_PAGES = 3;

/** Fetch the latest articles (paginated, newest first). */
export async function fetchShopifyArticles(): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    // Explicit annotation avoids a TS flow-analysis cycle: the await
    // captures the mutable `cursor`, which is reassigned from `edges`
    // (derived from `data`) below — leaving the type unannotated trips
    // TS7022 in the pagination loop.
    const data: ArticlesQueryResponse = await shopifyFetch(ARTICLES_QUERY, {
      first: PAGE_SIZE,
      cursor,
    });

    const edges = data.articles.edges;
    for (const edge of edges) {
      posts.push(mapShopifyArticle(edge.node));
    }

    if (edges.length < PAGE_SIZE) break;
    cursor = edges[edges.length - 1]?.cursor ?? null;
    if (!cursor) break;
  }

  return posts;
}

/** Fetch a single article by its handle. Returns `undefined` when absent. */
export async function fetchShopifyArticleByHandle(
  handle: string
): Promise<BlogPost | undefined> {
  const data = await shopifyFetch<ArticleByHandleQueryResponse>(
    ARTICLE_BY_HANDLE_QUERY,
    { handle }
  );

  const article = data.articles.edges[0]?.node;
  if (!article) return undefined;
  return mapShopifyArticle(article);
}
