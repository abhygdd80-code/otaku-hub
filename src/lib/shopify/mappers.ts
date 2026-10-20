// ─── Shopify → App Product Mapping ─────────────────────────────────
// Translates Storefront API product payloads into the app's native
// `Product` shape so every existing UI component, animation, and layout
// works unchanged. The mapping is lossless for the fields the UI reads:
// names, prices, badges, options, images, tags, and dates.

import type { Product, ProductImage, ProductOption } from '@/data/products';
import type { BlogPost } from '@/data/blog';
import { computeReadingTime } from '@/data/blog';
import type {
  ShopifyProduct,
  ShopifyPredictiveProduct,
  ShopifyVariant,
  ShopifyArticle,
} from './types';

// ─── Gradient palette ──────────────────────────────────────────────
// Deterministic on-brand gradient placeholder derived from price, so
// Shopify products with no artwork still render in the house visual
// language. Matches the existing catalog's gradient families.

const GRADIENT_BY_BAND: { max: number; gradient: string }[] = [
  {
    max: 50,
    gradient:
      'bg-gradient-to-br from-cyan-800/35 via-blue-900/30 to-background',
  },
  {
    max: 90,
    gradient:
      'bg-gradient-to-br from-accent/25 via-purple-800/40 to-background',
  },
  {
    max: 140,
    gradient: 'bg-gradient-to-br from-accent/20 via-rose-900/50 to-background',
  },
  {
    max: 250,
    gradient:
      'bg-gradient-to-br from-amber-700/35 via-red-900/40 to-background',
  },
  {
    max: Infinity,
    gradient:
      'bg-gradient-to-br from-zinc-600/40 via-stone-800/35 to-background',
  },
];

/** Pick a stable gradient for a price (used as placeholder art). */
export function gradientForPrice(price: number): string {
  const band =
    GRADIENT_BY_BAND.find(b => price < b.max) ??
    GRADIENT_BY_BAND[GRADIENT_BY_BAND.length - 1];
  return band.gradient;
}

// ─── Badge derivation ──────────────────────────────────────────────
// Map common Shopify tags onto the app's badge vocabulary.

const BADGE_TAG_MAP: { tag: string; badge: string }[] = [
  { tag: 'bestseller', badge: 'BESTSELLER' },
  { tag: 'trending', badge: 'TRENDING' },
  { tag: 'limited', badge: 'LIMITED' },
  { tag: 'hot-drop', badge: 'HOT DROP' },
  { tag: 'new', badge: 'NEW DROP' },
  { tag: 'restocked', badge: 'RESTOCKED' },
];

function deriveBadge(tags: string[]): string | undefined {
  for (const { tag, badge } of BADGE_TAG_MAP) {
    if (tags.includes(tag)) return badge;
  }
  return undefined;
}

// ─── Option extraction ─────────────────────────────────────────────

function extractOptionValues(options: ProductOption[], name: string): string[] {
  return (
    options.find(o => o.name.toLowerCase() === name.toLowerCase())?.values ?? []
  );
}

/** Flatten variant selectedOptions into a `{name → value}` record. */
export function variantSelectedOptions(
  variant: ShopifyVariant
): Record<string, string> {
  const record: Record<string, string> = {};
  for (const option of variant.selectedOptions) {
    record[option.name] = option.value;
  }
  return record;
}

/** Map a Storefront product to the app's `Product` type. */
export function mapShopifyProduct(product: ShopifyProduct): Product {
  const options: ProductOption[] = product.options.map(option => ({
    name: option.name,
    values: option.values,
  }));

  const images: ProductImage[] = product.images.edges.map(edge => ({
    gradient: gradientForPrice(
      parseFloat(product.priceRange.minVariantPrice.amount)
    ),
    alt: edge.node.altText ?? product.title,
    src: edge.node.url,
  }));

  // Featured image first if present, else the first gallery image.
  const primaryImageUrl =
    product.featuredImage?.url ??
    product.images.edges[0]?.node.url ??
    undefined;

  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const currencyCode = product.priceRange.minVariantPrice.currencyCode;

  return {
    id: product.id,
    handle: product.handle,
    name: product.title,
    category: product.productType || 'Collectible',
    description: product.description,
    price,
    currencyCode,
    badge: deriveBadge(product.tags),
    gradient: gradientForPrice(price),
    href: `/product/${product.handle}`,
    image: primaryImageUrl,
    images,
    sizes: extractOptionValues(options, 'Size'),
    colors: extractOptionValues(options, 'Color'),
    options,
    tags: product.tags,
    featured: product.tags.includes('featured'),
    createdAt: product.createdAt,
    variants: product.variants.edges.map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      availableForSale: edge.node.availableForSale,
      price: parseFloat(edge.node.price.amount),
      currencyCode: edge.node.price.currencyCode,
      compareAtPrice: edge.node.compareAtPrice
        ? parseFloat(edge.node.compareAtPrice.amount)
        : null,
      compareAtCurrencyCode: edge.node.compareAtPrice
        ? edge.node.compareAtPrice.currencyCode
        : undefined,
      selectedOptions: edge.node.selectedOptions,
    })),
  };
}

/** Map a Storefront article to the app's `BlogPost` type. */
export function mapShopifyArticle(article: ShopifyArticle): BlogPost {
  const content = article.content ?? article.contentHtml ?? '';
  const coverImage = article.image?.url;

  return {
    id: article.id,
    slug: article.handle,
    title: article.title,
    excerpt: article.excerpt || article.content?.slice(0, 160) || '',
    content,
    contentHtml: article.contentHtml ?? undefined,
    coverImage,
    coverImageAlt: article.image?.altText ?? article.title,
    author: article.author?.name ?? 'OtakuSaga',
    publishedAt: article.publishedAt,
    tags: article.tags,
    readingTime: computeReadingTime(content, 3),
    featured: article.tags.includes('featured'),
  };
}

/**
 * Map a predictive-search product to the app's `Product` type.
 * Predictive search returns a slimmer payload, so defaults are filled in
 * to keep the shape complete (no-variant, single gradient image).
 */
export function mapPredictiveProduct(
  product: ShopifyPredictiveProduct
): Product {
  const price = product.priceRange
    ? parseFloat(product.priceRange.minVariantPrice.amount)
    : 0;
  const currencyCode = product.priceRange
    ? product.priceRange.minVariantPrice.currencyCode
    : 'INR';
  const imageUrl = product.featuredImage?.url;

  const images: ProductImage[] = imageUrl
    ? [
        {
          gradient: gradientForPrice(price),
          alt: product.featuredImage?.altText ?? product.title,
          src: imageUrl,
        },
      ]
    : [{ gradient: gradientForPrice(price), alt: product.title }];

  return {
    id: product.id,
    handle: product.handle,
    name: product.title,
    category: product.productType || 'Collectible',
    description: product.description ?? '',
    price,
    currencyCode,
    gradient: gradientForPrice(price),
    href: `/product/${product.handle}`,
    image: imageUrl,
    images,
    sizes: [],
    colors: [],
    options: [],
    tags: product.tags ?? [],
    featured: false,
    createdAt: '',
  };
}
