// ─── Blog Store (module-level, swappable) ─────────────────────────
// Mirrors `features/catalog.ts`: server pages hydrate a module-level
// store when Shopify is configured; otherwise the local `LOCAL_POSTS`
// array is returned. Keeps the sitemap and metadata helpers synchronous.

import { LOCAL_POSTS, type BlogPost, sortPostsNewestFirst } from '@/data/blog';

let blogPosts: BlogPost[] | null = null;

/** Return the active blog posts, newest first. */
export function getBlogPosts(): BlogPost[] {
  return sortPostsNewestFirst(blogPosts ?? LOCAL_POSTS);
}

/**
 * Replace the active posts with Shopify-sourced articles.
 * `undefined` resets back to the local fallback content.
 */
export function setBlogPosts(posts: BlogPost[] | undefined): void {
  blogPosts = posts ?? null;
}

/** Look up a single post by its URL slug. */
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return getBlogPosts().find(post => post.slug === slug);
}

/** Posts related to a given post via shared tags. */
export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const current = getBlogPostBySlug(slug);
  if (!current) return getBlogPosts().slice(0, limit);

  const currentTags = new Set(current.tags);
  return getBlogPosts()
    .filter(post => post.slug !== slug)
    .map(post => ({
      post,
      score: post.tags.reduce(
        (sum, tag) => sum + (currentTags.has(tag) ? 1 : 0),
        0
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(entry => entry.post);
}

/** Unique tags across all posts, sorted alphabetically. */
export function getAllBlogTags(): string[] {
  const tags = new Set<string>();
  for (const post of getBlogPosts()) {
    for (const tag of post.tags) tags.add(tag);
  }
  return [...tags].sort();
}
