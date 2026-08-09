'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import type { Product } from '@/data/products';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import { RecentlyViewed } from '@/components/recently-viewed';
import { CollectionHeader } from './CollectionHeader';
import { CollectionSort } from './CollectionSort';
import { CollectionGrid } from './CollectionGrid';
import { CollectionEmptyState } from './CollectionEmptyState';
import { CollectionErrorBoundary } from './CollectionErrorBoundary';
import { CollectionFilters } from './CollectionFilters';
import { FilterDrawer } from './FilterDrawer';
import {
  type FilterState,
  type SortOption,
  DEFAULT_FILTERS,
  applyFilters,
  applySort,
  getAvailableOptions,
  toProductCardProps,
} from '@/features/collections';

interface CollectionPageClientProps {
  title: string;
  description: string;
  productCount: number;
  products: Product[];
}

export function CollectionPageClient({
  title,
  description,
  productCount,
  products,
}: CollectionPageClientProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>('featured');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ── Derived: available filter options from current products ──
  const availableOptions = useMemo(
    () => getAvailableOptions(products),
    [products]
  );

  // ── Derived: filtered + sorted products ──
  const filteredProducts = useMemo(() => {
    try {
      const filtered = applyFilters(products, filters);
      return applySort(filtered, sort);
    } catch {
      return [];
    }
  }, [products, filters, sort]);

  // ── Handlers ──
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSort(newSort);
    setIsPending(true);
    // Smooth sort transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsPending(false));
    });
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Log error silently
  useEffect(() => {
    if (error) {
      console.error('Collection error:', error);
    }
  }, [error]);

  // ── Error state ──
  if (error) {
    return (
      <Section className="py-24 bg-background">
        <Container>
          <CollectionErrorBoundary error={error} reset={() => setError(null)} />
        </Container>
      </Section>
    );
  }

  // ── Common grid used in both filtered and empty states ──
  const productCards = useMemo(
    () => filteredProducts.map(toProductCardProps),
    [filteredProducts]
  );

  return (
    <>
      {/* Mobile filter drawer */}
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        filters={filters}
        onFilterChange={handleFilterChange}
        availableSizes={availableOptions.sizes}
        availableColors={availableOptions.colors}
        totalCount={filteredProducts.length}
      />

      <Section className="py-16 sm:py-20 lg:py-24 bg-background min-h-screen">
        <Container>
          {/* ── Header ── */}
          <CollectionHeader
            title={title}
            description={description}
            productCount={productCount}
          />

          <div className="flex gap-8 lg:gap-12">
            {/* ── Desktop Sidebar Filters ── */}
            <aside
              className="hidden lg:block w-64 flex-shrink-0"
              aria-label="Filter sidebar"
            >
              <div className="sticky top-28">
                <h2 className="text-xs font-bold text-foreground tracking-wider uppercase mb-5 flex items-center gap-2">
                  <SlidersHorizontal
                    className="w-3.5 h-3.5 text-accent"
                    aria-hidden="true"
                  />
                  Filters
                </h2>
                <CollectionFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  availableSizes={availableOptions.sizes}
                  availableColors={availableOptions.colors}
                  totalCount={filteredProducts.length}
                />
              </div>
            </aside>

            {/* ── Main Content ── */}
            <div className="flex-1 min-w-0">
              {/* Sort + mobile filter button */}
              <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  {/* Mobile filter toggle */}
                  <button
                    type="button"
                    onClick={() => setFilterDrawerOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-sm font-medium text-primary hover:border-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Open filter drawer"
                  >
                    <SlidersHorizontal
                      className="w-3.5 h-3.5 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span>Filters</span>
                    {(filters.priceRanges.length > 0 ||
                      filters.sizes.length > 0 ||
                      filters.colors.length > 0 ||
                      filters.inStockOnly) && (
                      <span
                        className="w-2 h-2 rounded-full bg-accent"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                  <p className="text-sm text-secondary-text hidden sm:block">
                    <span className="text-primary font-semibold">
                      {filteredProducts.length}
                    </span>{' '}
                    {filteredProducts.length === 1 ? 'Product' : 'Products'}
                  </p>
                </div>

                {/* Sort dropdown — desktop only, mobile sorts inline */}
                <div className="hidden sm:block">
                  <CollectionSort
                    currentSort={sort}
                    onSortChange={handleSortChange}
                    totalCount={filteredProducts.length}
                  />
                </div>
              </div>

              {/* Mobile sort inline */}
              <div className="sm:hidden mb-6">
                <CollectionSort
                  currentSort={sort}
                  onSortChange={handleSortChange}
                  totalCount={filteredProducts.length}
                />
              </div>

              {/* ── Product Grid or Empty State ── */}
              <AnimatePresence mode="wait">
                {productCards.length > 0 ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CollectionGrid products={productCards} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CollectionEmptyState onResetFilters={handleResetFilters} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Container>
      </Section>

      {/* Recently viewed rail */}
      <Section className="pb-16 sm:pb-20 lg:pb-24 bg-background">
        <Container>
          <RecentlyViewed />
        </Container>
      </Section>
    </>
  );
}
