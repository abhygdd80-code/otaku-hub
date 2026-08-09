// ─── SEO Utilities ─────────────────────────────────────────────────
// Shared helpers for structured data and page metadata so every route
// emits consistent, valid schema without duplicating JSON-LD shapes.

import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

/** One rung of a BreadcrumbList hierarchy. */
export interface BreadcrumbItem {
  /** Visible label, e.g. "Shop" or "Hoodies". */
  name: string;
  /** Absolute URL of the crumb. */
  href: string;
}

/**
 * Build a schema.org `BreadcrumbList` node from a path of crumbs.
 *
 * The final crumb (the current page) should be marked `@id`-complete so
 * Google can match it to the canonical URL. Callers embed the returned
 * object in their own `@graph` or as a standalone script.
 */
export function breadcrumbJsonLd(
  items: BreadcrumbItem[]
): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href,
    })),
  };
}

/** Convenience crumbs for a product detail page. */
export function productBreadcrumbs(handle: string): BreadcrumbItem[] {
  return [
    { name: 'Home', href: siteConfig.url },
    { name: 'Shop', href: `${siteConfig.url}/collections/all` },
    {
      name: 'Product',
      href: `${siteConfig.url}/product/${handle}`,
    },
  ];
}

/** Convenience crumbs for a collection (category) page. */
export function collectionBreadcrumbs(category: string): BreadcrumbItem[] {
  return [
    { name: 'Home', href: siteConfig.url },
    { name: 'Shop', href: `${siteConfig.url}/collections/all` },
    {
      name: 'Collections',
      href: `${siteConfig.url}/collections`,
    },
    {
      name: category.charAt(0).toUpperCase() + category.slice(1),
      href: `${siteConfig.url}/collections/${category}`,
    },
  ];
}

/**
 * Compose the standard OG + Twitter image block used across pages so
 * social previews share one consistent asset pipeline.
 */
export function socialImages(path: string): Metadata['openGraph'] {
  const url = `${siteConfig.url}${path}`;
  const absolute = path.startsWith('http') ? path : url;
  return {
    type: 'website',
    url,
    siteName: siteConfig.name,
    images: [
      {
        url: absolute,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  };
}

/** Escape a string for safe embedding inside a `<script>` block. */
export function escapeJsonLd(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');
}
