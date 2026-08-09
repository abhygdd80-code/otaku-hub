'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/utils/cn';
import { CategoryCard, type CategoryCardProps } from './CategoryCard';

export interface CategoryItem extends CategoryCardProps {}

export interface CategoryShowcaseProps {
  /** Category cards to display — required so the caller supplies live product counts. */
  categories: CategoryItem[];
  className?: string;
}

/**
 * Cinematic horizontal category showcase.
 *
 * ── Layout ──────────────────────────────────────────────
 * Fixed-height section with a header row and a horizontal
 * marquee of category cards beneath it. The marquee duplicates
 * the category list to create a seamless infinite loop.
 *
 * ── Animations (GSAP + ScrollTrigger) ───────────────────
 * • **Scroll reveal** — heading elements fade/slide up when
 *   the section enters the viewport (`top 82%`).
 * • **Infinite marquee** — GSAP `.to()` with `xPercent: -50`
 *   scrolls through the duplicated items in a seamless loop.
 *   The marquee kicks off when ScrollTrigger fires (`top 80%`).
 * • **Pause on hover** — mouse enter pauses the tween; leave
 *   resumes it.
 *
 * ── Responsive ──────────────────────────────────────────
 * The marquee works on all viewports via GSAP. Edge fade
 * gradients mask the abrupt entry/exit of cards.
 *
 * ── Accessibility ───────────────────────────────────────
 * The auto-scroll is cosmetic — each card remains a valid
 * focusable link. `prefers-reduced-motion` users see a static
 * row (no marquee tween) but the cards are still navigable.
 */
export function CategoryShowcase({
  categories,
  className,
}: CategoryShowcaseProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeTween = useRef<gsap.core.Tween | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // ── Detect reduced motion ──────────────────────────────
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Scroll-triggered reveal + marquee ──────────────────
  useGSAP(
    () => {
      const section = sectionRef.current;
      const marquee = marqueeRef.current;
      if (!section || !marquee) return;

      const ctx = gsap.context(() => {
        // 1. Header reveal
        gsap.from('[data-category-reveal]', {
          scrollTrigger: {
            trigger: section,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
          y: 40,
          opacity: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
        });

        // 2. Infinite marquee (skip when reduced motion)
        if (!reducedMotion) {
          marqueeTween.current = gsap.to(marquee, {
            xPercent: -50,
            duration: 45,
            ease: 'none',
            repeat: -1,
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          });
        }
      }, section);

      return () => ctx.revert();
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  );

  // ── Pause/resume on hover ──────────────────────────────
  useEffect(() => {
    if (marqueeTween.current) {
      marqueeTween.current.paused(isPaused);
    }
  }, [isPaused]);

  // Duplicate items for the seamless infinite loop
  const marqueeItems = [...categories, ...categories];

  return (
    <section
      ref={sectionRef}
      id="category-slider"
      className={cn(
        'relative py-24 sm:py-32 bg-background overflow-hidden',
        className
      )}
    >
      {/* ── Background — subtle dot-grid pattern ───────────── */}
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      {/* Top-edge accent glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 sm:mb-18">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3">
            <p
              data-category-reveal
              className="text-xs font-bold text-accent tracking-[0.25em] uppercase"
            >
              Browse Catalog
            </p>
            <h2
              data-category-reveal
              className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.1]"
            >
              Curated <span className="text-accent">Categories</span>
            </h2>
          </div>
          <p
            data-category-reveal
            className="text-sm sm:text-base text-zinc-400 max-w-sm leading-relaxed"
          >
            Limited drops across premium apparel, figures, and collectibles
            &mdash; engineered for the otaku aesthetic.
          </p>
        </div>
      </div>

      {/* ── Horizontal marquee ───────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden py-4 sm:py-6 select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          ref={marqueeRef}
          className="flex gap-5 sm:gap-6 w-max"
          style={{ willChange: 'transform' }}
        >
          {marqueeItems.map((cat, idx) => (
            <CategoryCard key={`${cat.id}-${idx}`} {...cat} />
          ))}
        </div>

        {/* Fade edges — mask the card entry/exit */}
        <div className="absolute inset-y-0 left-0 w-20 sm:w-32 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-20 sm:w-32 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
}
