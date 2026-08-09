'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CategoryCardProps {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** One-line tagline shown above the title */
  tagline: string;
  /** Product count label (e.g. "18 Products") */
  itemCount: string;
  /** Link destination */
  href: string;
  /** Tailwind gradient class for the placeholder artwork */
  gradient: string;
  /** Optional additional class names */
  className?: string;
}

/**
 * Reusable category card for horizontal category showcases.
 *
 * Displays a gradient placeholder (swap `gradient` for a real image
 * when original artwork is ready), an item-count badge, and a title
 * block with a red accent tagline. Hover triggers a scale-up on the
 * background and a gentle lift on the card itself.
 *
 * All animations use CSS transforms/transitions (GPU-accelerated)
 * for smooth 60 fps interaction.
 */
export function CategoryCard({
  title,
  tagline,
  itemCount,
  href,
  gradient,
  className,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative w-[280px] sm:w-[340px] h-[420px] flex-shrink-0',
        'rounded-2xl overflow-hidden',
        'border border-white/[0.06] hover:border-accent/40',
        'bg-surface',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(0,0,0,0.6)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      aria-label={`${title} — ${tagline}`}
    >
      {/* ── Placeholder gradient artwork ─────────────────────────── */}
      <div
        className={cn(
          'absolute inset-0 transition-transform duration-700 ease-out',
          'group-hover:scale-110',
          gradient
        )}
      />

      {/* ── Subtle noise texture ──────────────────────────────────── */}
      <div className="texture-noise absolute inset-0 opacity-[0.04] mix-blend-overlay" />

      {/* ── Gradient vignette ─────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

      {/* ── Top row — count badge + arrow ─────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
          {itemCount}
        </span>
        <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(229,9,20,0.5)]">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>

      {/* ── Bottom content block ──────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-1.5">
          {tagline}
        </p>
        <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-accent transition-colors duration-300">
          {title}
        </h3>
      </div>
    </Link>
  );
}
