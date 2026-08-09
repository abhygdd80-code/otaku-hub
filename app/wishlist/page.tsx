import type { Metadata } from 'next';
import { WishlistPageClient } from '@/components/wishlist/WishlistPageClient';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Wishlist',
  description:
    'Your saved items — manage your wishlist and never lose track of your favorite drops.',
  alternates: {
    canonical: `${siteConfig.url}/wishlist`,
  },
  openGraph: {
    type: 'website',
    url: `${siteConfig.url}/wishlist`,
    title: 'Wishlist',
    description:
      'Your saved items — manage your wishlist and never lose track of your favorite drops.',
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wishlist',
    description:
      'Your saved items — manage your wishlist and never lose track of your favorite drops.',
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
  },
};

/**
 * Wishlist page — server component shell.
 *
 * Renders the client-side wishlist manager which reads from
 * the persisted Zustand store and displays saved products.
 *
 * ── States ──────────────────────────────────────────────────
 * - Empty:  WishlistEmptyState with CTA to browse collections
 * - Filled: WishlistGrid of ProductCards with header + controls
 */
export default function WishlistPage() {
  return <WishlistPageClient />;
}
