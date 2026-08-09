'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal } from 'lucide-react';
import { CollectionFilters } from './CollectionFilters';
import type { FilterState } from '@/features/collections';

interface FilterDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableSizes: string[];
  availableColors: string[];
  totalCount: number;
}

/**
 * Slide-over filter drawer for mobile devices.
 * Uses Framer Motion for smooth enter/exit animation.
 */
export function FilterDrawer({
  isOpen,
  onOpenChange,
  filters,
  onFilterChange,
  availableSizes,
  availableColors,
}: FilterDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Trap focus and handle escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus the close button when drawer opens
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onOpenChange]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="filter-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            key="filter-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-surface border-l border-border z-[70] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
          >
            {/* Header */}
            <div className="sticky top-0 bg-surface border-b border-border z-10 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal
                  className="w-4 h-4 text-accent"
                  aria-hidden="true"
                />
                <h2 className="text-base font-bold text-primary font-display">
                  Filters
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-border text-secondary-text hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close filter drawer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Filter content */}
            <div className="px-5 py-5">
              <CollectionFilters
                filters={filters}
                onFilterChange={onFilterChange}
                availableSizes={availableSizes}
                availableColors={availableColors}
                totalCount={0}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
