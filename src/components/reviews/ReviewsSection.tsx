'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, MessageSquarePlus } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  getReviewsForProduct,
  summarizeReviews,
  type ProductReview,
  type ReviewRating,
} from '@/data/reviews';
import { ReviewCard } from './ReviewCard';
import { WriteReviewDialog, type NewReviewInput } from './WriteReviewDialog';
import { RatingStars } from './RatingStars';

export interface ReviewsSectionProps {
  productHandle: string;
  productName: string;
}

type SortKey = 'newest' | 'highest' | 'lowest';

/** Stable, monotonic id for reviews written on the client. */
let localReviewSeq = 0;

const RATING_KEYS: ReviewRating[] = [5, 4, 3, 2, 1];

/** Number of reviews rendered per page. */
const REVIEWS_PER_PAGE = 5;

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'highest', label: 'Highest' },
  { key: 'lowest', label: 'Lowest' },
];

/**
 * Product reviews section.
 *
 * Rendered on the product page under the buy panel. Shows an aggregate
 * summary (average + animated distribution bars), rating filter chips,
 * sort control, and the review list. "Write a review" opens the shared
 * `Modal`-based dialog; submitted reviews are prepended to local state
 * so the summary / distribution update live.
 */
export function ReviewsSection({
  productHandle,
  productName,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ProductReview[]>(() =>
    getReviewsForProduct(productHandle)
  );
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [filterRating, setFilterRating] = useState<ReviewRating | null>(null);
  const [page, setPage] = useState(1);
  const [writeOpen, setWriteOpen] = useState(false);

  const summary = useMemo(() => summarizeReviews(reviews), [reviews]);

  const counts = useMemo(() => {
    const map: Record<ReviewRating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const review of reviews) map[review.rating] += 1;
    return map;
  }, [reviews]);

  const visibleReviews = useMemo(() => {
    const filtered =
      filterRating === null
        ? reviews
        : reviews.filter(r => r.rating === filterRating);

    return [...filtered].sort((a, b) => {
      if (sortKey === 'highest') return b.rating - a.rating;
      if (sortKey === 'lowest') return a.rating - b.rating;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [reviews, filterRating, sortKey]);

  const totalPages = Math.max(
    1,
    Math.ceil(visibleReviews.length / REVIEWS_PER_PAGE)
  );
  const currentPage = Math.min(page, totalPages);

  const pagedReviews = useMemo(
    () =>
      visibleReviews.slice(
        (currentPage - 1) * REVIEWS_PER_PAGE,
        currentPage * REVIEWS_PER_PAGE
      ),
    [visibleReviews, currentPage]
  );

  const from = (currentPage - 1) * REVIEWS_PER_PAGE + 1;
  const to = Math.min(from + REVIEWS_PER_PAGE - 1, visibleReviews.length);

  const goToPage = (target: number) =>
    setPage(Math.min(Math.max(1, target), totalPages));

  const handleSubmit = (input: NewReviewInput) => {
    const review: ProductReview = {
      id: `rvw-local-${++localReviewSeq}`,
      productHandle,
      author: input.author,
      rating: input.rating,
      title: input.title,
      body: input.body,
      date: new Date().toISOString(),
      verified: false,
      helpfulCount: 0,
    };
    setReviews(prev => [review, ...prev]);
    setPage(1);
  };

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="mt-24 pt-16 border-t border-white/[0.06] scroll-mt-24"
    >
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold text-accent tracking-[0.25em] uppercase">
            Reviews
          </p>
          <h2
            id="reviews-heading"
            className="mt-2 text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white"
          >
            Customer Reviews
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setWriteOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
          Write a Review
        </button>
      </div>

      {!summary ? (
        // ── Empty state ─────────────────────────────────────
        <div className="mt-8 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-16 text-center">
          <p className="text-4xl" aria-hidden="true">
            💬
          </p>
          <h3 className="mt-3 text-lg font-display font-bold text-white">
            No reviews yet
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Be the first to share your thoughts on {productName}.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* ── Summary panel ─────────────────────────────── */}
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
          >
            <div className="flex items-end gap-3">
              <span className="text-5xl font-display font-extrabold text-white tabular-nums">
                {summary.average.toFixed(1)}
              </span>
              <span className="pb-1.5 text-sm text-zinc-500">out of 5</span>
            </div>

            <RatingStars
              rating={summary.average}
              size="md"
              showValue={false}
              className="mt-3"
            />
            <p className="mt-2 text-xs text-zinc-500">
              Based on {summary.total} review{summary.total > 1 ? 's' : ''}
            </p>

            {/* Distribution bars */}
            <div className="mt-6 space-y-2.5">
              {RATING_KEYS.map(rating => {
                const count = counts[rating];
                const pct =
                  summary.total > 0 ? (count / summary.total) * 100 : 0;
                const active = filterRating === rating;
                return (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => {
                      setFilterRating(active ? null : rating);
                      setPage(1);
                    }}
                    aria-pressed={active}
                    className="group flex w-full items-center gap-3 rounded-md px-1 py-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span className="w-6 shrink-0 text-xs font-semibold text-zinc-400 group-hover:text-white">
                      {rating}
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.span
                        className="block h-full rounded-full bg-accent"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </span>
                    <span className="w-6 shrink-0 text-right text-xs tabular-nums text-zinc-500">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.aside>

          {/* ── List ──────────────────────────────────────── */}
          <div className="lg:col-span-8 min-w-0">
            {/* Controls */}
            <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
              <div
                role="group"
                aria-label="Filter by rating"
                className="flex gap-1.5 flex-wrap"
              >
                <button
                  type="button"
                  onClick={() => {
                    setFilterRating(null);
                    setPage(1);
                  }}
                  aria-pressed={filterRating === null}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    filterRating === null
                      ? 'border-accent/40 bg-accent/10 text-accent'
                      : 'border-white/[0.08] text-zinc-400 hover:border-white/20 hover:text-white'
                  )}
                >
                  All ({reviews.length})
                </button>
                {RATING_KEYS.map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => {
                      setFilterRating(filterRating === rating ? null : rating);
                      setPage(1);
                    }}
                    aria-pressed={filterRating === rating}
                    disabled={counts[rating] === 0}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40',
                      filterRating === rating
                        ? 'border-accent/40 bg-accent/10 text-accent'
                        : 'border-white/[0.08] text-zinc-400 hover:border-white/20 hover:text-white'
                    )}
                  >
                    {rating}★
                  </button>
                ))}
              </div>

              <div
                role="group"
                aria-label="Sort reviews"
                className="flex rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5"
              >
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      setSortKey(option.key);
                      setPage(1);
                    }}
                    aria-pressed={sortKey === option.key}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      sortKey === option.key
                        ? 'bg-accent text-white'
                        : 'text-zinc-400 hover:text-white'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Review cards */}
            {visibleReviews.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/[0.08] px-4 py-10 text-center text-sm text-zinc-500">
                No {filterRating !== null ? `${filterRating}-star ` : ''}
                reviews yet.
              </p>
            ) : (
              <>
                <ul className="space-y-4">
                  {pagedReviews.map(review => (
                    <motion.li
                      key={review.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      <ReviewCard review={review} />
                    </motion.li>
                  ))}
                </ul>

                {/* ── Pagination ─────────────────────────────── */}
                {totalPages > 1 && (
                  <nav
                    aria-label="Review pagination"
                    className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row"
                  >
                    <p className="text-xs text-zinc-500 tabular-nums">
                      Showing {from}–{to} of {visibleReviews.length} review
                      {visibleReviews.length > 1 ? 's' : ''}
                    </p>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Previous page of reviews"
                        className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-sm font-bold text-zinc-300 transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/[0.08] disabled:hover:text-zinc-300"
                      >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => goToPage(n)}
                            aria-current={
                              n === currentPage ? 'page' : undefined
                            }
                            aria-label={`Page ${n} of reviews`}
                            className={cn(
                              'flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                              n === currentPage
                                ? 'bg-accent text-white'
                                : 'border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:border-accent/40 hover:text-white'
                            )}
                          >
                            {n}
                          </button>
                        )
                      )}

                      <button
                        type="button"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Next page of reviews"
                        className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-sm font-bold text-zinc-300 transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/[0.08] disabled:hover:text-zinc-300"
                      >
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <WriteReviewDialog
        isOpen={writeOpen}
        onClose={() => setWriteOpen(false)}
        productName={productName}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
