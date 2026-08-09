'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Trash2, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/lib/utils';
import { useCompareStore, MAX_COMPARE_ITEMS } from '@/store';
import { getProductByHandle } from '@/lib/products';
import { getReviewSummary } from '@/data/reviews';
import { RatingStars } from '@/components/reviews/RatingStars';
import type { Product } from '@/data/products';

export interface CompareDrawerProps {
  className?: string;
}

// ─── Comparison rows ─────────────────────────────────────────────

interface CompareRow {
  key: string;
  label: string;
  /** String used for difference detection */
  valueKey: (p: Product) => string;
  /** Rendered cell content */
  render: (p: Product) => ReactNode;
}

const formatSizes = (p: Product) => p.sizes.join(' · ') || '—';
const formatColors = (p: Product) => p.colors.join(' · ') || '—';
const formatTags = (p: Product) => p.tags.join(', ') || '—';
const ratingKey = (p: Product) =>
  getReviewSummary(p.handle)?.average.toFixed(1) ?? '—';

const ROWS: CompareRow[] = [
  {
    key: 'price',
    label: 'Price',
    valueKey: p => String(p.price),
    render: p => (
      <span className="text-sm font-extrabold text-white tabular-nums">
        {formatPrice(p.price)}
      </span>
    ),
  },
  {
    key: 'collection',
    label: 'Collection',
    valueKey: p => p.category,
    render: p => <span className="text-sm text-zinc-300">{p.category}</span>,
  },
  {
    key: 'rating',
    label: 'Rating',
    valueKey: ratingKey,
    render: p => {
      const summary = getReviewSummary(p.handle);
      if (!summary) return <span className="text-sm text-zinc-500">—</span>;
      return (
        <span className="inline-flex items-center gap-1.5">
          <RatingStars rating={summary.average} size="sm" />
          <span className="text-sm font-bold text-white tabular-nums">
            {summary.average.toFixed(1)}
          </span>
        </span>
      );
    },
  },
  {
    key: 'badge',
    label: 'Badge',
    valueKey: p => p.badge ?? '—',
    render: p => (
      <span
        className={cn(
          'inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
          p.badge ? 'bg-accent/15 text-accent' : 'text-zinc-600'
        )}
      >
        {p.badge ?? '—'}
      </span>
    ),
  },
  {
    key: 'sizes',
    label: 'Sizes',
    valueKey: formatSizes,
    render: p => (
      <span className="text-sm text-zinc-300">{formatSizes(p)}</span>
    ),
  },
  {
    key: 'colors',
    label: 'Colors',
    valueKey: formatColors,
    render: p => (
      <span className="text-sm text-zinc-300">{formatColors(p)}</span>
    ),
  },
  {
    key: 'tags',
    label: 'Tags',
    valueKey: formatTags,
    render: p => <span className="text-sm text-zinc-300">{formatTags(p)}</span>,
  },
];

// ─── Component ───────────────────────────────────────────────────

/**
 * Comparison drawer — slide-in panel with a side-by-side spec table.
 *
 * Mirrors the CartDrawer animation (overlay + right panel), adds Escape
 * handling and body scroll lock, and lays out products as columns of a
 * horizontally scrollable table. The first (label) column stays pinned
 * while the product columns scroll. Any row whose values differ across
 * the selection gets its differing cells tinted accent — a live
 * "difference highlight" rather than a static list.
 */
export function CompareDrawer({ className }: CompareDrawerProps) {
  const items = useCompareStore(s => s.items);
  const isOpen = useCompareStore(s => s.isOpen);
  const setIsOpen = useCompareStore(s => s.setIsOpen);
  const removeItem = useCompareStore(s => s.removeItem);
  const clearAll = useCompareStore(s => s.clearAll);

  const products = items
    .map(handle => getProductByHandle(handle))
    .filter((p): p is Product => p !== undefined);

  // Escape to close + body scroll lock while open.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, setIsOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="compare-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="compare-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="compare-heading"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              'fixed right-0 top-0 bottom-0 z-[60]',
              'w-full max-w-[880px]',
              'bg-background/95 backdrop-blur-2xl',
              'border-l border-border/80',
              'flex flex-col',
              'shadow-[-8px_0_40px_rgba(0,0,0,0.5)]',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-border/60 px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Scale className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2
                    id="compare-heading"
                    className="text-lg font-bold text-white tracking-tight"
                  >
                    Compare Products
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {products.length} of {MAX_COMPARE_ITEMS} selected
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close compare"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {products.length === 0 ? (
                <div className="px-6 py-20 text-center">
                  <p className="text-4xl" aria-hidden="true">
                    ⚖️
                  </p>
                  <h3 className="mt-3 text-lg font-display font-bold text-white">
                    Nothing to compare yet
                  </h3>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
                    Open a product and tap the scale icon to start building your
                    comparison.
                  </p>
                  <Link
                    href="/collections/all"
                    onClick={() => setIsOpen(false)}
                    className="mt-6 inline-flex items-center rounded-xl bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Browse products
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full min-w-[560px] border-collapse text-left">
                    <tbody>
                      {/* ── Product header row ─────────────────── */}
                      <tr className="border-b border-border/60">
                        <th
                          scope="col"
                          className="sticky left-0 z-10 w-32 bg-background px-5 py-4 sm:px-6"
                        />
                        {products.map(product => (
                          <th
                            key={product.handle}
                            scope="col"
                            className="min-w-[180px] px-4 py-4 align-top"
                          >
                            <div className="flex flex-col gap-3">
                              <div className="flex items-start justify-between gap-2">
                                <Link
                                  href={product.href}
                                  onClick={() => setIsOpen(false)}
                                  className="group inline-flex flex-1 items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                                  aria-label={`View ${product.name}`}
                                >
                                  <span
                                    className={cn(
                                      'h-14 w-14 shrink-0 rounded-lg border border-white/[0.06] transition-transform group-hover:scale-105',
                                      product.gradient
                                    )}
                                    aria-hidden="true"
                                  />
                                  <span className="min-w-0">
                                    <span className="block truncate text-sm font-bold text-white group-hover:text-accent transition-colors">
                                      {product.name}
                                    </span>
                                    <span className="mt-0.5 block text-xs font-bold text-accent tabular-nums">
                                      {formatPrice(product.price)}
                                    </span>
                                  </span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => removeItem(product.handle)}
                                  className="shrink-0 rounded-md p-1 text-zinc-600 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                  aria-label={`Remove ${product.name} from compare`}
                                >
                                  <X className="h-4 w-4" aria-hidden="true" />
                                </button>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>

                      {/* ── Attribute rows ─────────────────────── */}
                      {ROWS.map(row => {
                        const keys = products.map(p => row.valueKey(p));
                        const hasDiff = new Set(keys).size > 1;
                        const first = keys[0];

                        return (
                          <tr
                            key={row.key}
                            className="border-b border-white/[0.04]"
                          >
                            <th
                              scope="row"
                              className="sticky left-0 z-10 bg-background px-5 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500 sm:px-6"
                            >
                              {row.label}
                            </th>
                            {products.map((product, i) => {
                              const diff = hasDiff && keys[i] !== first;
                              return (
                                <td
                                  key={product.handle}
                                  className={cn(
                                    'px-4 py-3',
                                    diff && 'bg-accent/[0.07] text-accent'
                                  )}
                                >
                                  {row.render(product)}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}

                      {/* ── Description row ────────────────────── */}
                      <tr className="border-b border-border/60">
                        <th
                          scope="row"
                          className="sticky left-0 z-10 bg-background px-5 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500 sm:px-6"
                        >
                          Details
                        </th>
                        {products.map(product => (
                          <td key={product.handle} className="px-4 py-3">
                            <p className="text-xs leading-relaxed text-zinc-400 line-clamp-4">
                              {product.description}
                            </p>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>

                  <p className="px-5 py-3 text-xs text-zinc-500 sm:px-6">
                    <span className="font-semibold text-accent">
                      Rows with differing values
                    </span>{' '}
                    are tinted to make trade-offs obvious at a glance.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {products.length > 0 && (
              <div className="flex items-center justify-between gap-4 border-t border-border/60 px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear all
                </button>
                <p className="hidden sm:block text-xs text-zinc-600">
                  Add up to {MAX_COMPARE_ITEMS} products from any product card.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
