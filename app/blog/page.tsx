import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { isShopifyConfigured } from '@/lib/shopify/config';
import { fetchShopifyArticles } from '@/lib/shopify/blog';
import { getBlogPosts, setBlogPosts, getAllBlogTags } from '@/features/blog';
import { BlogCard } from '@/components/blog';
import { siteConfig } from '@/config/site';
import { CollectionSkeleton } from '@/components/collections/CollectionSkeleton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Journal & Drop Guides',
  description:
    'Latest drops, care guides, collector tips, and styling advice from the OtakuSaga editorial team.',
  alternates: {
    canonical: `${siteConfig.url}/blog`,
  },
  openGraph: {
    type: 'website',
    title: 'Journal & Drop Guides',
    url: `${siteConfig.url}/blog`,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: 'OtakuSaga Journal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Journal & Drop Guides',
    description:
      'Latest drops, care guides, collector tips, and styling advice from the OtakuSaga editorial team.',
  },
};

/**
 * Blog index page — server component.
 *
 * When Shopify is configured, articles are fetched from the store and
 * persisted to the blog module store so the index / related-posts logic
 * stays synchronous after hydration. Falls back to `LOCAL_POSTS`.
 *
 * The page streams the grid inside a Suspense boundary.
 */
async function BlogContent() {
  let posts = getBlogPosts();

  if (isShopifyConfigured()) {
    try {
      posts = await fetchShopifyArticles();
      setBlogPosts(posts);
    } catch {
      // Shopify fetch failed — keep local fallback.
    }
  }

  // Re-read after potential hydration so related/sidebars stay fresh.
  posts = getBlogPosts();

  if (!posts.length) return notFound();

  const tags = getAllBlogTags();
  const [featured, ...rest] = posts;
  const remaining = rest;

  return (
    <>
      {/* ── JSON-LD Blog listing ─────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Journal & Drop Guides',
            url: `${siteConfig.url}/blog`,
            description:
              'Latest drops, care guides, collector tips, and styling advice from the OtakuSaga editorial team.',
            mainEntity: posts.map(post => ({
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.excerpt,
              datePublished: post.publishedAt,
              author: { '@type': 'Person', name: post.author },
              url: `${siteConfig.url}/blog/${post.slug}`,
              image: post.coverImage
                ? `${siteConfig.url}${post.coverImage}`
                : undefined,
            })),
          }),
        }}
      />

      <section className="relative min-h-screen bg-background overflow-hidden">
        {/* ── Background grid ────────────────────────────────── */}
        <div className="bg-grid absolute inset-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* ── Header ───────────────────────────────────────── */}
          <div className="max-w-3xl mb-12 sm:mb-16">
            <p className="text-xs font-bold text-accent tracking-[0.25em] uppercase">
              The Journal
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white leading-[1.1]">
              Drop Guides, Care Tips &{' '}
              <span className="text-accent">Collector Intel</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
              Inside the design process, post-drop roundups, and everything you
              need to know to keep your pieces in peak condition.
            </p>

            {/* Tag chips (decorative) */}
            {tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Featured post (full width) ──────────────────── */}
          <BlogCard post={featured} featured className="mb-10 sm:mb-12" />

          {/* ── Grid ──────────────────────────────────────────── */}
          {remaining.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {remaining.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<CollectionSkeleton count={6} />}>
      <BlogContent />
    </Suspense>
  );
}
