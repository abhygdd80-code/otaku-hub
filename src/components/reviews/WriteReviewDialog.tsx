'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Modal } from '@/components/ui/Modal';
import { RatingStars } from './RatingStars';
import type { ReviewRating } from '@/data/reviews';

/** A new review before it gets its id / product handle / timestamp. */
export interface NewReviewInput {
  author: string;
  rating: ReviewRating;
  title: string;
  body: string;
}

export interface WriteReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  onSubmit: (review: NewReviewInput) => void;
}

const FIELD_CLASS =
  'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20';

/**
 * "Write a review" dialog.
 *
 * Composes the shared `Modal` foundation with the interactive `RatingStars`
 * input, name / title / body fields, and a client-side validity check before
 * handing the new review to the parent section via `onSubmit`.
 */
export function WriteReviewDialog({
  isOpen,
  onClose,
  productName,
  onSubmit,
}: WriteReviewDialogProps) {
  const [rating, setRating] = useState<ReviewRating>(5);
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!author.trim() || !title.trim() || !body.trim()) return;

    onSubmit({
      author: author.trim(),
      rating,
      title: title.trim(),
      body: body.trim(),
    });
    toast.success('Review submitted — thank you!');
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const valid =
    author.trim().length > 0 &&
    title.trim().length > 0 &&
    body.trim().length >= 10;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      label="Write a review"
      zIndex={90}
      panelClassName="w-full max-w-lg sm:rounded-2xl rounded-t-2xl border border-white/[0.06] shadow-2xl"
    >
      <form onSubmit={handleSubmit} className="px-4 pb-6 sm:px-6">
        <p className="text-xs font-bold text-accent tracking-[0.25em] uppercase">
          Write a Review
        </p>
        <h2 className="mt-1 text-lg font-display font-bold text-white leading-tight">
          {productName}
        </h2>

        {/* Rating */}
        <div className="mt-5">
          <label
            id="review-rating-label"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Your rating
          </label>
          <div
            className="flex items-center gap-3"
            aria-labelledby="review-rating-label"
          >
            <RatingStars
              rating={rating}
              readOnly={false}
              onRate={value => setRating(value as ReviewRating)}
              size="lg"
            />
            <span className="text-xs font-semibold text-zinc-400">
              {rating === 5
                ? 'Excellent'
                : rating === 4
                  ? 'Great'
                  : rating === 3
                    ? 'Good'
                    : rating === 2
                      ? 'Poor'
                      : 'Terrible'}
            </span>
          </div>
        </div>

        {/* Name */}
        <div className="mt-4">
          <label
            htmlFor="review-author"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Name
          </label>
          <input
            id="review-author"
            data-autofocus
            type="text"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="Your display name"
            className={FIELD_CLASS}
          />
        </div>

        {/* Title */}
        <div className="mt-4">
          <label
            htmlFor="review-title"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Title
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className={FIELD_CLASS}
          />
        </div>

        {/* Body */}
        <div className="mt-4">
          <label
            htmlFor="review-body"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Review
          </label>
          <textarea
            id="review-body"
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="What did you love? Any fit or sizing notes?"
            rows={5}
            className={cn(FIELD_CLASS, 'resize-none')}
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Star className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            Reviews are moderated.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-zinc-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!valid}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Submit Review
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
