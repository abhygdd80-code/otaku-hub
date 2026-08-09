'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowUpDown } from 'lucide-react';
import { SORT_OPTIONS, type SortOption } from '@/features/collections';

interface CollectionSortProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount: number;
}

export function CollectionSort({
  currentSort,
  onSortChange,
  totalCount,
}: CollectionSortProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLabel =
    SORT_OPTIONS.find(o => o.value === currentSort)?.label ?? 'Featured';

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
      <p className="text-sm text-secondary-text">
        <span className="text-primary font-semibold">{totalCount}</span>{' '}
        {totalCount === 1 ? 'Product' : 'Products'}
      </p>

      <div ref={dropdownRef} className="relative" onKeyDown={handleKeyDown}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-sm font-medium text-primary hover:border-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Sort products"
        >
          <ArrowUpDown
            className="w-3.5 h-3.5 text-muted-foreground"
            aria-hidden="true"
          />
          <span>{currentLabel}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              role="listbox"
              aria-label="Sort options"
              className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-surface border border-border shadow-xl z-50 py-1.5 overflow-hidden"
            >
              {SORT_OPTIONS.map(option => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={currentSort === option.value}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSortChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                      currentSort === option.value
                        ? 'text-accent font-semibold bg-accent/5'
                        : 'text-secondary-text hover:text-primary hover:bg-surface/80'
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
