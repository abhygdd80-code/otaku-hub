'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

export type StarSize = 'xs' | 'sm' | 'md' | 'lg';

export interface RatingStarsProps {
  /** Rating value 0–5 (fractions render as partial fill) */
  rating: number;
  size?: StarSize;
  /** Read-only display mode (default). Set to `false` for interactive input. */
  readOnly?: boolean;
  /** Interactive mode: called with the selected rating */
  onRate?: (rating: number) => void;
  /** Optional label rendered next to the stars */
  showValue?: boolean;
  className?: string;
}

const SIZE_MAP: Record<StarSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const clampRating = (value: number) => Math.min(5, Math.max(0, value));

/** Render five stars with a clipped accent overlay for fractional fill. */
function StarRow({
  sizeClass,
  fill,
  className,
}: {
  sizeClass: string;
  fill: number;
  className?: string;
}) {
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      {/* Base (empty) row */}
      <span className="flex text-zinc-700">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(sizeClass, 'shrink-0')}
            aria-hidden="true"
            fill="currentColor"
            strokeWidth={0}
          />
        ))}
      </span>
      {/* Filled overlay clipped to the rating */}
      <span
        className="absolute inset-0 flex overflow-hidden text-accent"
        style={{ width: `${fill * 100}%` }}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(sizeClass, 'shrink-0')}
            aria-hidden="true"
            fill="currentColor"
            strokeWidth={0}
          />
        ))}
      </span>
    </span>
  );
}

/**
 * Star rating display / input.
 *
 * ── Display ─────────────────────────────────────────────
 * Read-only five-star row with fractional fill (e.g. 4.3 →
 * four full stars + 30% of the fifth), rendered as a clipped
 * accent overlay over a dimmed base row.
 *
 * ── Input ───────────────────────────────────────────────
 * When `readOnly={false}` the stars become radio buttons with
 * hover preview and keyboard arrow support, calling `onRate`.
 */
export function RatingStars({
  rating,
  size = 'md',
  readOnly = true,
  onRate,
  showValue = false,
  className,
}: RatingStarsProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const clamped = clampRating(rating);
  const sizeClass = SIZE_MAP[size];

  if (readOnly) {
    return (
      <span
        className={cn('inline-flex items-center gap-1.5', className)}
        role="img"
        aria-label={`Rated ${clamped.toFixed(1)} out of 5 stars`}
      >
        <StarRow sizeClass={sizeClass} fill={clamped / 5} />
        {showValue && (
          <span className="text-sm font-bold text-white tabular-nums">
            {clamped.toFixed(1)}
          </span>
        )}
      </span>
    );
  }

  const display = hoverValue ?? clamped;

  return (
    <span
      className={cn('inline-flex items-center gap-1', className)}
      role="radiogroup"
      aria-label="Select a rating"
      onMouseLeave={() => setHoverValue(null)}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const value = i + 1;
        const checked = Math.round(display) === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={`${value} star${value > 1 ? 's' : ''}`}
            onMouseEnter={() => setHoverValue(value)}
            onFocus={() => setHoverValue(value)}
            onKeyDown={e => {
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                const next = value === 5 ? 5 : value + 1;
                setHoverValue(next);
                onRate?.(next);
              } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prev = value === 1 ? 1 : value - 1;
                setHoverValue(prev);
                onRate?.(prev);
              }
            }}
            onClick={() => onRate?.(value)}
            className="shrink-0 rounded-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            <Star
              className={cn(
                sizeClass,
                'transition-colors',
                value <= display
                  ? 'text-accent'
                  : 'text-zinc-700 hover:text-zinc-500'
              )}
              fill="currentColor"
              strokeWidth={0}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </span>
  );
}
