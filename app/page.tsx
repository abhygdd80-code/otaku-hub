import type { Metadata } from 'next';
import { Hero } from '@/components/hero';
import { CategoryShowcase, type CategoryItem } from '@/components/categories';
import { FeaturedCollection } from '@/components/featured';
import { BrandStory } from '@/components/brand';
import { BestSellers } from '@/components/bestsellers';
import { RecentlyViewed } from '@/components/recently-viewed';
import { Newsletter } from '@/components/newsletter';
import { InstagramGallery } from '@/components/instagram';
import { getCategoryProducts } from '@/features/collections';
import { siteConfig } from '@/config/site';

const HOME_URL = siteConfig.url;
const OG_IMAGE = `${siteConfig.url}${siteConfig.ogImage}`;

export const metadata: Metadata = {
  title: 'Premium Anime Apparel, Streetwear & Collector Goods',
  description: siteConfig.description,
  alternates: {
    canonical: HOME_URL,
  },
  openGraph: {
    type: 'website',
    url: HOME_URL,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [OG_IMAGE],
  },
};

/**
 * Category cards for the infinite showcase — counts are derived from
 * the live catalog so the UI never shows fabricated numbers.
 */
const CATEGORY_ITEMS: CategoryItem[] = [
  {
    id: 'hoodies',
    title: 'Hoodies',
    tagline: 'Heavyweight Premium Fleece',
    itemCount: `${getCategoryProducts('hoodies').length} Products`,
    href: '/collections/hoodies',
    gradient:
      'bg-gradient-to-br from-accent/30 via-purple-900/40 to-background',
  },
  {
    id: 'oversized-tshirts',
    title: 'Oversized T-Shirts',
    tagline: 'Drop-Shoulder Boxy Fit',
    itemCount: `${getCategoryProducts('oversized-tshirts').length} Products`,
    href: '/collections/oversized-tshirts',
    gradient:
      'bg-gradient-to-br from-blue-800/40 via-indigo-900/30 to-background',
  },
  {
    id: 'figures',
    title: 'Action Figures',
    tagline: '1/6 Scale Collector Statues',
    itemCount: `${getCategoryProducts('figures').length} Products`,
    href: '/collections/figures',
    gradient:
      'bg-gradient-to-br from-amber-800/40 via-red-900/30 to-background',
  },
  {
    id: 'accessories',
    title: 'Accessories',
    tagline: 'Auto-Open Katana Umbrellas',
    itemCount: `${getCategoryProducts('accessories').length} Products`,
    href: '/collections/accessories',
    gradient:
      'bg-gradient-to-br from-zinc-600/40 via-stone-900/30 to-background',
  },
  {
    id: 'new-drops',
    title: 'New Drops',
    tagline: 'Limited Edition Drops',
    itemCount: `${getCategoryProducts('new').length} Products`,
    href: '/collections/new',
    gradient: 'bg-gradient-to-br from-accent/40 via-rose-900/40 to-background',
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* 1. Full-screen Cinematic Hero */}
      <Hero />

      {/* 2. Infinite Category Slider */}
      <CategoryShowcase categories={CATEGORY_ITEMS} />

      {/* 3. Featured Collection */}
      <FeaturedCollection />

      {/* 4. Brand Story Section */}
      <BrandStory />

      {/* 5. Best Sellers Section */}
      <BestSellers />

      {/* 6. Recently Viewed Section */}
      <RecentlyViewed />

      {/* 7. Newsletter Section */}
      <Newsletter />

      {/* 7. Instagram Gallery Section */}
      <InstagramGallery />
    </div>
  );
}
