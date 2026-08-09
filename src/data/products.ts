// ─── Product Image ───────────────────────────────────────────
export interface ProductImage {
  /** Tailwind gradient class used as placeholder artwork */
  gradient: string;
  /** Alt text for accessibility */
  alt: string;
  /**
   * Optional real image URL (e.g. Shopify CDN). When present, the UI
   * renders the photograph over the gradient backdrop; when absent the
   * gradient is used exactly as before. Additive — never required.
   */
  src?: string;
}

// ─── Product Variant ──────────────────────────────────────────
export interface ProductVariant {
  /** Shopify variant ID (merchandise ID) */
  id: string;
  /** Variant title, e.g. "M / Obsidian Black" */
  title: string;
  /** Whether the variant is currently purchasable */
  availableForSale: boolean;
  /** Variant price in dollars */
  price: number;
  /** Compare-at (strikethrough) price, if any */
  compareAtPrice: number | null;
  /** The option selections that identify this variant */
  selectedOptions: { name: string; value: string }[];
}

// ─── Product ────────────────────────────────────────────────
export interface Product {
  /** Unique identifier */
  id: string;
  /** URL-friendly slug used for routing (e.g. "shadow-realm-hoodie") */
  handle: string;
  /** Display name (e.g. "Shadow Realm Hoodie") */
  name: string;
  /** Short category label (e.g. "Premium Hoodie", "Action Figure") */
  category: string;
  /** Full product description for PDP */
  description: string;
  /** Price in whole dollars */
  price: number;
  /** Optional badge text (e.g. "BESTSELLER", "LIMITED") */
  badge?: string;
  /** Primary gradient class for card placeholders */
  gradient: string;
  /**
   * Optional primary image URL (e.g. Shopify CDN). When present, cards,
   * galleries, cart, and search render the real photograph; otherwise the
   * gradient placeholder is used. Additive — never required.
   */
  image?: string;
  /**
   * Optional variant list for Shopify-sourced products. Used by the cart
   * adapter to resolve a merchandise ID for a chosen size/color.
   */
  variants?: ProductVariant[];
  /** Product detail page path — derived from handle */
  href: string;
  /** Available images (gradient placeholders until original art is ready) */
  images: ProductImage[];
  /** Available sizes. Empty array for items without sizing. */
  sizes: string[];
  /** Available color options */
  colors: string[];
  /** Organized size/color/edition options for variant selection */
  options: ProductOption[];
  /** Content tags for filtering / collection membership */
  tags: string[];
  /** Featured in the hero collection slot */
  featured?: boolean;
  /** ISO-8601 date the product was added */
  createdAt: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

// ─── Products Database ─────────────────────────────────────
export const PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    handle: 'shadow-realm-hoodie',
    name: 'Shadow Realm Hoodie',
    category: 'Premium Pullover Hoodie',
    description:
      'Step into the void with the Shadow Realm Hoodie. Crafted from 420GSM heavyweight combed ring-spun cotton, this drop-shoulder pullover features an oversized fit, double-lined hood, and ribbed cuffs. The front minimal print glows under blacklight — a subtle nod to the dark energies that linger between worlds.',
    price: 89,
    badge: 'BESTSELLER',
    gradient:
      'bg-gradient-to-br from-accent/25 via-purple-800/40 to-background',
    href: '/product/shadow-realm-hoodie',
    images: [
      {
        gradient:
          'bg-gradient-to-br from-accent/25 via-purple-800/40 to-background',
        alt: 'Shadow Realm Hoodie — front view',
      },
      {
        gradient:
          'bg-gradient-to-br from-purple-900/40 via-accent/20 to-violet-900/30',
        alt: 'Shadow Realm Hoodie — back view',
      },
      {
        gradient:
          'bg-gradient-to-br from-violet-800/35 via-purple-700/25 to-background',
        alt: 'Shadow Realm Hoodie — detail',
      },
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: ['Obsidian Black', 'Void Gray'],
    options: [
      {
        name: 'Size',
        values: ['S', 'M', 'L', 'XL', '2XL'],
      },
      {
        name: 'Color',
        values: ['Obsidian Black', 'Void Gray'],
      },
    ],
    tags: ['hoodies', 'bestseller', 'streetwear'],
    featured: false,
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'prod-002',
    handle: 'neo-tokyo-oversized-tee',
    name: 'Neo Tokyo Oversized Tee',
    category: 'Oversized T-Shirt',
    description:
      'Channel the electric pulse of the city that never sleeps. This 280GSM heavyweight vintage-washed cotton tee features a boxy oversized fit, dropped shoulders, and a ribbed collar. The neon-gradient screen print arcs across the chest like a streak of light through rain-slicked streets.',
    price: 49,
    badge: 'TRENDING',
    gradient:
      'bg-gradient-to-br from-cyan-800/35 via-blue-900/30 to-background',
    href: '/product/neo-tokyo-oversized-tee',
    images: [
      {
        gradient:
          'bg-gradient-to-br from-cyan-800/35 via-blue-900/30 to-background',
        alt: 'Neo Tokyo Oversized Tee — front view',
      },
      {
        gradient:
          'bg-gradient-to-br from-sky-800/30 via-cyan-700/25 to-blue-900/35',
        alt: 'Neo Tokyo Oversized Tee — back view',
      },
    ],
    sizes: ['M', 'L', 'XL', '2XL'],
    colors: ['Titanium White', 'Signal Black', 'Neon Cyan'],
    options: [
      {
        name: 'Size',
        values: ['M', 'L', 'XL', '2XL'],
      },
      {
        name: 'Color',
        values: ['Titanium White', 'Signal Black', 'Neon Cyan'],
      },
    ],
    tags: ['tees', 'trending', 'bestseller', 'streetwear'],
    featured: false,
    createdAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'prod-003',
    handle: 'spirit-guardian-figure',
    name: 'Spirit Guardian Figure',
    category: 'Action Figure',
    description:
      'A masterwork of modern anime craftsmanship. This 1/6 scale hand-painted collector figure depicts the Spirit Guardian mid-ceremony, with translucent resin aura effects and an LED-illuminated base. Each piece is individually numbered — limited to 500 units worldwide.',
    price: 79,
    badge: 'LIMITED',
    gradient:
      'bg-gradient-to-br from-amber-700/35 via-red-900/40 to-background',
    href: '/product/spirit-guardian-figure',
    images: [
      {
        gradient:
          'bg-gradient-to-br from-amber-700/35 via-red-900/40 to-background',
        alt: 'Spirit Guardian Figure — front view',
      },
      {
        gradient:
          'bg-gradient-to-br from-orange-800/30 via-amber-600/25 to-red-800/40',
        alt: 'Spirit Guardian Figure — side view',
      },
      {
        gradient:
          'bg-gradient-to-br from-yellow-700/20 via-amber-800/35 to-red-900/45',
        alt: 'Spirit Guardian Figure — LED base detail',
      },
    ],
    sizes: [],
    colors: ['Collector Edition (LED Base)'],
    options: [
      {
        name: 'Edition',
        values: ['Collector Edition (LED Base)'],
      },
    ],
    tags: ['figures', 'limited', 'bestseller', 'collector'],
    featured: false,
    createdAt: '2026-01-20T00:00:00.000Z',
  },
  {
    id: 'prod-004',
    handle: 'crimson-wave-umbrella',
    name: 'Crimson Wave Umbrella',
    category: 'Umbrella',
    description:
      'Defy the storm with the Crimson Wave. This full-length automatic umbrella features a fiberglass-reinforced windproof frame, a 42-inch arc canopy with a custom crimson-to-black gradient print, and a laser-etched tempered steel handle. Rain becomes a backdrop for your aesthetic.',
    price: 39,
    badge: 'HOT DROP',
    gradient: 'bg-gradient-to-br from-accent/30 via-rose-800/35 to-background',
    href: '/product/crimson-wave-umbrella',
    images: [
      {
        gradient:
          'bg-gradient-to-br from-accent/30 via-rose-800/35 to-background',
        alt: 'Crimson Wave Umbrella — open view',
      },
      {
        gradient:
          'bg-gradient-to-br from-rose-900/40 via-accent/20 to-zinc-800/30',
        alt: 'Crimson Wave Umbrella — handle detail',
      },
    ],
    sizes: [],
    colors: ['Crimson Black', 'Blood Rose'],
    options: [
      {
        name: 'Color',
        values: ['Crimson Black', 'Blood Rose'],
      },
    ],
    tags: ['accessories', 'new', 'bestseller', 'umbrella'],
    featured: false,
    createdAt: '2026-02-10T00:00:00.000Z',
  },

  // ── Featured Collection ───────────────────────────────
  {
    id: 'prod-005',
    handle: 'cyber-oni-hoodie',
    name: 'Cyber Oni Heavyweight Hoodie',
    category: 'Limited Drop',
    description:
      'Bold meets brutalist. This 420GSM heavyweight hoodie features a boxy oversized cut, double-lined hood, and a neon Cyber Oni front print that glows under UV. The ribbed hem and cuffs lock in heat while the drop-shoulder silhouette keeps it street-ready.',
    price: 128,
    badge: 'HOT DROP',
    gradient:
      'bg-gradient-to-br from-accent/25 via-purple-800/40 to-background',
    href: '/product/cyber-oni-hoodie',
    images: [
      {
        gradient:
          'bg-gradient-to-br from-accent/25 via-purple-800/40 to-background',
        alt: 'Cyber Oni Hoodie — front view',
      },
      {
        gradient:
          'bg-gradient-to-br from-purple-800/40 via-accent/20 to-violet-900/30',
        alt: 'Cyber Oni Hoodie — back view',
      },
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: ['Obsidian Black', 'Cyber Crimson'],
    options: [
      { name: 'Size', values: ['S', 'M', 'L', 'XL', '2XL'] },
      { name: 'Color', values: ['Obsidian Black', 'Cyber Crimson'] },
    ],
    tags: ['hoodies', 'featured-collection', 'streetwear'],
    featured: true,
    createdAt: '2026-01-25T00:00:00.000Z',
  },
  {
    id: 'prod-006',
    handle: 'ghost-shell-tee',
    name: 'Ghost Shell Oversized Tee',
    category: 'Cyberpunk Series',
    description:
      'A ghost in the machine — this 280GSM oversized tee features a distressed cybernetic back print with cracked-glass details. Heavyweight cotton with a boxy silhouette, dropped shoulders, and a pre-shrunk ribbed collar.',
    price: 65,
    badge: 'BESTSELLER',
    gradient:
      'bg-gradient-to-br from-cyan-800/35 via-blue-900/30 to-background',
    href: '/product/ghost-shell-tee',
    images: [
      {
        gradient:
          'bg-gradient-to-br from-cyan-800/35 via-blue-900/30 to-background',
        alt: 'Ghost Shell Tee — front view',
      },
      {
        gradient:
          'bg-gradient-to-br from-sky-800/30 via-cyan-700/25 to-blue-900/35',
        alt: 'Ghost Shell Tee — back print',
      },
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: ['Titanium White', 'Signal Black'],
    options: [
      { name: 'Size', values: ['S', 'M', 'L', 'XL', '2XL'] },
      { name: 'Color', values: ['Titanium White', 'Signal Black'] },
    ],
    tags: ['tees', 'featured-collection', 'bestseller', 'streetwear'],
    featured: false,
    createdAt: '2026-02-05T00:00:00.000Z',
  },
  {
    id: 'prod-007',
    handle: 'valkyrie-statue',
    name: 'Valkyrie Shattered Star Statue',
    category: 'Collector Archive',
    description:
      'A masterwork of modern anime craftsmanship. This 1/6 scale hand-painted collector figure features translucent LED-lit wings and a shattered-star base. Each piece is individually numbered — limited to 500 units worldwide.',
    price: 245,
    badge: 'LIMITED 500',
    gradient:
      'bg-gradient-to-br from-amber-700/35 via-red-900/40 to-background',
    href: '/product/valkyrie-statue',
    images: [
      {
        gradient:
          'bg-gradient-to-br from-amber-700/35 via-red-900/40 to-background',
        alt: 'Valkyrie Statue — front view',
      },
      {
        gradient:
          'bg-gradient-to-br from-orange-800/30 via-amber-600/25 to-red-800/40',
        alt: 'Valkyrie Statue — LED detail',
      },
    ],
    sizes: [],
    colors: ['Collector Edition (LED Base)'],
    options: [{ name: 'Edition', values: ['Collector Edition (LED Base)'] }],
    tags: ['figures', 'featured-collection', 'limited', 'collector'],
    featured: false,
    createdAt: '2026-01-05T00:00:00.000Z',
  },
  {
    id: 'prod-008',
    handle: 'ronin-umbrella',
    name: 'Ronin Katana Umbrella',
    category: 'Gear & Shield',
    description:
      "A masterless warrior's companion. This full-length automatic umbrella features a fiberglass-reinforced windproof frame, a 42-inch arc canopy with a katana-slice gradient print, and a laser-etched steel handle shaped like a tsuba guard.",
    price: 85,
    badge: 'RESTOCKED',
    gradient:
      'bg-gradient-to-br from-zinc-600/40 via-stone-800/35 to-background',
    href: '/product/ronin-umbrella',
    images: [
      {
        gradient:
          'bg-gradient-to-br from-zinc-600/40 via-stone-800/35 to-background',
        alt: 'Ronin Umbrella — open view',
      },
      {
        gradient:
          'bg-gradient-to-br from-stone-700/40 via-zinc-600/25 to-neutral-800/30',
        alt: 'Ronin Umbrella — handle detail',
      },
    ],
    sizes: [],
    colors: ['Steel Black', 'Crimson Accent'],
    options: [{ name: 'Color', values: ['Steel Black', 'Crimson Accent'] }],
    tags: ['accessories', 'featured-collection', 'umbrella'],
    featured: false,
    createdAt: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'prod-009',
    handle: 'neo-tokyo-jacket',
    name: 'Neo-Tokyo Reflect Jacket',
    category: 'Outerwear',
    description:
      'Built for the electric nights of the mega-city. This lightweight bomber jacket uses water-resistant Japanese nylon with reflective piping that catches every neon glow. The oversized zip-off hood and hidden pocket system make it as functional as it is futuristic.',
    price: 198,
    badge: 'NEW DROP',
    gradient: 'bg-gradient-to-br from-accent/20 via-rose-900/50 to-background',
    href: '/product/neo-tokyo-jacket',
    images: [
      {
        gradient:
          'bg-gradient-to-br from-accent/20 via-rose-900/50 to-background',
        alt: 'Neo-Tokyo Jacket — front view',
      },
      {
        gradient:
          'bg-gradient-to-br from-rose-800/40 via-accent/20 to-background',
        alt: 'Neo-Tokyo Jacket — detail',
      },
    ],
    sizes: ['M', 'L', 'XL', '2XL'],
    colors: ['Signal Black', 'Neon Crimson'],
    options: [
      { name: 'Size', values: ['M', 'L', 'XL', '2XL'] },
      { name: 'Color', values: ['Signal Black', 'Neon Crimson'] },
    ],
    tags: ['outerwear', 'featured-collection', 'new', 'streetwear'],
    featured: false,
    createdAt: '2026-02-15T00:00:00.000Z',
  },
];

// ─── Type-safe convenience accessors ─────────────────────────
export type ProductHandle = (typeof PRODUCTS)[number]['handle'];
export type ProductId = (typeof PRODUCTS)[number]['id'];
