'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock, Compass, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/utils/cn';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { RecentlyViewedCard } from './RecentlyViewedCard';

export interface RecentlyViewedProps {
  /** Product to exclude from the rail (e.g. the one currently being viewed) */
  excludeHandle?: string;
  className?: string;
}

/**
 * "Keep exploring" rail — a horizontal slider of recently viewed products.
 *
 * Backed by the persisted `useRecentlyViewedStore` (localStorage, max 8),
 * surfaced through the reusable `useRecentlyViewed` hook.
 *
 * ── States ──────────────────────────────────────────────
 * • Loading — renders nothing until the store has rehydrated so the rail
 *   never flashes empty on first paint.
 * • Empty (history cleared / never visited) — a premium "nothing here yet"
 *   panel with a CTA into the collections.
 * • Populated — snapped horizontal slider with arrow buttons.
 *
 * ── Interactions ────────────────────────────────────────
 * • Snapped horizontal scroll with arrow buttons (keyboard accessible).
 * • GSAP fade-up reveal of header + cards when scrolled into view
 *   (skipped under `prefers-reduced-motion`).
 * • "Clear" removes the whole history.
 */
export function RecentlyViewed({
  excludeHandle,
  className,
}: RecentlyViewedProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const { products, isLoaded, clear, count } = useRecentlyViewed(excludeHandle);

  // ── Reduced motion detection ─────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Scroll-triggered reveal ──────────────────────────────
  useGSAP(
    () => {
      if (reducedMotion) return;
      const section = sectionRef.current;
      if (!section) return;

      const ctx = gsap.context(() => {
        const scrollTrigger = {
          trigger: section,
          start: 'top 85%' as const,
          toggleActions: 'play none none none' as const,
        };

        gsap.from('[data-recently-header]', {
          scrollTrigger,
          y: 24,
          opacity: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power3.out',
        });

        gsap.from('[data-recently-card]', {
          scrollTrigger,
          y: 32,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
        });
      }, section);

      return () => ctx.revert();
    },
    { scope: sectionRef, dependencies: [reducedMotion, count] }
  );

  const scrollRail = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * rail.clientWidth * 0.75,
      behavior: 'smooth',
    });
  };

  // Not rehydrated yet — render nothing to avoid flashing empty.
  if (!isLoaded) return null;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="recently-viewed-heading"
      className={cn('relative py-16 sm:py-24 overflow-hidden', className)}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div data-recently-header>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-accent">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Recently Viewed
            </p>
            <h2
              id="recently-viewed-heading"
              className="mt-2 text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white"
            >
              Keep Exploring
            </h2>
          </div>

          {count > 0 && (
            <div data-recently-header className="flex items-center gap-2">
              <button
                type="button"
                onClick={clear}
                className="mr-1 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Clear
              </button>

              <button
                type="button"
                onClick={() => scrollRail(-1)}
                aria-label="Scroll recently viewed left"
                className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-300 transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollRail(1)}
                aria-label="Scroll recently viewed right"
                className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-300 transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* ── Empty state ────────────────────────────────────── */}
        {count === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-surface p-8 sm:p-12 text-center"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-40"
            >
              <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
            </div>

            <div className="relative mx-auto flex max-w-md flex-col items-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-transparent shadow-inner">
                <Compass className="h-7 w-7 text-accent" aria-hidden="true" />
              </div>

              <h3 className="mt-5 font-display text-lg font-bold text-white">
                Your journey starts here
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Products you visit will appear here so you can pick up right
                where you left off.
              </p>

              <Link
                href="/collections"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-accent/90 hover:shadow-[0_8px_24px_rgba(229,9,20,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Explore the collection
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        ) : (
          /* ── Slider ───────────────────────────────────────── */
          <div
            ref={railRef}
            className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
          >
            <div className="sr-only">
              Horizontal slider of products you recently viewed. Use the arrow
              buttons or swipe to browse.
            </div>
            {products.map(product => (
              <div key={product.handle} data-recently-card className="shrink-0">
                <RecentlyViewedCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
