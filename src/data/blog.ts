// ─── Blog Posts (Local CMS Fallback) ────────────────────────────────
// Local article content powering /blog until a live Shopify blog is
// connected. When `isShopifyConfigured()` is true, `BlogHydrator`
// replaces these with articles fetched from the store's online store.

export interface BlogPost {
  /** Stable id (Shopify article id or local slug). */
  id: string;
  /** URL-safe slug used in the /blog/[slug] route. */
  slug: string;
  title: string;
  /** One-to-two sentence teaser shown on cards + used for meta. */
  excerpt: string;
  /** Full article body. Plain text for local posts; HTML when Shopify-backed. */
  content: string;
  /** Rendered HTML (Shopify `contentHtml`); optional for local posts. */
  contentHtml?: string;
  coverImage?: string;
  coverImageAlt?: string;
  author: string;
  authorImage?: string;
  /** ISO-8601 publish date. */
  publishedAt: string;
  tags: string[];
  /** Estimated read time in minutes. */
  readingTime: number;
  featured?: boolean;
}

export const LOCAL_POSTS: BlogPost[] = [
  {
    id: 'blog-local-001',
    slug: 'drop-guide-shadow-realm',
    title: 'Inside the Drop: Shadow Realm Hoodie',
    excerpt:
      'We break down the design language, the 420GSM build, and the blacklight detailing behind our best-selling drop.',
    content: `The Shadow Realm Hoodie started as a single sketch in our Tokyo studio. We wanted something that read "brutalist silhouette" from across the street but rewarded close inspection — hence the blacklight-reactive print.

BUILD
The body is a 420GSM brushed fleece that holds its structure through a full season of wear. Drop shoulders, a double-lined hood, and ribbed cuffs that lock in heat without feeling restrictive.

THE PRINT
The front graphic is a multi-pass screen print with a translucent underlay. Under normal light it reads as a dark, subtle tone-on-tone; under UV it snaps into a full electric glow. Each print is inspected individually before it ships.

FIT NOTES
Most customers find the oversized cut runs one size large. If you are between sizes, size down. The full size chart is available on the product page.

LIMITED RUN
Every drop is numbered and produced in a single run. When a colorway sells through, it does not return.`,
    coverImage: '/images/products/hoodie_cyber.jpg',
    coverImageAlt: 'Shadow Realm Hoodie on display',
    author: 'OtakuSaga Design Team',
    publishedAt: '2026-07-20T09:00:00.000Z',
    tags: ['drops', 'hoodies', 'guide'],
    readingTime: 4,
    featured: true,
  },
  {
    id: 'blog-local-002',
    slug: 'care-guide-heavyweight-streetwear',
    title: 'The Care Guide: Keeping Heavyweight Streetwear Alive',
    excerpt:
      'Wash cold, dry flat, skip the dryer sheet — the complete routine for 420GSM fleece and premium graphics.',
    content: `A 420GSM hoodie is an investment. Treat it like one.

COLD WASH ONLY
Hot water relaxes the fibers and can dull screen prints over time. Wash inside-out in cold water on a gentle cycle.

SKIP THE DRYER
Tumble drying breaks down the brush on heavyweight fleece and can crack water-based prints. Lay flat to dry, reshaping the shoulders while it is damp.

DRYER SHEETS ARE THE ENEMY
Fabric softener and dryer sheets coat fibers with wax, which reduces breathability and mutes vibrant prints. If you need static control, a vinegar rinse works.

SPOT TREAT FIRST
Treat stains directly before a full wash. For the blacklight-reactive inks on our Shadow Realm pieces, blot — never scrub.

STORAGE
Fold rather than hang. Hanging heavy fleece on a thin hanger stretches the shoulders out over months.`,
    coverImage: '/images/hero_anime_model.jpg',
    coverImageAlt: 'Heavyweight streetwear care detail',
    author: 'OtakuSaga Care Team',
    publishedAt: '2026-07-08T09:00:00.000Z',
    tags: ['guides', 'hoodies', 'care'],
    readingTime: 5,
  },
  {
    id: 'blog-local-003',
    slug: 'collector-guide-1-6-scale-figures',
    title: 'A Collector’s Guide to 1/6 Scale Figures',
    excerpt:
      'Edition numbers, LED bases, resin vs. PVC — everything to know before your first premium statue.',
    content: `Premium 1/6 scale figures are the crown of any collection. Here is what separates a great piece from a shelf warmer.

EDITION NUMBERS
Our statues are individually numbered. Lower numbers carry a collector premium, but the important thing is the certificate of authenticity that ships with every piece.

RESIN VS PVC
Resin captures finer detail and is heavier and more fragile. PVC is more forgiving for play or repositioning. Our premium line is hand-painted resin with LED illumination baked into the base.

THE LED BASE
The Spirit Guardian and Valkyrie statues feature a three-mode LED base. It ships with a USB-C cable — the base cycles through warm, cool, and mixed light. Swap modes with a single touch.

PLACEMENT
LED pieces look best in a dark cabinet, two to three feet above eye level. Avoid direct sunlight, which can yellow translucent resin over years.

ASSEMBLY
Figures ship in sections. Take your time, follow the numbered guide, and handle the translucent aura pieces by the base, not the edges.`,
    coverImage: '/images/products/figure_cyber.jpg',
    coverImageAlt: '1/6 scale collector figure with LED base',
    author: 'OtakuSaga Collectors Desk',
    publishedAt: '2026-06-24T09:00:00.000Z',
    tags: ['figures', 'guides', 'collectors'],
    readingTime: 6,
  },
  {
    id: 'blog-local-004',
    slug: 'oversized-tees-styling-guide',
    title: 'How to Style Oversized Tees Like the Lookbook',
    excerpt:
      'Proportions, layering, and the details that make a boxy fit look intentional rather than accidental.',
    content: `The oversized tee is the most versatile piece in the drop rotation. The trick is all in the proportions.

LET THE SHOULDERS DROP
An oversized tee should sit on the deltoid, not the shoulder tip. If the shoulder seam rides up to your neck, it is too small. The 280GSM boxy cut is designed to do this work for you.

BALANCE THE BOTTOM
Pair a boxy top with a tapered or straight-leg bottom. A wide top over wide bottoms reads sloppy; a wide top over a fitted bottom reads intentional.

LAYERING
The boxy silhouette was made for layering. Under a bomber or technical jacket, the tee acts as a visual anchor. In spring, a white oversized tee under a knit vest is an easy win.

THE WASH
Our oversized line uses a vintage wash that pre-softens the cotton and deepens the print colors. It will not shrink much after the first wash — but keep it out of the dryer regardless.

SIZING
If you are between sizes and want the true oversized look, size up one. If you want the "fitted oversized" look, stay true to size.`,
    coverImage: '/images/hero_anime_model.jpg',
    coverImageAlt: 'Oversized tee styled with technical jacket',
    author: 'OtakuSaga Style Desk',
    publishedAt: '2026-06-02T09:00:00.000Z',
    tags: ['guides', 'tees', 'style'],
    readingTime: 4,
  },
  {
    id: 'blog-local-005',
    slug: 'umbrella-tech-beyond-the-rain',
    title: 'Umbrella Tech: What Makes a $90 Umbrella',
    excerpt:
      'Fiberglass ribs, laser-etched handles, and gradient canopies — the engineering hiding inside our windproof line.',
    content: `An umbrella you actually enjoy carrying is a rare thing. Here is what goes into ours.

FIBERGLASS RIBS
Steel ribs bend in a gust; fiberglass flexes and springs back. Each of our full-length frames uses a fiberglass rib set rated for sustained 25mph winds.

LASER-ETCHED HANDLES
The tsuba and katana-slice details are laser-etched into the grip, not printed. The texture adds grip in rain and survives years of use.

GRADIENT CANOPIES
Our canopies are dyed in a single continuous gradient — each one is slightly unique. The canopy is 42 inches across, covering two people at a comfortable distance.

AUTO-OPEN MECHANISM
The automatic open is spring-assisted with a locked closure. One press opens, one pull closes. There is no button to accidentally hit mid-stride.

CARE
Rinse with fresh water after use in the rain and let it dry fully before closing to keep the mechanism smooth.`,
    coverImage: '/images/hero_anime_model.jpg',
    coverImageAlt: 'Gradient umbrella with laser-etched handle',
    author: 'OtakuSaga Product Lab',
    publishedAt: '2026-05-12T09:00:00.000Z',
    tags: ['accessories', 'guides', 'product'],
    readingTime: 4,
  },
  {
    id: 'blog-local-006',
    slug: 'new-drops-july-roundup',
    title: 'July Drop Roundup: Everything That Landed',
    excerpt:
      'The Valkyrie statue, the Neo-Tokyo jacket, and the return of the Cyber Oni — every drop from the month, in one place.',
    content: `July was our biggest month of the year. Here is the complete rundown.

VALKYRIE STATUE
Numbered 88/500 for our reviewers, the shattered-star base and LED wings sold through 60% in the first 72 hours. A second production run is under consideration — sign up for the newsletter to get the heads-up first.

NEO-TOKYO JACKET
The water-resistant nylon bomber with zip-off hood and reflective piping became the fastest-selling jacket we have ever released. Hidden travel pockets sealed the deal.

CYBER ONI RETURNS
The brutalist Oni print hoodie returned with a refreshed blacklight detail. The first run sold out in a weekend.

WHAT IS NEXT
August brings a new oversized tee colorway and the first drop in our hand-painted figure series for Q4. Watch the New Drops collection.`,
    coverImage: '/images/products/hoodie_cyber.jpg',
    coverImageAlt: 'July new drops roundup',
    author: 'OtakuSaga Editorial',
    publishedAt: '2026-08-01T09:00:00.000Z',
    tags: ['drops', 'roundup', 'news'],
    readingTime: 3,
    featured: true,
  },
];

// ─── Accessors ──────────────────────────────────────────────────────

/** Sort posts newest-first (stable for equal dates). */
export function sortPostsNewestFirst(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Compute an approximate reading time from a body of text, falling back
 * to the provided value when the text is short or already provided by
 * the CMS.
 */
export function computeReadingTime(text: string, fallback = 3): number {
  const words = text.trim().split(/\s+/).length;
  if (words < 60) return fallback;
  return Math.max(1, Math.ceil(words / 220));
}
