// ─── Category Configurations ────────────────────────────────────

export interface CategoryConfig {
  /** URL-safe handle used in routes */
  handle: string;
  /** Display title */
  title: string;
  /** Short description for the collection page header */
  description: string;
  /** SEO description */
  seoDescription: string;
  /** Tags that determine which products belong to this category */
  matchTags: string[];
  /** Additional match logic: check if product name includes any of these (case-insensitive) */
  nameIncludes?: string[];
  /** Fallback hero image URL */
  heroImage: string;
}

const CATEGORIES_DATA: CategoryConfig[] = [
  {
    handle: 'hoodies',
    title: 'Hoodies',
    description:
      'Heavyweight 420GSM fleece hoodies engineered for maximum warmth and street-ready presence. Double-lined hoods, ribbed cuffs, and drop-shoulder silhouettes.',
    seoDescription:
      'Browse our limited drop hoodies collection — heavyweight 420GSM fleece, oversized fits, and precision graphics.',
    matchTags: ['hoodies'],
    heroImage: '/images/products/hoodie_cyber.jpg',
  },
  {
    handle: 'oversized-tshirts',
    title: 'Oversized T-Shirts',
    description:
      '280GSM heavyweight vintage-washed tees with a boxy oversized cut. Dropped shoulders, ribbed collars, and graphic prints that demand attention.',
    seoDescription:
      'Shop oversized t-shirts built from 280GSM heavyweight cotton — boxy fits, vintage washes, and bold anime graphics.',
    matchTags: ['tees'],
    nameIncludes: ['oversized'],
    heroImage: '/images/hero_anime_model.jpg',
  },
  {
    handle: 'tshirts',
    title: 'T-Shirts',
    description:
      'Premium fit tees crafted from heavyweight combed cotton. Clean construction, precision prints, and everyday durability with an edge.',
    seoDescription:
      'Explore our t-shirt collection — heavyweight combed cotton tees with precision anime graphics and clean construction.',
    matchTags: ['tees'],
    heroImage: '/images/hero_anime_model.jpg',
  },
  {
    handle: 'jackets',
    title: 'Jackets & Outerwear',
    description:
      'Water-resistant Japanese nylon bombers, reflective street jackets, and lightweight layers built for the electric nights of the mega-city.',
    seoDescription:
      'Discover our jackets and outerwear collection — Japanese nylon bombers, reflective street jackets, and lightweight layers.',
    matchTags: ['outerwear'],
    heroImage: '/images/hero_anime_model.jpg',
  },
  {
    handle: 'accessories',
    title: 'Accessories',
    description:
      'Full-length automatic umbrellas with windproof frames, laser-etched handles, and custom gradient canopies. Gear that completes the look.',
    seoDescription:
      'Browse accessories — windproof umbrellas, laser-etched handles, and custom gradient gear for the complete aesthetic.',
    matchTags: ['accessories'],
    heroImage: '/images/hero_anime_model.jpg',
  },
  {
    handle: 'figures',
    title: 'Figures & Collectibles',
    description:
      'Masterwork hand-painted 1/6 scale collector statues with LED illumination and translucent aura effects. Individually numbered limited editions.',
    seoDescription:
      'Shop limited edition figures and collectibles — hand-painted 1/6 scale statues with LED effects, individually numbered.',
    matchTags: ['figures'],
    heroImage: '/images/products/figure_cyber.jpg',
  },
];

export default CATEGORIES_DATA;

export function getCategoryByHandle(
  handle: string
): CategoryConfig | undefined {
  return CATEGORIES_DATA.find(cat => cat.handle === handle);
}

export function getAllCategoryHandles(): string[] {
  return CATEGORIES_DATA.map(cat => cat.handle);
}
