import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllCategoryHandles, getCategoryByHandle } from '@/data/categories';
import { siteConfig } from '@/config/site';
import {
  getCategoryProducts,
  getCategorySummary,
} from '@/features/collections';
import { CollectionPageClient } from '@/components/collections/CollectionPageClient';
import { CollectionSkeleton } from '@/components/collections/CollectionSkeleton';
import { Suspense } from 'react';
import { breadcrumbJsonLd, collectionBreadcrumbs } from '@/lib/seo';

// ─── Dynamic Metadata ──────────────────────────────────────────

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const { title, seoDescription } = getCategorySummary(category);

  if (!title) {
    return {
      title: 'Collection Not Found',
    };
  }

  const pageTitle = `${title} Collection`;

  const pageUrl = `${siteConfig.url}/collections/${category}`;
  const categoryConfig = getCategoryByHandle(category);
  const heroImage = categoryConfig?.heroImage ?? siteConfig.ogImage;
  const ogImage = `${siteConfig.url}${heroImage}`;

  return {
    title: pageTitle,
    description: seoDescription,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: pageTitle,
      description: seoDescription,
      url: pageUrl,
      type: 'website',
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${title} collection — ${siteConfig.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: seoDescription,
      images: [ogImage],
    },
  };
}

// ─── Static Paths ──────────────────────────────────────────────

export async function generateStaticParams() {
  const handles = getAllCategoryHandles();
  return [...handles, 'all', 'new'].map(handle => ({ category: handle }));
}

// ─── Page Component ────────────────────────────────────────────

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const { title, description, productCount } = getCategorySummary(category);

  // Return 404 if category not found
  if (!title) {
    notFound();
  }

  const products = getCategoryProducts(category);

  // ── Breadcrumb structured data ────────────────────────
  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    ...breadcrumbJsonLd([
      ...collectionBreadcrumbs(category).slice(0, -1),
      {
        name: title,
        href: `${siteConfig.url}/collections/${category}`,
      },
    ]),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <Suspense fallback={<CollectionSkeleton count={8} />}>
        <CollectionPageClient
          title={title}
          description={description}
          productCount={productCount}
          products={products}
        />
      </Suspense>
    </>
  );
}
