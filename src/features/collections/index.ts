import { type Product } from '@/data/products';
import { getCatalogProducts } from '@/features/catalog';
import CATEGORIES_DATA, { getCategoryByHandle } from '@/data/categories';
import type { ProductCardProps } from '@/components/product/ProductCard';

// ─── Types ──────────────────────────────────────────────────────

export type SortOption =
  'featured' | 'newest' | 'price-asc' | 'price-desc' | 'best-selling';

export interface FilterState {
  priceRanges: string[];
  sizes: string[];
  colors: string[];
  inStockOnly: boolean;
}

export const DEFAULT_FILTERS: FilterState = {
  priceRanges: [],
  sizes: [],
  colors: [],
  inStockOnly: false,
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'best-selling', label: 'Best Selling' },
];

// ─── Price Range Definitions ───────────────────────────────────

export const PRICE_RANGES = [
  { value: 'under-50', label: 'Under $50', min: 0, max: 50 },
  { value: '50-100', label: '$50 — $100', min: 50, max: 100 },
  { value: '100-200', label: '$100 — $200', min: 100, max: 200 },
  { value: 'over-200', label: 'Over $200', min: 200, max: Infinity },
] as const;

// ─── Image Mapping ──────────────────────────────────────────────
// Map local product handles to real image URLs in /public

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  'shadow-realm-hoodie': '/images/products/hoodie_cyber.jpg',
  'cyber-oni-hoodie': '/images/products/hoodie_cyber.jpg',
  'neo-tokyo-oversized-tee': '/images/hero_anime_model.jpg',
  'ghost-shell-tee': '/images/hero_anime_model.jpg',
  'spirit-guardian-figure': '/images/products/figure_cyber.jpg',
  'valkyrie-statue': '/images/products/figure_cyber.jpg',
  'crimson-wave-umbrella': '/images/hero_anime_model.jpg',
  'ronin-umbrella': '/images/hero_anime_model.jpg',
  'neo-tokyo-jacket': '/images/hero_anime_model.jpg',
};

/**
 * Resolve a product image URL
 */
export function getProductImage(product: Product): string {
  return PRODUCT_IMAGE_MAP[product.handle] || '/images/hero_anime_model.jpg';
}

// ─── Map Local Product → ProductCard Props ────────────────────

export function toProductCardProps(product: Product): ProductCardProps {
  return {
    id: product.handle,
    image: getProductImage(product),
    name: product.name,
    collection: product.category,
    price: product.price,
    badge: product.badge,
  };
}

// ─── Virtual Categories ("all" / "new") ────────────────────────
// These don't have a CategoryConfig entry; their summaries and
// product resolution are handled here so the routes are static
// and never soft-404.

const VIRTUAL_CATEGORY_SUMMARIES: Record<
  string,
  { title: string; description: string; seoDescription: string }
> = {
  all: {
    title: 'All Products',
    description:
      'The complete OtakuSaga catalog — every drop, every series, one destination.',
    seoDescription:
      'Shop the complete OtakuSaga catalog — anime streetwear, hoodies, tees, jackets, figures, and accessories in one collection.',
  },
  new: {
    title: 'New Arrivals',
    description:
      'The latest drops from OtakuSaga — fresh releases before they sell through.',
    seoDescription:
      'Shop the newest OtakuSaga arrivals — freshly dropped anime streetwear and collector pieces.',
  },
};

function isVirtualCategory(categoryHandle: string): boolean {
  return categoryHandle in VIRTUAL_CATEGORY_SUMMARIES;
}

// ─── Get Products by Category ──────────────────────────────────

export function getCategoryProducts(categoryHandle: string): Product[] {
  const products = getCatalogProducts();

  // Virtual "all" — the full catalog.
  if (categoryHandle === 'all') return products;

  // Virtual "new" — the full catalog, newest first.
  if (categoryHandle === 'new') {
    return [...products].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const category = getCategoryByHandle(categoryHandle);
  if (!category) return [];

  return products.filter(product => {
    const tagMatch = category.matchTags.some(tag => product.tags.includes(tag));
    if (!tagMatch) return false;

    // If category has a nameIncludes filter, apply it
    if (category.nameIncludes && category.nameIncludes.length > 0) {
      return category.nameIncludes.some(term =>
        product.name.toLowerCase().includes(term.toLowerCase())
      );
    }

    // For "tees" tag, exclude oversized if we're in 'tshirts' (not oversized)
    if (
      categoryHandle === 'tshirts' &&
      product.name.toLowerCase().includes('oversized')
    ) {
      return false;
    }

    return true;
  });
}

// ─── Filtering ───────────────────────────────────────────────────

export function applyFilters(
  products: Product[],
  filters: FilterState
): Product[] {
  return products.filter(product => {
    // Price ranges
    if (filters.priceRanges.length > 0) {
      const matchesPrice = filters.priceRanges.some(rangeKey => {
        const range = PRICE_RANGES.find(r => r.value === rangeKey);
        if (!range) return false;
        return product.price >= range.min && product.price < range.max;
      });
      if (!matchesPrice) return false;
    }

    // Sizes
    if (filters.sizes.length > 0) {
      const hasSize = product.sizes.some(s => filters.sizes.includes(s));
      if (!hasSize) return false;
    }

    // Colors
    if (filters.colors.length > 0) {
      const hasColor = product.colors.some(c => filters.colors.includes(c));
      if (!hasColor) return false;
    }

    // In Stock Only — skip if product has no variants (assume available)
    if (filters.inStockOnly) {
      if (product.sizes.length === 0 && product.colors.length === 0) {
        // Items without variants (like figures) are always considered available
        return true;
      }
    }

    return true;
  });
}

// ─── Sorting ────────────────────────────────────────────────────

export function applySort(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];

  switch (sort) {
    case 'newest':
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'best-selling':
    case 'featured':
    default:
      // Featured: show featured products first, then by newest
      sorted.sort((a, b) => {
        if (a.badge === 'BESTSELLER' && b.badge !== 'BESTSELLER') return -1;
        if (a.badge !== 'BESTSELLER' && b.badge === 'BESTSELLER') return 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      break;
  }

  return sorted;
}

// ─── Extract Available Filter Options from Products ────────────

export function getAvailableOptions(products: Product[]) {
  const allSizes = new Set<string>();
  const allColors = new Set<string>();

  products.forEach(p => {
    p.sizes.forEach(s => allSizes.add(s));
    p.colors.forEach(c => allColors.add(c));
  });

  // Return sizes in natural order
  const sizeOrder = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
  const sortedSizes = [...allSizes].sort(
    (a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b)
  );

  return {
    sizes: sortedSizes,
    colors: [...allColors].sort(),
  };
}

// ─── Summary ─────────────────────────────────────────────────────

export function getCategorySummary(categoryHandle: string): {
  title: string;
  description: string;
  productCount: number;
  seoDescription: string;
} {
  // Virtual categories ("all" / "new") — synthesized summaries.
  const virtual = VIRTUAL_CATEGORY_SUMMARIES[categoryHandle];
  if (virtual) {
    return {
      title: virtual.title,
      description: virtual.description,
      productCount: getCategoryProducts(categoryHandle).length,
      seoDescription: virtual.seoDescription,
    };
  }

  // Real categories — use the config entry.
  const category = getCategoryByHandle(categoryHandle);
  if (category) {
    return {
      title: category.title,
      description: category.description,
      productCount: getCategoryProducts(categoryHandle).length,
      seoDescription: category.seoDescription,
    };
  }

  // Unknown handle — empty title so callers can trigger notFound().
  return {
    title: '',
    description: '',
    productCount: 0,
    seoDescription: '',
  };
}
