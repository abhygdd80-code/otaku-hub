'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store';
import { useSearchStore } from '@/store/search-store';
import { useDebounce } from '@/hooks/useDebounce';
import { searchProducts, type SearchResultItem } from '@/features/search';
import { isShopifyConfigured } from '@/lib/shopify/config';
import { searchShopifyProducts } from '@/lib/shopify/search';
import { SearchInput } from './SearchInput';
import { SearchGrid } from './SearchGrid';
import { RecentSearches } from './RecentSearches';
import { TrendingSearches } from './TrendingSearches';
import { SearchEmptyState } from './SearchEmptyState';
import { SearchSkeleton } from './SearchSkeleton';
import { trackSearch } from '@/lib/analytics';

/**
 * Full-screen animated search overlay.
 *
 * - Opens via Ctrl+K / Cmd+K
 * - Closes on ESC, backdrop click, or close button
 * - Arrow key + Enter navigation through results
 * - Responsive: centered panel on desktop, full-screen on mobile
 * - Smooth spring/slide animations via Framer Motion
 */
export function SearchDialog() {
  const router = useRouter();
  const isOpen = useUIStore(s => s.isSearchOpen);
  const setSearchOpen = useUIStore(s => s.setSearchOpen);

  const query = useSearchStore(s => s.query);
  const setQuery = useSearchStore(s => s.setQuery);
  const addRecentSearch = useSearchStore(s => s.addRecentSearch);

  const debouncedQuery = useDebounce(query, 200);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [asyncResults, setAsyncResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputInitialized = useRef(false);

  // ─── Search Results ─────────────────────────────────────────────

  const shopifyEnabled = isShopifyConfigured();

  // Async Shopify search
  useEffect(() => {
    if (!shopifyEnabled || !debouncedQuery.trim()) {
      setAsyncResults([]);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    searchShopifyProducts(debouncedQuery)
      .then(results => {
        if (!cancelled) {
          setAsyncResults(results);
          setIsSearching(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAsyncResults([]);
          setIsSearching(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, shopifyEnabled]);

  // Local search (fallback when Shopify is not configured)
  const localResults = useMemo(
    () => (shopifyEnabled ? [] : searchProducts(debouncedQuery)),
    [debouncedQuery, shopifyEnabled]
  );

  // Combine results: Shopify async results take precedence
  const results = shopifyEnabled ? asyncResults : localResults;

  const hasQuery = query.trim().length > 0;
  const hasDebouncedQuery = debouncedQuery.trim().length > 0;
  const showResults = hasDebouncedQuery && results.length > 0;
  const showEmpty = hasDebouncedQuery && results.length === 0;
  const showIdle = !hasQuery;
  const showLoading = hasQuery && !hasDebouncedQuery;

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [debouncedQuery]);

  // Show brief skeleton when query changes (visual feedback)
  useEffect(() => {
    if (hasQuery && !hasDebouncedQuery) {
      setShowSkeleton(true);
    } else {
      const timer = setTimeout(() => setShowSkeleton(false), 100);
      return () => clearTimeout(timer);
    }
  }, [hasQuery, hasDebouncedQuery]);

  // ─── Keyboard: Ctrl+K / Cmd+K to open ─────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K / Cmd+K — open search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  // ─── Keyboard: arrow navigation + ESC inside dialog ───────────

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setHighlightedIndex(-1);
    // Don't clear query immediately — let it persist for re-open
  }, [setSearchOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSearch();
        return;
      }

      if (!showResults) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < results.length) {
            const selected = results[highlightedIndex];
            addRecentSearch(selected.product.name);
            trackSearch(query);
            closeSearch();
            // Navigate to product page (client-side, no full reload)
            router.push(`/product/${selected.product.handle}`);
          }
          break;
      }
    },
    [
      showResults,
      results,
      highlightedIndex,
      addRecentSearch,
      closeSearch,
      router,
    ]
  );

  // ─── Body scroll lock when open ──────────────────────────────

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ─── Reset on close ──────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
      inputInitialized.current = false;
    }
  }, [isOpen]);

  // ─── Handlers ─────────────────────────────────────────────────

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
    },
    [setQuery]
  );

  const handleSubmit = useCallback(() => {
    if (results.length > 0) {
      const targetIdx = highlightedIndex >= 0 ? highlightedIndex : 0;
      const selected = results[targetIdx];
      addRecentSearch(selected.product.name);
      trackSearch(query);
      closeSearch();
      router.push(`/product/${selected.product.handle}`);
    } else if (query.trim()) {
      trackSearch(query);
      // Save the search even if no results
      addRecentSearch(query.trim());
    }
  }, [results, highlightedIndex, query, addRecentSearch, closeSearch, router]);

  const handleTrendingSelect = useCallback(
    (term: string) => {
      setQuery(term);
    },
    [setQuery]
  );

  const handleRecentSelect = useCallback(
    (term: string) => {
      setQuery(term);
    },
    [setQuery]
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      // Only close if clicking the backdrop itself, not the panel
      if (e.target === e.currentTarget) {
        closeSearch();
      }
    },
    [closeSearch]
  );

  const handleResultSelect = useCallback(() => {
    closeSearch();
  }, [closeSearch]);

  // ─── Animation variants ───────────────────────────────────────

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const panelVariants = {
    hidden: { opacity: 0, y: -24, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 350,
        damping: 30,
        mass: 0.8,
      },
    },
    exit: {
      opacity: 0,
      y: -24,
      scale: 0.98,
      transition: { duration: 0.18, ease: 'easeIn' as const },
    },
  };

  // ─── Render ───────────────────────────────────────────────────

  return (
    <>
      {/* Hidden overlay that's always rendered for keyboard shortcut */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="search-backdrop"
            className="fixed inset-0 z-[80]"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop with blur — decorative, hidden from assistive tech */}
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
              onClick={handleBackdropClick}
              aria-hidden="true"
            />

            {/* Search panel */}
            <motion.div
              ref={panelRef}
              key="search-panel"
              className="absolute inset-x-0 top-0 sm:top-[12vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl sm:rounded-2xl bg-surface/95 sm:border sm:border-border/60 shadow-2xl overflow-hidden sm:backdrop-blur-2xl sm:shadow-[0_0_80px_rgba(0,0,0,0.5)]"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={panelVariants}
              role="dialog"
              aria-modal="true"
              aria-label="Search products"
            >
              {/* Input area */}
              <div className="px-5 pt-4 pb-3 border-b border-border/60">
                <SearchInput
                  value={query}
                  onChange={handleQueryChange}
                  onSubmit={handleSubmit}
                  onClose={closeSearch}
                  autoFocus={true}
                />
              </div>

              {/* Results / Suggestions area */}
              <div
                className="overflow-y-auto max-h-[60vh] sm:max-h-[65vh]"
                onKeyDown={handleKeyDown}
              >
                {/* Loading state */}
                {(showLoading || showSkeleton) && <SearchSkeleton count={5} />}

                {/* Results */}
                {showResults && (
                  <SearchGrid
                    results={results}
                    highlightedIndex={highlightedIndex}
                    onSelect={handleResultSelect}
                  />
                )}

                {/* Empty state */}
                {showEmpty && (
                  <SearchEmptyState
                    query={debouncedQuery}
                    onTrendingSelect={handleTrendingSelect}
                  />
                )}

                {/* Idle state — recent + trending */}
                {showIdle && (
                  <div className="px-5 py-5 space-y-6">
                    <RecentSearches onSelect={handleRecentSelect} />
                    <TrendingSearches onSelect={handleTrendingSelect} />
                  </div>
                )}
              </div>

              {/* Footer hints */}
              <div className="hidden sm:flex items-center justify-between px-5 py-2.5 border-t border-border/60 bg-background/50">
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface text-[10px] font-mono text-secondary-text">
                      ↑↓
                    </kbd>
                    <span>Navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface text-[10px] font-mono text-secondary-text">
                      ⏎
                    </kbd>
                    <span>Open</span>
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface text-[10px] font-mono text-secondary-text">
                    ESC
                  </kbd>
                  <span>Close</span>
                </span>
              </div>

              {/* Mobile close hint */}
              <div className="sm:hidden px-5 py-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={closeSearch}
                  className="w-full py-2 rounded-lg bg-surface border border-border text-sm font-medium text-secondary-text hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Close Search
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
