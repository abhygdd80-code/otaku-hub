'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/lib/utils';
import { FloatingCards } from './FloatingCards';

export interface HeroImageProps {
  mouseX: number;
  mouseY: number;
  className?: string;
}

/**
 * Right-column hero showcase — a gradient placeholder ready for
 * future original artwork or photography.
 *
 * ── Features ─────────────────────────────────────────────
 * • Gradient placeholder with noise texture and vignette.
 * • Subtle 3D rotation parallax driven by mouse position.
 * • GSAP entrance scale-in on mount.
 * • Floating product cards rendered around the frame.
 * • Glassmorphic frame with border and glow.
 *
 * ── Future image integration ────────────────────────────
 * Swap the `.gradient-bg` div for a `<Image>` component when
 * original artwork/photography is ready. The layout, frame,
 * and floating cards remain unchanged.
 */
export function HeroImage({ mouseX, mouseY, className }: HeroImageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Entrance animation
  useEffect(() => {
    const frame = frameRef.current;
    const glow = glowRef.current;
    if (!frame) return;

    const ctx = gsap.context(() => {
      gsap.from(frame, {
        autoAlpha: 0,
        scale: 0.92,
        x: 40,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.3,
      });

      if (glow) {
        gsap.to(glow, {
          scale: 1.05,
          opacity: 0.6,
          duration: 3,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      }
    });

    return () => ctx.revert();
  }, []);

  // Parallax transform
  const parallaxX = mouseX * 20;
  const parallaxY = mouseY * 20;
  const rotateX = -mouseY * 4;
  const rotateY = mouseX * 4;

  return (
    <div
      className={cn(
        'z-10 flex items-center justify-center lg:justify-end',
        className
      )}
    >
      <div className="relative w-full max-w-[420px] lg:max-w-[500px]">
        {/* Background glow pulsing behind the showcase */}
        <div
          ref={glowRef}
          className="absolute -inset-10 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(229,9,20,0.15)_0%,transparent_70%)]"
          aria-hidden="true"
        />

        {/* Floating product cards */}
        <FloatingCards mouseX={mouseX} mouseY={mouseY} />

        {/* Main showcase frame */}
        <div
          ref={frameRef}
          className={cn(
            'relative aspect-[4/5] w-full rounded-2xl sm:rounded-3xl overflow-hidden',
            'border border-white/10',
            'bg-gradient-to-b from-white/[0.06] to-white/[0.02]',
            'backdrop-blur-sm',
            'shadow-[0_20px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]'
          )}
          style={{
            transform: `perspective(1000px) translate3d(${parallaxX}px, ${parallaxY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            willChange: 'transform',
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* ── Gradient placeholder ──────────────────────── */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.07] via-purple-900/20 to-background" />

          {/* Noise texture overlay */}
          <div className="texture-noise absolute inset-0 opacity-[0.04] mix-blend-overlay" />

          {/* Decorative diagonal line pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 21px)',
            }}
          />

          {/* Subtle accent ring — centre-left */}
          <div
            className="absolute top-[18%] left-[8%] w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-accent/[0.08]"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-[15%] right-[15%] w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/[0.04]"
            aria-hidden="true"
          />

          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />

          {/* Bottom gradient fade */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

          {/* Glass edge reflection */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl ring-1 ring-inset ring-white/[0.04] pointer-events-none" />

          {/* Live badge */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-background/70 backdrop-blur-md border border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-zinc-300 uppercase">
                Drop #04 Live
              </span>
            </div>
          </div>

          {/* Featured product info card */}
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 p-2.5 sm:p-3 rounded-xl bg-background/60 backdrop-blur-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase font-bold text-accent tracking-[0.15em]">
                  Featured
                </p>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  Cyber Oni Hoodie
                </h4>
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-white bg-accent/20 px-2 py-1 rounded-md border border-accent/30">
                {formatPrice(128, 'INR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
