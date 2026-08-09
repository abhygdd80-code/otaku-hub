import type { Metadata, Viewport } from 'next';
import { fontVariables } from '@/config/fonts';
import { siteConfig } from '@/config/site';
import { AppProviders } from '@/components/providers/AppProviders';
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';
import { SentryProvider } from '@/components/providers/SentryProvider';
import { CatalogHydrator } from '@/components/providers/CatalogHydrator';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SearchDialogDynamic } from '@/components/search/SearchDialogDynamic';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'Anime Apparel',
    'Streetwear',
    'OtakuSaga',
    'Anime Hoodies',
    'Action Figures',
    'Anime Merch',
    'Japanese Streetwear',
    'Cyberpunk Clothing',
    'Anime Collector',
  ],
  authors: [{ name: 'OtakuSaga Team' }],
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
  },
};

/**
 * Mobile viewport + browser chrome. The site is dark-only, so `colorScheme`
 * pins the default (form controls, scrollbars) and `themeColor` colors the
 * mobile browser UI instead of flashing a light default.
 */
export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#050505',
};

/**
 * Site-wide structured data — Organization + WebSite nodes.
 * Product / Breadcrumb / Collection schema is emitted per-page.
 */
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/favicon.svg`,
    },
    {
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} dark h-full`}>
      <body className="min-h-full flex flex-col bg-background text-primary antialiased selection:bg-accent selection:text-white scroll-smooth">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        {/* Skip link — lets keyboard / screen-reader users jump past the
            nav to the page content (WCAG 2.2.1 — Bypass Blocks). */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
        >
          Skip to content
        </a>
        <CatalogHydrator>
          <AppProviders>
            <Navbar />
            <main id="main-content" className="flex-1 w-full relative z-10">
              {children}
            </main>
            <Footer />
            <SearchDialogDynamic />
          </AppProviders>
        </CatalogHydrator>
        <AnalyticsProvider />
        <SentryProvider />
      </body>
    </html>
  );
}
