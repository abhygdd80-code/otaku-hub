'use client';

import { cn } from '@/utils/cn';
import { HeroCTA } from './HeroCTA';

export interface HeroContentProps {
  className?: string;
}

const TITLE = 'WEAR YOUR STORY';

/**
 * Center-stage hero content with per-letter stagger support.
 *
 * The headline is split into individual `<span>` elements, each marked with
 * `data-hero-letter` so the parent Hero timeline can stagger-animate them
 * independently. The whole `<h1>` carries an `aria-label` so screen readers
 * announce the full phrase rather than spelling it out letter-by-letter.
 *
 * On desktop the container can be overridden to `lg:text-left lg:items-start`
 * via `className` for the split-layout variant.
 */
export function HeroContent({ className }: HeroContentProps) {
  return (
    <div
      className={cn(
        'w-full max-w-3xl text-center lg:text-left',
        'flex flex-col items-center lg:items-start',
        className
      )}
    >
      {/* Status badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6 sm:mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
          Premium Anime Streetwear // 2026
        </span>
      </div>

      {/* Main headline — individual letter spans for stagger animation */}
      <h1
        className="font-display font-extrabold leading-[0.9] tracking-tight text-white mb-5 sm:mb-6 select-none"
        aria-label={TITLE}
      >
        <span className="inline-flex flex-wrap justify-center lg:justify-start text-[clamp(2.6rem,10vw,7rem)]">
          {TITLE.split('').map((char, i) => (
            <span
              key={i}
              data-hero-letter
              className="inline-block"
              aria-hidden="true"
            >
              {char === ' ' ? ' ' : char}
            </span>
          ))}
        </span>
      </h1>

      {/* Subtitle */}
      <p
        data-hero-subtitle
        className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-xl leading-relaxed font-medium tracking-wide mb-8 sm:mb-10"
      >
        Original anime-inspired streetwear crafted for those who live between
        worlds — where Japanese counter-culture meets contemporary luxury
        fashion.
      </p>

      {/* CTA buttons */}
      <div data-hero-cta className="flex justify-center lg:justify-start">
        <HeroCTA />
      </div>
    </div>
  );
}
