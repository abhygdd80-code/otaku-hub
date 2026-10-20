'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/utils/cn';
import { ProductCard } from '@/components/featured/ProductCard';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';

export interface BestSellersProps {
  className?: string;
}

/**
 * Best-sellers product grid — conversion-focused section.
 *
 * ── Layout ─────────────────────────────────────────────
 * Centered header row followed by a 4-column product grid
 * (2 columns on tablet, 1 on mobile).
 *
 * ── Animations (GSAP + ScrollTrigger) ─────────────────
 * • Header items fade up with stagger.
 * • Product cards fade up with stagger.
 * Both fire when the section scrolls into view (`top 80%`).
 *
 * ── Interactions ──────────────────────────────────────
 * Each card has a 3D tilt, image zoom, quick-action buttons
 * (add to cart, quick view, wishlist) that appear on hover,
 * and a card lift effect — all CSS + JS event handlers
 * contained within `ProductCard`.
 *
 * Respects `prefers-reduced-motion`.
 */
export function BestSellers({ className }: BestSellersProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const catalog = useCatalogProducts();

  const bestsellerProducts = useMemo(
    () => catalog.filter(p => p.tags.includes('bestseller')),
    [catalog]
  );

  // ── Reduced motion detection ─────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Scroll-triggered reveal ──────────────────────────
  useGSAP(
    () => {
      if (reducedMotion) return;

      const section = sectionRef.current;
      if (!section) return;

      const ctx = gsap.context(() => {
        const scrollTrigger = {
          trigger: section,
          start: 'top 80%' as const,
          toggleActions: 'play none none none' as const,
        };

        // 1. Header reveal
        gsap.from('[data-bestsellers-header]', {
          scrollTrigger,
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
        });

        // 2. Card stagger
        gsap.from('[data-bestsellers-card]', {
          scrollTrigger,
          y: 40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
        });
      }, section);

      return () => ctx.revert();
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  );

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative py-24 sm:py-32 bg-background overflow-hidden',
        className
      )}
    >
      {/* ── Subtle background grid ───────────────────────────── */}
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      {/* Top-edge accent glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p
            data-bestsellers-header
            className="text-xs font-bold text-accent tracking-[0.25em] uppercase"
          >
            Best Sellers
          </p>
          <h2
            data-bestsellers-header
            className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.1]"
          >
            Most Loved <span className="text-accent">Drops</span>
          </h2>
          <p
            data-bestsellers-header
            className="text-sm sm:text-base text-zinc-400 leading-relaxed mt-3 max-w-md mx-auto"
          >
            Discover the pieces our community can&apos;t stop wearing.
          </p>
        </div>
      </div>

      {/* ── Product grid ──────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {bestsellerProducts.map((product, i) => (
            <div key={product.handle} data-bestsellers-card>
              <ProductCard
                name={product.name}
                category={product.category}
                price={product.price}
                currencyCode={product.currencyCode}
                badge={product.badge}
                gradient={product.gradient}
                href={product.href}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Section CTA ─────────────────────────────────────────── */}
      <div className="relative z-10 mt-12 sm:mt-16 text-center">
        <Link
          href="/collections/all"
          className={cn(
            'group inline-flex items-center gap-2.5',
            'px-8 py-3.5 rounded-xl',
            'border border-zinc-700 hover:border-accent/50',
            'bg-white/5 backdrop-blur-sm',
            'text-white font-semibold text-sm tracking-wider uppercase',
            'transition-all duration-300',
            'hover:bg-white/10 hover:-translate-y-0.5',
            'active:translate-y-0',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          )}
          aria-label="Shop All Best Sellers"
        >
          <span>Shop All Best Sellers</span>
          <ArrowRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
