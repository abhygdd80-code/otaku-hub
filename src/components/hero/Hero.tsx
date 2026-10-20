'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/utils/cn';
import { HeroBackground } from './HeroBackground';
import { AmbientGlow } from './AmbientGlow';
import { HeroContent } from './HeroContent';
import { HeroImage } from './HeroImage';
import { ScrollIndicator } from './ScrollIndicator';

export interface HeroProps {
  className?: string;
}

/**
 * Cinematic hero section for OtakuSaga.
 *
 * Layout
 * ------
 * Full viewport height with a split layout:
 * - Desktop: text content (7 cols) + showcase image (5 cols)
 * - Mobile: stacked, content above showcase
 *
 * Animation timeline (`@gsap/react` useGSAP)
 * -----------------------------------------
 *  0.0s — Background reveal
 *  0.4s — Heading letter stagger (each letter fades up + un-rotates)
 *  0.8s — Subtitle slide-in
 *  0.9s — CTA button fade-in
 *  1.0s — Scroll indicator reveal
 *
 * ScrollTrigger parallax
 * ----------------------
 * The background layer moves at a slower rate than the page when
 * scrolling past the hero, creating a subtle depth parallax effect.
 * This also establishes a scroller-start trigger point that
 * downstream sections build upon.
 *
 * Accessibility
 * -------------
 * Respects `prefers-reduced-motion` — disables GSAP animations,
 * skips parallax, and removes mouse-driven transforms when the
 * user has requested reduced motion.
 */
export function Hero({ className }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number>(0);
  // Lazily read the preference so the correct value is known before first
  // paint (guards against a flash of animation for reduced-motion users).
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Cancel any pending parallax frame on unmount.
  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  // ── Detect reduced-motion preference changes ──────────────────
  useGSAP(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Intro reveal timeline + ScrollTrigger parallax ─────────────
  useGSAP(
    () => {
      if (reducedMotion) return;

      const section = sectionRef.current;
      if (!section) return;

      const ctx = gsap.context(() => {
        // ── Intro reveal timeline ──────────────────────────
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // 1. Background atmosphere
        tl.from('[data-hero-bg]', { autoAlpha: 0, duration: 0.8 }, 0);

        // 2. Heading letter stagger — fade up + un-rotate
        tl.from(
          '[data-hero-letter]',
          {
            y: 80,
            opacity: 0,
            rotateX: -90,
            duration: 0.9,
            stagger: 0.06,
            ease: 'power4.out',
          },
          0.4
        );

        // 3. Subtitle
        tl.from(
          '[data-hero-subtitle]',
          { y: 30, opacity: 0, duration: 0.8 },
          '-=0.15'
        );

        // 4. CTA buttons
        tl.from(
          '[data-hero-cta]',
          { y: 30, opacity: 0, duration: 0.6 },
          '-=0.15'
        );

        // 5. Scroll indicator
        tl.from(
          '[data-hero-scroll]',
          { autoAlpha: 0, y: 10, duration: 0.6 },
          '-=0.1'
        );

        // ── ScrollTrigger parallax — background moves slower ─
        gsap.to('[data-hero-bg]', {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }, section);

      return () => ctx.revert();
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  );

  // ── rAF-throttled mouse handler for parallax ────────────────────
  // At most one position update per frame; the last event of the frame wins.
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reducedMotion || !sectionRef.current || rafRef.current) return;
      const clientX = e.clientX;
      const clientY = e.clientY;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const section = sectionRef.current;
        if (!section) return;
        const { left, top, width, height } = section.getBoundingClientRect();
        setMousePos({
          x: (clientX - left - width / 2) / (width / 2),
          y: (clientY - top - height / 2) / (height / 2),
        });
      });
    },
    [reducedMotion]
  );

  const handleMouseLeave = useCallback(() => setMousePos({ x: 0, y: 0 }), []);

  const parallaxX = reducedMotion ? 0 : mousePos.x * -15;
  const parallaxY = reducedMotion ? 0 : mousePos.y * -15;

  // No transform before the first mousemove keeps the server-rendered and
  // first client frame identical (avoids a hydration mismatch) and means
  // reduced-motion users never see a transform.
  const bgTransform =
    reducedMotion || (mousePos.x === 0 && mousePos.y === 0)
      ? 'none'
      : `translate3d(${parallaxX}px, ${parallaxY}px, 0)`;

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      id="hero"
      className={cn(
        'relative min-h-screen h-dvh w-full overflow-hidden bg-background',
        className
      )}
      aria-label="Hero"
    >
      {/* ── Parallax background layer ────────────────────────────── */}
      <div
        data-hero-bg
        className="absolute inset-0 z-0 will-change-transform"
        style={{
          transform: bgTransform,
          transition: 'transform 0.15s ease-out',
        }}
      >
        <HeroBackground />
        <AmbientGlow />
      </div>

      {/* ── Content grid — desktop: 7 + 5 split ─────────────────── */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
          {/* Left — text content */}
          <div className="lg:col-span-7 py-20 lg:py-0">
            <HeroContent />
          </div>

          {/* Right — image showcase */}
          <div className="lg:col-span-5">
            <HeroImage mouseX={mousePos.x} mouseY={mousePos.y} />
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ─────────────────────────────────────── */}
      <div
        data-hero-scroll
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
      >
        <ScrollIndicator />
      </div>
    </section>
  );
}
