// ─── Product Reviews (Mock Data) ────────────────────────────────────────
// Sample reviews powering the Product Reviews section until a real review
// backend exists. Photos reference existing public image assets.

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export interface ReviewImage {
  src: string;
  alt: string;
}

export interface ProductReview {
  id: string;
  /** Product this review belongs to */
  productHandle: string;
  author: string;
  rating: ReviewRating;
  title: string;
  body: string;
  /** ISO-8601 date */
  date: string;
  verified: boolean;
  helpfulCount: number;
  images?: ReviewImage[];
}

export interface ReviewSummary {
  productHandle: string;
  average: number;
  total: number;
  /** Rating (1–5) → number of reviews at that rating */
  distribution: Record<ReviewRating, number>;
}

// ─── Reviews Database ────────────────────────────────────────────────

export const REVIEWS: ProductReview[] = [
  // ── Shadow Realm Hoodie ─────────────────────────────────────────
  {
    id: 'rvw-001',
    productHandle: 'shadow-realm-hoodie',
    author: 'Kaito Y.',
    rating: 5,
    title: 'Heavier than expected — in the best way',
    body: 'The 420GSM fleece is genuinely substantial. It hangs perfectly with the oversized cut and the print has a subtle texture you can feel. Already my most-worn hoodie.',
    date: '2026-07-18T00:00:00.000Z',
    verified: true,
    helpfulCount: 24,
    images: [
      {
        src: '/images/products/hoodie_cyber.jpg',
        alt: 'Shadow Realm Hoodie worn by reviewer',
      },
    ],
  },
  {
    id: 'rvw-002',
    productHandle: 'shadow-realm-hoodie',
    author: 'Mina R.',
    rating: 5,
    title: 'Blacklight glow is real',
    body: 'I was skeptical about the glow detail but it pops under UV exactly like the description says. Sized down from L to M and the fit is perfect.',
    date: '2026-06-29T00:00:00.000Z',
    verified: true,
    helpfulCount: 11,
  },
  {
    id: 'rvw-003',
    productHandle: 'shadow-realm-hoodie',
    author: 'Devon K.',
    rating: 4,
    title: 'Great quality, runs large',
    body: 'Quality is top tier — double-lined hood, clean stitching. Just note it runs big. I would have preferred a slightly shorter drop shoulder.',
    date: '2026-05-12T00:00:00.000Z',
    verified: true,
    helpfulCount: 8,
  },
  {
    id: 'rvw-004',
    productHandle: 'shadow-realm-hoodie',
    author: 'Priya S.',
    rating: 5,
    title: 'Collector grade',
    body: 'The packaging alone felt premium — a zip bag and care card included. This is my third piece from the brand and the consistency is unreal.',
    date: '2026-04-02T00:00:00.000Z',
    verified: true,
    helpfulCount: 5,
  },

  // ── Neo Tokyo Oversized Tee ─────────────────────────────────────
  {
    id: 'rvw-005',
    productHandle: 'neo-tokyo-oversized-tee',
    author: 'Ren A.',
    rating: 5,
    title: 'Neon print is stunning',
    body: 'The gradient arc across the chest looks even better in person. Vintage-washed cotton is soft from the first wear with zero shrink.',
    date: '2026-07-22T00:00:00.000Z',
    verified: true,
    helpfulCount: 19,
    images: [
      {
        src: '/images/hero_anime_model.jpg',
        alt: 'Neo Tokyo Tee styled on model',
      },
    ],
  },
  {
    id: 'rvw-006',
    productHandle: 'neo-tokyo-oversized-tee',
    author: 'Jonas W.',
    rating: 4,
    title: 'Solid streetwear staple',
    body: 'Boxy cut fits true to the size chart. Wish there were more colorways but the Titanium White is a clean canvas.',
    date: '2026-06-15T00:00:00.000Z',
    verified: false,
    helpfulCount: 6,
  },
  {
    id: 'rvw-007',
    productHandle: 'neo-tokyo-oversized-tee',
    author: 'Yuki M.',
    rating: 5,
    title: 'My daily uniform now',
    body: 'Wore it to three conventions this season. The 280GSM weight keeps its shape after multiple washes. Zero complaints.',
    date: '2026-03-30T00:00:00.000Z',
    verified: true,
    helpfulCount: 14,
  },

  // ── Spirit Guardian Figure ───────────────────────────────────────
  {
    id: 'rvw-008',
    productHandle: 'spirit-guardian-figure',
    author: 'Alan C.',
    rating: 5,
    title: 'LED base is museum-quality',
    body: 'The translucent resin aura catches light beautifully and the LED base cycles through three modes. Numbered 214/500 — a centerpiece for sure.',
    date: '2026-07-05T00:00:00.000Z',
    verified: true,
    helpfulCount: 31,
    images: [
      {
        src: '/images/products/figure_cyber.jpg',
        alt: 'Spirit Guardian Figure on shelf',
      },
    ],
  },
  {
    id: 'rvw-009',
    productHandle: 'spirit-guardian-figure',
    author: 'Grace T.',
    rating: 5,
    title: 'Hand-paint detail is unreal',
    body: 'Zoom in on the photos — every brushstroke translates to the final piece. The box came triple-wrapped with a certificate of authenticity.',
    date: '2026-04-20T00:00:00.000Z',
    verified: true,
    helpfulCount: 17,
  },
  {
    id: 'rvw-010',
    productHandle: 'spirit-guardian-figure',
    author: 'Marcus B.',
    rating: 4,
    title: 'Beautiful, fragile aura',
    body: 'Gorgeous piece. The resin aura is delicate so handle with care during assembly. Slightly smaller scale than I imagined but proportionally perfect.',
    date: '2026-02-11T00:00:00.000Z',
    verified: true,
    helpfulCount: 9,
  },

  // ── Crimson Wave Umbrella ────────────────────────────────────────
  {
    id: 'rvw-011',
    productHandle: 'crimson-wave-umbrella',
    author: 'Lena F.',
    rating: 5,
    title: 'Finally an umbrella worth buying',
    body: 'The gradient canopy draws comments everywhere. Automatic open is smooth and the fiberglass frame handled a windstorm without inverting.',
    date: '2026-07-14T00:00:00.000Z',
    verified: true,
    helpfulCount: 13,
  },
  {
    id: 'rvw-012',
    productHandle: 'crimson-wave-umbrella',
    author: 'Sam D.',
    rating: 4,
    title: 'Sleek and sturdy',
    body: 'Laser-etched handle feels premium. The canopy is 42 inches so it covers two people comfortably. Only wish it came with a carry sleeve.',
    date: '2026-05-26T00:00:00.000Z',
    verified: false,
    helpfulCount: 4,
  },

  // ── Cyber Oni Hoodie ─────────────────────────────────────────────
  {
    id: 'rvw-013',
    productHandle: 'cyber-oni-hoodie',
    author: 'Tomo I.',
    rating: 5,
    title: 'The Oni print pops under UV',
    body: 'Brutalist silhouette, boxy fit, neon front print that glows like the promo shots. The 420GSM weight keeps you warm without feeling stiff.',
    date: '2026-07-25T00:00:00.000Z',
    verified: true,
    helpfulCount: 22,
    images: [
      {
        src: '/images/products/hoodie_cyber.jpg',
        alt: 'Cyber Oni Hoodie front print',
      },
    ],
  },
  {
    id: 'rvw-014',
    productHandle: 'cyber-oni-hoodie',
    author: 'Hana K.',
    rating: 5,
    title: 'Worth every cent',
    body: 'You can feel the drop-shoulder construction. Ribbed cuffs lock in heat, hood is double-lined. This replaced my old go-to hoodie immediately.',
    date: '2026-06-08T00:00:00.000Z',
    verified: true,
    helpfulCount: 16,
  },
  {
    id: 'rvw-015',
    productHandle: 'cyber-oni-hoodie',
    author: 'Zach P.',
    rating: 3,
    title: 'Great hoodie, long shipping',
    body: 'Product quality is excellent. Deducting a star because international shipping took over two weeks with limited tracking updates.',
    date: '2026-01-28T00:00:00.000Z',
    verified: true,
    helpfulCount: 7,
  },

  // ── Ghost Shell Tee ──────────────────────────────────────────────
  {
    id: 'rvw-016',
    productHandle: 'ghost-shell-tee',
    author: 'Nina V.',
    rating: 5,
    title: 'Distressed print is perfect',
    body: 'The cracked-glass back print has real depth — it almost looks embossed. Oversized cut drapes exactly like the lookbook.',
    date: '2026-07-08T00:00:00.000Z',
    verified: true,
    helpfulCount: 12,
  },
  {
    id: 'rvw-017',
    productHandle: 'ghost-shell-tee',
    author: 'Ollie G.',
    rating: 4,
    title: 'Great value',
    body: 'Heavyweight without the heavyweight price. Color stayed vibrant after a month of regular washing. Runs true to size.',
    date: '2026-03-17T00:00:00.000Z',
    verified: true,
    helpfulCount: 5,
  },

  // ── Valkyrie Statue ──────────────────────────────────────────────
  {
    id: 'rvw-018',
    productHandle: 'valkyrie-statue',
    author: 'Ivy H.',
    rating: 5,
    title: 'LED wings are breathtaking',
    body: 'The shattered-star base and translucent wings catch light from every angle. Arrived in flawless condition with white gloves and a cloth.',
    date: '2026-07-30T00:00:00.000Z',
    verified: true,
    helpfulCount: 27,
    images: [
      {
        src: '/images/products/figure_cyber.jpg',
        alt: 'Valkyrie statue LED lit display',
      },
    ],
  },
  {
    id: 'rvw-019',
    productHandle: 'valkyrie-statue',
    author: 'Ethan L.',
    rating: 5,
    title: 'An investment piece',
    body: 'Numbered 88/500. The detail on the wings alone justifies the price. This is what collector-grade looks like.',
    date: '2026-06-20T00:00:00.000Z',
    verified: true,
    helpfulCount: 20,
  },
  {
    id: 'rvw-020',
    productHandle: 'valkyrie-statue',
    author: 'Rosa M.',
    rating: 4,
    title: 'Stunning, heavy packaging',
    body: 'Incredible sculpt. Box is enormous and heavy — clear some shelf space before ordering. Assembly takes about five careful minutes.',
    date: '2026-04-09T00:00:00.000Z',
    verified: true,
    helpfulCount: 6,
  },

  // ── Ronin Umbrella ───────────────────────────────────────────────
  {
    id: 'rvw-021',
    productHandle: 'ronin-umbrella',
    author: 'Ken T.',
    rating: 5,
    title: 'The tsuba handle is genius',
    body: 'Laser-etched guard-shaped handle with a comfortable grip. The katana-slice gradient print is subtle by day and striking in the rain.',
    date: '2026-07-11T00:00:00.000Z',
    verified: true,
    helpfulCount: 9,
  },
  {
    id: 'rvw-022',
    productHandle: 'ronin-umbrella',
    author: 'Bea C.',
    rating: 4,
    title: 'Aesthetic and functional',
    body: 'Windproof frame passed the test in a proper storm. Minor gripe: the canopy is a touch heavy for petite frames to hold for long walks.',
    date: '2026-02-22T00:00:00.000Z',
    verified: false,
    helpfulCount: 3,
  },

  // ── Neo-Tokyo Jacket ─────────────────────────────────────────────
  {
    id: 'rvw-023',
    productHandle: 'neo-tokyo-jacket',
    author: 'Alex R.',
    rating: 5,
    title: 'Reflective piping is chef kiss',
    body: 'Catches every streetlight at night — I get asked about it constantly. Water-resistant nylon handled a downpour and the hidden pockets are perfect for travel.',
    date: '2026-07-27T00:00:00.000Z',
    verified: true,
    helpfulCount: 18,
    images: [
      {
        src: '/images/hero_anime_model.jpg',
        alt: 'Neo-Tokyo Jacket reflective piping',
      },
    ],
  },
  {
    id: 'rvw-024',
    productHandle: 'neo-tokyo-jacket',
    author: 'Suki N.',
    rating: 5,
    title: 'Lightweight and sharp',
    body: 'Slim profile, generous stretch in the shoulders. The zip-off hood is genuinely useful for the in-between seasons. My favorite drop this year.',
    date: '2026-05-19T00:00:00.000Z',
    verified: true,
    helpfulCount: 11,
  },
  {
    id: 'rvw-025',
    productHandle: 'neo-tokyo-jacket',
    author: 'Chris B.',
    rating: 4,
    title: 'Runs slim, size up',
    body: 'Quality is excellent but I would order one size up if you plan to layer. The reflector detail and hidden pockets are the standout features.',
    date: '2026-03-03T00:00:00.000Z',
    verified: true,
    helpfulCount: 8,
  },
];

// ─── Accessors ──────────────────────────────────────────────────────

/** Reviews for a single product, newest first. */
export function getReviewsForProduct(handle: string): ProductReview[] {
  return REVIEWS.filter(r => r.productHandle === handle).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/** Aggregate a list of reviews into a summary (average, total, distribution). */
export function summarizeReviews(
  reviews: ProductReview[]
): ReviewSummary | null {
  if (reviews.length === 0) return null;

  const distribution: Record<ReviewRating, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  let totalStars = 0;

  for (const review of reviews) {
    distribution[review.rating] += 1;
    totalStars += review.rating;
  }

  return {
    productHandle: reviews[0].productHandle,
    average: totalStars / reviews.length,
    total: reviews.length,
    distribution,
  };
}

/** Aggregate rating summary for a product (from the static review database). */
export function getReviewSummary(handle: string): ReviewSummary | null {
  return summarizeReviews(getReviewsForProduct(handle));
}
