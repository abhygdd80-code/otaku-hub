import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { isShopifyConfigured } from '@/lib/shopify/config';
import {
  fetchShopifyArticles,
  fetchShopifyArticleByHandle,
} from '@/lib/shopify/blog';
import {
  getBlogPosts,
  setBlogPosts,
  getBlogPostBySlug,
  getRelatedPosts,
} from '@/features/blog';
import { BlogPostContent, BlogCard } from '@/components/blog';
import { siteConfig } from '@/config/site';
import { formatDate } from '@/lib/utils';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { CollectionSkeleton } from '@/components/collections/CollectionSkeleton';
import { LOCAL_POSTS } from '@/data/blog';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

/** Static params — only pre-renders local posts at build. */
export function generateStaticParams() {
  return LOCAL_POSTS.map(post => ({ slug: post.slug }));
}

/**
 * Resolve the post: try Shopify first when configured, then local.
 * Deep-linking into a Shopify-only article succeeds on demand via ISR.
 */
async function resolvePost(slug: string) {
  if (isShopifyConfigured()) {
    try {
      const post = await fetchShopifyArticleByHandle(slug);
      // Also hydrate the store for related-posts sidebar.
      const all = await fetchShopifyArticles();
      setBlogPosts(all);
      return post ?? getBlogPostBySlug(slug);
    } catch {
      return getBlogPostBySlug(slug);
    }
  }
  return getBlogPostBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await resolvePost(slug);

  if (!post) return { title: 'Article Not Found' };

  const pageUrl = `${siteConfig.url}/blog/${post.slug}`;
  const ogImage = post.coverImage
    ? `${siteConfig.url}${post.coverImage}`
    : `${siteConfig.url}${siteConfig.ogImage}`;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: pageUrl,
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.coverImageAlt ?? post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

async function BlogArticleContent({ slug }: { slug: string }) {
  const post = await resolvePost(slug);

  if (!post) notFound();

  const relatedPosts = getRelatedPosts(slug, 3);

  return (
    <>
      {/* Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt,
            author: {
              '@type': 'Person',
              name: post.author,
            },
            publisher: {
              '@type': 'Organization',
              name: siteConfig.name,
              url: siteConfig.url,
              logo: {
                '@type': 'ImageObject',
                url: `${siteConfig.url}/favicon.svg`,
              },
            },
            image: post.coverImage
              ? `${siteConfig.url}${post.coverImage}`
              : undefined,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${siteConfig.url}/blog/${post.slug}`,
            },
          }),
        }}
      />

      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: siteConfig.url,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Journal',
                item: `${siteConfig.url}/blog`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: `${siteConfig.url}/blog/${post.slug}`,
              },
            ],
          }),
        }}
      />

      <main className="relative min-h-screen bg-background overflow-hidden">
        {/* ── Background grid ─────────────────────────────── */}
        <div className="bg-grid absolute inset-0 pointer-events-none" />

        <article className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* ── Back link ──────────────────────────────────── */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 transition-colors hover:text-accent mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to Journal
          </Link>

          {/* ── Header ────────────────────────────────────── */}
          <header className="mb-10 sm:mb-12">
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white leading-[1.1]">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {post.readingTime} min read
              </span>
              <span>By {post.author}</span>
            </div>
          </header>

          {/* ── Cover ───────────────────────────────────────── */}
          {post.coverImage && (
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-10 sm:mb-12">
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt ?? post.title}
                fill
                sizes="(max-width: 768px) 100vw, 896px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* ── Content ─────────────────────────────────────── */}
          <BlogPostContent
            contentHtml={post.contentHtml}
            content={post.content}
            className="pb-16 sm:pb-20 border-b border-white/[0.06]"
          />

          {/* ── Related posts ─────────────────────────────── */}
          {relatedPosts.length > 0 && (
            <section className="mt-12 sm:mt-16 pt-12 border-t border-white/[0.06]">
              <p className="text-xs font-bold text-accent tracking-[0.25em] uppercase mb-2">
                Related Articles
              </p>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white mb-8">
                Keep Reading
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {relatedPosts.map(post => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
    </>
  );
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  return (
    <Suspense fallback={<CollectionSkeleton count={3} />}>
      <BlogArticleContent slug={slug} />
    </Suspense>
  );
}
