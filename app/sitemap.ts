import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { getAllProducts } from '@/lib/products';
import { getAllCategoryHandles } from '@/data/categories';
import { getBlogPosts, setBlogPosts } from '@/features/blog';
import { isShopifyConfigured } from '@/lib/shopify/config';
import { fetchShopifyArticles } from '@/lib/shopify/blog';

/**
 * XML sitemap for OtakuSaga.
 *
 * Lists the home page, collections index, every product page,
 * every category page, and every blog article.
 *
 * When Shopify is configured, articles are fetched live; otherwise
 * the local mock posts are listed. Product/catalog data is read from
 * the module store (populated by CatalogHydrator on builds that run
 * the full app tree).
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Blog articles ───────────────────────────────────────────
  let posts = getBlogPosts();

  if (isShopifyConfigured()) {
    try {
      posts = await fetchShopifyArticles();
      setBlogPosts(posts);
    } catch {
      // Shopify fetch failed — keep local posts.
    }
  }

  const blogEntries: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // ── Products ────────────────────────────────────────────────
  const products = getAllProducts();
  const categoryHandles = getAllCategoryHandles();

  const productEntries: MetadataRoute.Sitemap = products.map(p => ({
    url: `${siteConfig.url}/product/${p.handle}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = [
    ...categoryHandles.map(handle => ({
      url: `${siteConfig.url}/collections/${handle}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    {
      url: `${siteConfig.url}/collections/all`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/collections/new`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/collections`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/wishlist`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  return [
    ...staticPages,
    ...categoryEntries,
    ...productEntries,
    ...blogEntries,
  ];
}
