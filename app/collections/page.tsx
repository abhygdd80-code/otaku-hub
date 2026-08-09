import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import CATEGORIES_DATA from '@/data/categories';
import { getCategoryProducts } from '@/features/collections';
import { siteConfig } from '@/config/site';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Heading from '@/components/ui/Heading';

export const metadata: Metadata = {
  title: 'All Collections',
  description: 'Explore all anime streetwear and collector drop collections.',
  alternates: {
    canonical: `${siteConfig.url}/collections`,
  },
  openGraph: {
    type: 'website',
    url: `${siteConfig.url}/collections`,
    title: 'All Collections',
    description: 'Explore all anime streetwear and collector drop collections.',
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
    title: 'All Collections',
    description: 'Explore all anime streetwear and collector drop collections.',
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
  },
};

export default async function CollectionsPage() {
  const collections = CATEGORIES_DATA.map(cat => ({
    ...cat,
    productCount: getCategoryProducts(cat.handle).length,
  }));

  return (
    <Section className="py-24 bg-background">
      <Container>
        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-accent tracking-[0.25em] uppercase block mb-2">
            CATALOG DIRECTORY
          </span>
          <Heading
            level={1}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight"
          >
            ALL <span className="text-accent">COLLECTIONS</span>
          </Heading>
          <p className="mt-3 text-secondary-text text-sm sm:text-base">
            Select a series to explore our limited releases.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map(col => (
            <Link
              key={col.handle}
              href={`/collections/${col.handle}`}
              className="group relative h-96 rounded-2xl overflow-hidden bg-surface border border-border flex flex-col justify-end p-6"
            >
              <Image
                src={col.heroImage}
                alt={col.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-75 group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="relative z-10 space-y-2">
                <span className="text-xs font-bold text-accent uppercase tracking-widest block">
                  EXPLORE DROP &rarr;
                </span>
                <h2 className="text-2xl font-bold text-white group-hover:text-accent transition-colors">
                  {col.title}
                </h2>
                <p className="text-xs text-secondary-text line-clamp-2">
                  {col.description}
                </p>
                <span className="inline-flex text-[10px] font-semibold text-muted-foreground bg-background/60 backdrop-blur-sm rounded-full px-2.5 py-1 mt-1">
                  {col.productCount} {col.productCount === 1 ? 'Item' : 'Items'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
