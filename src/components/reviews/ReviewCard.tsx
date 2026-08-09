'use client';

import { useState } from 'react';
import { BadgeCheck, ThumbsUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDate } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { RatingStars } from './RatingStars';
import type { ProductReview } from '@/data/reviews';

export interface ReviewCardProps {
  review: ProductReview;
  className?: string;
}

const AVATAR_GRADIENTS = [
  'from-rose-500/40 to-orange-500/40',
  'from-violet-500/40 to-fuchsia-500/40',
  'from-sky-500/40 to-cyan-500/40',
  'from-emerald-500/40 to-lime-500/40',
  'from-amber-500/40 to-red-500/40',
] as const;

function initials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Stable avatar gradient per author name. */
function avatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1)
    hash = (hash * 31 + name.charCodeAt(i)) % 997;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

/**
 * Single product review card.
 *
 * Renders reviewer avatar (initials on a per-author gradient), verified
 * purchase badge, star rating, title, body, optional photo thumbnails
 * (opened in a shared `Modal` lightbox), and a togglable "Helpful" counter.
 */
export function ReviewCard({ review, className }: ReviewCardProps) {
  const [helpful, setHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const toggleHelpful = () => {
    setHelpful(prev => {
      setHelpfulCount(count => count + (prev ? -1 : 1));
      return !prev;
    });
  };

  return (
    <article
      className={cn(
        'rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Author */}
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white',
              avatarGradient(review.author)
            )}
            aria-hidden="true"
          >
            {initials(review.author)}
          </span>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
              {review.author}
              {review.verified && (
                <>
                  <BadgeCheck
                    className="h-4 w-4 text-accent"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Verified purchase</span>
                </>
              )}
            </p>
            <p className="text-xs text-zinc-500">
              {review.verified ? 'Verified purchase' : 'Customer'} ·{' '}
              {formatDate(review.date)}
            </p>
          </div>
        </div>

        <RatingStars rating={review.rating} size="sm" showValue />
      </div>

      <h3 className="mt-4 text-sm font-bold text-white">{review.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
        {review.body}
      </p>

      {/* Photo thumbnails */}
      {review.images && review.images.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.images.map((image, i) => (
            <button
              key={`${review.id}-${i}`}
              type="button"
              onClick={() => setLightbox(i)}
              className="group overflow-hidden rounded-lg border border-white/[0.06] transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={`View review photo ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt}
                className="h-20 w-20 object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      {/* Helpful */}
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-3">
        <button
          type="button"
          onClick={toggleHelpful}
          aria-pressed={helpful}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            helpful
              ? 'border-accent/40 bg-accent/10 text-accent'
              : 'border-white/[0.08] text-zinc-400 hover:border-white/20 hover:text-white'
          )}
        >
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
          Helpful · {helpfulCount}
        </button>
      </div>

      {/* Photo lightbox */}
      <Modal
        isOpen={lightbox !== null}
        onClose={() => setLightbox(null)}
        label="Review photo"
        panelClassName="w-full max-w-2xl sm:rounded-2xl rounded-t-2xl border border-white/[0.06] shadow-2xl"
      >
        {lightbox !== null && review.images && (
          <div className="px-4 pb-6 sm:px-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={review.images[lightbox].src}
              alt={review.images[lightbox].alt}
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
          </div>
        )}
      </Modal>
    </article>
  );
}
