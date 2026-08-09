'use client';

import React, {
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PRODUCTS } from '@/data/products';
import { useWishlistStore } from '@/store';
import { toProductCardProps } from '@/features/collections';
import { createWishlistPageEntrance } from '@/animations/gsap/wishlist';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import { WishlistGrid } from './WishlistGrid';
import { WishlistEmptyState } from './WishlistEmptyState';
import { WishlistSkeleton } from './WishlistSkeleton';

/**
 * Client component for the wishlist page.
 *
 * Reads wishlisted product handles from the store, looks up
 * full product data, and renders a grid with header controls.
 *
 * ── States ─────────────────────────────────────────────────
 * - Loading: skeleton while the persisted store rehydrates
 *            (prevents the empty state from flashing for returners)
 * - Empty:   WishlistEmptyState with CTA to browse collections
 * - Filled:  header + WishlistGrid, GSAP entrance reveal
 */
export function WishlistPageClient() {
  const items = useWishlistStore(s => s.items);
  const clearWishlist = useWishlistStore(s => s.clearWishlist);
  const [isHydrated, setIsHydrated] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // ── Hydration gate ─────────────────────────────────────────────
  // Zustand persist hydrates localStorage asynchronously; render a
  // skeleton until it finishes so returning users don't see a flash
  // of the empty state.
  useEffect(() => {
    if (useWishlistStore.persist.hasHydrated()) {
      setIsHydrated(true);
      return;
    }
    const unsub = useWishlistStore.persist.onFinishHydration(() =>
      setIsHydrated(true)
    );
    return unsub;
  }, []);

  // ── GSAP header entrance ───────────────────────────────────────
  // Plays once when the header mounts after hydration.  A ref guard
  // prevents the entrance from replaying when the store changes cause
  // re-renders (unlike the custom useGSAP hook which re-fires each render).
  const entrancePlayed = useRef(false);

  useEffect(() => {
    if (entrancePlayed.current) return;
    if (!headerRef.current) return;
    entrancePlayed.current = true;
    createWishlistPageEntrance(headerRef.current);
  }, [isHydrated]);

  // ── Derived data ────────────────────────────────────────────────

  const products = useMemo(
    () => PRODUCTS.filter(p => items.includes(p.handle)),
    [items]
  );

  const productCards = useMemo(
    () => products.map(toProductCardProps),
    [products]
  );

  const count = products.length;

  // ── Handlers ─────────────────────────────────────────────────────

  const handleClearAll = useCallback(() => {
    if (count === 0) return;

    // Snapshot handles so "Undo" can restore the exact set.
    const handles = [...items];
    clearWishlist();

    toast('Wishlist cleared', {
      description: 'All saved items were removed.',
      action: {
        label: 'Undo',
        onClick: () =>
          handles.forEach(h => useWishlistStore.getState().addItem(h)),
      },
    });
  }, [count, items, clearWishlist]);

  // ── Loading state ───────────────────────────────────────────────

  if (!isHydrated) {
    return (
      <Section className="py-16 sm:py-20 lg:py-24 bg-background min-h-screen">
        <Container>
          <WishlistSkeleton />
        </Container>
      </Section>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────

  if (count === 0) {
    return <WishlistEmptyState />;
  }

  // ── Render ──────────────────────────────────────────────────────

  return (
    <Section className="py-16 sm:py-20 lg:py-24 bg-background min-h-screen">
      <Container>
        {/* ── Header (GSAP entrance) ──────────────────────────── */}
        <div ref={headerRef} className="mb-10 sm:mb-14" style={{ opacity: 0 }}>
          {/* Pre-label */}
          <span
            data-wishlist-reveal
            className="text-xs font-bold text-accent uppercase tracking-[0.2em] block mb-2"
          >
            COLLECTOR&apos;S ARCHIVE
          </span>

          <div
            data-wishlist-reveal
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-primary tracking-tight">
                Your Wishlist
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                {count} {count === 1 ? 'item' : 'items'} saved
              </p>
            </div>

            {/* Clear all */}
            {count > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-sm font-medium text-secondary-text hover:text-accent hover:border-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* ── Product Grid ───────────────────────────────────── */}
        <WishlistGrid products={productCards} />
      </Container>
    </Section>
  );
}
