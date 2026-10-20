'use client';

import { useRef, useMemo } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/utils/cn';
import { ProductCard } from './ProductCard';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import type { Product } from '@/data/products';

export interface FeaturedCollectionProps {
  className?: string;
}

/**
 * Map a Product object into the fields ProductCard consumes.
 * This avoids spreading extra Product fields (id, handle, description, …)
 * as HTML attributes on the underlying <Link> element.
 */
function toCardProps(p: Product) {
  return {
    name: p.name,
    category: p.category,
    price: p.price,
    currencyCode: p.currencyCode,
    badge: p.badge,
    gradient: p.gradient,
    href: p.href,
  };
}

/**
 * Premium featured-collection section.
 *
 * ── Layout ─────────────────────────────────────────────
 * One large hero card (left) + a 2×2 grid of smaller
 * cards (right) on desktop. Stacks vertically on mobile.
 *
 * ── Animations (GSAP + ScrollTrigger) ─────────────────
 * • Header items fade up with stagger.
 * • Hero card scales in (0.92 → 1) with an opacity fade.
 * • Smaller cards fade up with staggered delay.
 * All fire when the section scrolls into view (`top 80%`).
 *
 * ── Responsive ─────────────────────────────────────────
 * Mobile: 1 column, stacked.
 * Tablet (md): 2 columns, featured spans full width.
 * Desktop (lg+): 4-column grid, featured spans 2 cols × 2 rows.
 */
export function FeaturedCollection({ className }: FeaturedCollectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const catalog = useCatalogProducts();

  const featuredProduct = useMemo(
    () => catalog.find(p => p.featured),
    [catalog]
  );

  const smallProducts = useMemo(
    () =>
      [...catalog]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .filter(p => p.handle !== featuredProduct?.handle)
        .slice(0, 4),
    [catalog, featuredProduct]
  );

  // ── Scroll-triggered reveal ──────────────────────────
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const ctx = gsap.context(() => {
        const scrollTrigger = {
          trigger: section,
          start: 'top 80%' as const,
          toggleActions: 'play none none none' as const,
        };

        // 1. Header reveal
        gsap.from('[data-featured-header]', {
          scrollTrigger,
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
        });

        // 2. Hero card — scale + fade
        gsap.from('[data-featured-hero]', {
          scrollTrigger,
          scale: 0.92,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        });

        // 3. Small cards — fade up with stagger
        gsap.from('[data-featured-card]', {
          scrollTrigger,
          y: 40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
        });
      }, section);

      return () => ctx.revert();
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative py-24 sm:py-32 bg-background overflow-hidden',
        className
      )}
    >
      {/* ── Subtle background grid ─────────────────────────────── */}
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      {/* Top-edge accent glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <p
              data-featured-header
              className="text-xs font-bold text-accent tracking-[0.25em] uppercase"
            >
              Latest Drops
            </p>
            <h2
              data-featured-header
              className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.1]"
            >
              Featured <span className="text-accent">Collection</span>
            </h2>
          </div>
          <p
            data-featured-header
            className="text-sm sm:text-base text-zinc-400 max-w-sm leading-relaxed"
          >
            Curated premium pieces from our latest drop &mdash; each engineered
            with heavyweight materials and cyberpunk restraint.
          </p>
        </div>
      </div>

      {/* ── Product grid ──────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {/* Featured (large) card — spans 2 cols on md+, 2 rows on lg+ */}
          <div data-featured-hero className="md:col-span-2 lg:row-span-2">
            {featuredProduct && (
              <ProductCard {...toCardProps(featuredProduct)} featured />
            )}
          </div>

          {/* Smaller cards — auto-flow 2×2, each wrapped for stagger */}
          <div className="md:col-span-2 grid grid-cols-2 gap-5 sm:gap-6">
            {smallProducts.map(product => (
              <div key={product.handle} data-featured-card>
                <ProductCard {...toCardProps(product)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
