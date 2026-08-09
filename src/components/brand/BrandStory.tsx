'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/utils/cn';

export interface BrandStoryProps {
  className?: string;
}

const HEADING_WORDS = 'WHERE ANIME MEETS STREET CULTURE'.split(' ');

/**
 * Brand-story section — editorial fashion narrative.
 *
 * ── Layout ───────────────────────────────────────────
 * Desktop: two-column grid — large visual placeholder on
 * the left, overlapping text block on the right.
 * Mobile: single column, stacked.
 *
 * ── Animations (GSAP + ScrollTrigger) ────────────────
 * • Visual clip-path reveal  —  `inset(0 0 100% 0)` → `inset(0)`
 *    combined with a subtle scale entrance.
 * • Heading word stagger     —  each word fades up independently.
 * • Text element reveal      —  label, description, CTA fade in.
 * • Parallax                 —  visual content shifts vertically
 *    relative to scroll (`scrub: true`).
 *
 * ── Placeholder artwork ──────────────────────────────
 * A gradient panel stands in for a hero image. Replace the
 * inner `div` with a `next/image` once original art is ready.
 */
export function BrandStory({ className }: BrandStoryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // ── Reduced-motion detection ────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── GSAP animations ─────────────────────────────────
  useGSAP(
    () => {
      if (reducedMotion) return;

      const section = sectionRef.current;
      if (!section) return;

      const ctx = gsap.context(() => {
        // 1. Parallax — scrubs continuously as user scrolls
        gsap.to('[data-story-parallax]', {
          yPercent: 18,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });

        const scrollTrigger = {
          trigger: section,
          start: 'top 80%' as const,
          toggleActions: 'play none none none' as const,
        };

        // 2. Visual clip-path + scale reveal
        gsap.from('[data-story-visual]', {
          scrollTrigger,
          clipPath: 'inset(0 0 100% 0)',
          scale: 1.06,
          duration: 1.2,
          ease: 'power4.out',
        });

        // 3. Heading word stagger
        gsap.from('[data-story-word]', {
          scrollTrigger,
          y: 40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
        });

        // 4. Other text elements (label, description, CTA)
        gsap.from('[data-story-text]', {
          scrollTrigger,
          y: 24,
          opacity: 0,
          duration: 0.8,
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
      {/* ── Background grid ───────────────────────────── */}
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      {/* Top-edge accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* ── Content ─────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* ── Visual placeholder ────────────────────────── */}
          <div className="lg:col-span-7">
            <div
              data-story-visual
              className="relative aspect-[4/5] sm:aspect-[3/2] lg:aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden bg-surface border border-white/[0.06] will-change-transform"
            >
              {/* Parallax inner layer */}
              <div
                data-story-parallax
                className="absolute inset-[-10%] w-[120%] h-[120%] will-change-transform"
              >
                {/* Gradient placeholder artwork */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-purple-800/25 via-indigo-900/15 to-background" />

                {/* Abstract decorative shapes */}
                <div className="absolute top-[15%] right-[10%] w-32 sm:w-48 h-32 sm:h-48 rounded-full bg-accent/10 blur-3xl" />
                <div className="absolute bottom-[20%] left-[5%] w-40 sm:w-56 h-40 sm:h-56 rounded-full bg-purple-700/15 blur-3xl" />

                {/* Diagonal line pattern */}
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 21px)',
                  }}
                />

                {/* Editorial overlay content */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-8">
                  <p className="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-[0.2em]">
                    Est. 2026
                  </p>
                  <p className="text-xs text-zinc-500 uppercase tracking-[0.15em] mt-1">
                    Tokyo &bull; Japan
                  </p>
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-bl from-accent/20 to-transparent" />
              </div>
            </div>
          </div>

          {/* ── Text content ──────────────────────────────── */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-7">
            {/* Label */}
            <div data-story-text>
              <span className="text-xs font-bold text-accent tracking-[0.25em] uppercase">
                Our Story
              </span>
            </div>

            {/* Heading — word stagger */}
            <h2 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.05] -mx-1">
              {HEADING_WORDS.map((word, i) => (
                <span key={i} data-story-word className="inline-block mx-1">
                  {word}
                </span>
              ))}
            </h2>

            {/* Description */}
            <p
              data-story-text
              className="text-sm sm:text-base lg:text-lg text-zinc-400 leading-relaxed max-w-md"
            >
              OtakuSaga creates premium streetwear inspired by imagination,
              creativity, and the worlds we love.
            </p>

            {/* CTA */}
            <div data-story-text>
              <Link
                href="/collections"
                className={cn(
                  'group inline-flex items-center gap-2.5',
                  'text-sm font-semibold uppercase tracking-wider',
                  'text-white hover:text-accent',
                  'transition-colors duration-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg'
                )}
                aria-label="Discover Our Story"
              >
                <span>Discover Our Story</span>
                <ArrowRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1 group-hover:-rotate-12" />
                {/* Underline that grows on hover */}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
