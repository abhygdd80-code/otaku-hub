import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductByHandle, getRecommendedProducts } from '@/lib/products';
import { getProductImage } from '@/features/collections';
import { getReviewSummary } from '@/data/reviews';
import { siteConfig } from '@/config/site';
import { isShopifyConfigured } from '@/lib/shopify/config';
import {
  fetchProductRecommendations,
  dedupeProducts,
} from '@/lib/shopify/recommendations';
import { breadcrumbJsonLd, productBreadcrumbs } from '@/lib/seo';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { ReviewsSection } from '@/components/reviews';
import { RecentlyViewed } from '@/components/recently-viewed';
import { RecentlyViewedTracker } from '@/components/recently-viewed';
import type { Metadata } from 'next';

export const dynamic = 'error';

interface Props {
  params: Promise<{ handle: string }>;
}

/**
 * Generate page-level metadata for SEO / social preview.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = getProductByHandle(handle);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const pageUrl = `${siteConfig.url}/product/${product.handle}`;
  const ogImage = `${siteConfig.url}${getProductImage(product)}`;

  return {
    title: product.name,
    description: product.description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      title: product.name,
      description: product.description,
      url: pageUrl,
      images: [{ url: ogImage, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [ogImage],
    },
  };
}

/**
 * Product detail page — server component.
 *
 * Fetches the product from the shared data layer, renders the
 * gallery + info panel in a two-column layout, and sets up
 * structured data for search engines.
 *
 * ── Empty / error state ────────────────────────────────
 * When `getProductByHandle` returns undefined the page
 * calls `notFound()`, which renders the root `not-found.tsx`.
 */
export default async function ProductDetailPage({ params }: Props) {
  const { handle } = await params;
  const product = getProductByHandle(handle);

  if (!product) notFound();

  // ── Related products ──────────────────────────────────────
  // Local scoring engine first (same category > shared tags > similar
  // price > bestsellers). When Shopify is configured, try the storefront
  // associations (RELATED + COMPLEMENTARY) and prefer them when they
  // return results — the local engine stays as the fallback.
  let relatedProducts = getRecommendedProducts(handle, 8);

  if (isShopifyConfigured()) {
    try {
      const [related, complementary] = await Promise.all([
        fetchProductRecommendations(product.id, 'RELATED'),
        fetchProductRecommendations(product.id, 'COMPLEMENTARY'),
      ]);
      const merged = dedupeProducts([...related, ...complementary])
        .filter(p => p.handle !== handle)
        .slice(0, 8);
      if (merged.length > 0) relatedProducts = merged;
    } catch {
      // Shopify recommendations failed — keep the local scoring picks.
    }
  }

  // ── JSON-LD structured data ──────────────────────────
  const reviewSummary = getReviewSummary(handle);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: `${siteConfig.url}${getProductImage(product)}`,
    brand: {
      '@type': 'Brand',
      name: siteConfig.name,
    },
    offers: {
      '@type': 'Offer',
      url: `${siteConfig.url}/product/${product.handle}`,
      price: product.price,
      priceCurrency: product.currencyCode,
      availability: 'https://schema.org/InStock',
    },
    ...(reviewSummary
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: reviewSummary.average,
            reviewCount: reviewSummary.total,
            bestRating: 5,
          },
        }
      : {}),
  };

  // ── Breadcrumb structured data ────────────────────────
  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    ...breadcrumbJsonLd([
      ...productBreadcrumbs(handle).slice(0, -1),
      {
        name: product.name,
        href: `${siteConfig.url}/product/${product.handle}`,
      },
    ]),
  };

  return (
    <>
      {/* Schema.org scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <main className="relative min-h-screen bg-background overflow-hidden">
        {/* ── Recently Viewed tracking (renders nothing) ─────── */}
        <RecentlyViewedTracker handle={handle} />

        {/* ── Subtle background grid ─────────────────────────── */}
        <div className="bg-grid absolute inset-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* ── Breadcrumb ───────────────────────────────────── */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider mb-8"
          >
            <Link
              href="/"
              className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:text-white rounded transition-colors"
            >
              Home
            </Link>
            <span className="text-zinc-700 select-none">/</span>
            <Link
              href="/collections/all"
              className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:text-white rounded transition-colors"
            >
              Shop
            </Link>
            <span className="text-zinc-700 select-none">/</span>
            <span className="text-accent font-bold truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>

          {/* ── Two-column layout ────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left — gallery */}
            <div className="lg:col-span-7">
              <ProductGallery
                images={product.images}
                productName={product.name}
              />
            </div>

            {/* Right — info & actions */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <ProductInfo product={product} />
            </div>
          </div>

          {/* ── Related products ─────────────────────────────── */}
          <div className="mt-24 pt-16 border-t border-white/[0.06]">
            <RelatedProducts products={relatedProducts} />
          </div>

          {/* ── Reviews ───────────────────────────────────────── */}
          <div className="mt-24 pt-16 border-t border-white/[0.06]">
            <ReviewsSection productHandle={handle} productName={product.name} />
          </div>

          {/* ── Keep exploring ────────────────────────────────── */}
          <div className="mt-24 pt-16 border-t border-white/[0.06]">
            <RecentlyViewed excludeHandle={handle} />
          </div>
        </div>
      </main>
    </>
  );
}
