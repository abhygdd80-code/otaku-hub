'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '@/constants';
import { cn } from '@/utils/cn';

export interface HeroCTAProps {
  className?: string;
}

/**
 * Call-to-action buttons for the hero section.
 *
 * - Primary: solid accent background with a diagonal shine on hover
 * - Secondary: glassmorphic border style, arrow reveals on hover
 *
 * Both use CSS transforms for GPU-accelerated hover (lift + shadow).
 */
export function HeroCTA({ className }: HeroCTAProps) {
  const btnBase = [
    'relative overflow-hidden',
    'px-8 py-3.5 sm:px-10 sm:py-4 rounded-xl',
    'font-semibold text-sm tracking-wider uppercase',
    'transition-all duration-300',
    'hover:-translate-y-0.5 active:translate-y-0',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ].join(' ');

  return (
    <div
      className={cn('flex flex-col sm:flex-row items-center gap-4', className)}
    >
      {/* Primary CTA — Explore Collection */}
      <Link
        href={ROUTES.shop}
        className={cn(
          btnBase,
          'bg-accent text-white group',
          'hover:shadow-[0_0_30px_rgba(229,9,20,0.4)]'
        )}
        aria-label="Explore Collection"
      >
        {/* Shine sweep */}
        <span
          className={cn(
            'absolute inset-0 -translate-x-full',
            'bg-gradient-to-r from-transparent via-white/15 to-transparent',
            'transition-transform duration-700 group-hover:translate-x-full'
          )}
        />
        <span className="relative z-10 flex items-center justify-center gap-2">
          Explore Collection
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </Link>

      {/* Secondary CTA — New Drops */}
      <Link
        href={ROUTES.newArrivals}
        className={cn(
          btnBase,
          'border border-zinc-700 hover:border-accent/50',
          'bg-white/5 backdrop-blur-sm',
          'text-white hover:bg-white/10 group'
        )}
        aria-label="New Drops"
      >
        <span className="flex items-center justify-center gap-2">
          New Drops
          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
        </span>
      </Link>
    </div>
  );
}
