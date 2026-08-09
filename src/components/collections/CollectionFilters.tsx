'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, RotateCcw } from 'lucide-react';
import {
  type FilterState,
  DEFAULT_FILTERS,
  PRICE_RANGES,
} from '@/features/collections';

interface CollectionFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableSizes: string[];
  availableColors: string[];
  totalCount: number;
}

// ─── Collapsible Section ────────────────────────────────────────

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const sectionId = `filter-section-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="border-b border-border pb-5 mb-5 last:border-b-0 last:pb-0 last:mb-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm px-1"
        aria-expanded={open}
        aria-controls={sectionId}
      >
        <span className="text-xs font-bold text-foreground tracking-wider uppercase">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={sectionId}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Checkbox Row ───────────────────────────────────────────────

function FilterCheckbox({
  label,
  checked,
  onChange,
  count,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  count?: number;
}) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <label
      htmlFor={id}
      className="flex items-center gap-3 cursor-pointer group px-1 py-1.5 rounded-sm hover:bg-surface/50 transition-colors"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-border bg-transparent text-accent focus:ring-accent focus:ring-offset-0 focus:ring-2 cursor-pointer accent-accent"
      />
      <span className="text-sm text-secondary-text group-hover:text-primary transition-colors flex-1">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </label>
  );
}

// ─── Color Swatch Row ───────────────────────────────────────────

function ColorSwatch({
  color,
  checked,
  onChange,
}: {
  color: string;
  checked: boolean;
  onChange: () => void;
}) {
  const id = `color-${color.toLowerCase().replace(/\s+/g, '-')}`;
  const swatchColor = getSwatchColor(color);

  return (
    <label
      htmlFor={id}
      className="flex items-center gap-3 cursor-pointer group px-1 py-1.5 rounded-sm hover:bg-surface/50 transition-colors"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={`w-5 h-5 rounded-full border-2 transition-all ${
          checked
            ? 'border-accent scale-110'
            : 'border-border group-hover:border-muted'
        }`}
        style={{ backgroundColor: swatchColor }}
        aria-hidden="true"
      />
      <span className="text-sm text-secondary-text group-hover:text-primary transition-colors">
        {color}
      </span>
    </label>
  );
}

/**
 * Map color names to hex values for the swatch dots.
 */
function getSwatchColor(color: string): string {
  const colorMap: Record<string, string> = {
    'Obsidian Black': '#0a0a0a',
    'Void Gray': '#404040',
    'Cyber Crimson': '#dc2626',
    'Titanium White': '#e5e5e5',
    'Signal Black': '#171717',
    'Neon Cyan': '#06b6d4',
    'Crimson Black': '#1a0a0a',
    'Blood Rose': '#9f1239',
    'Steel Black': '#1f1f1f',
    'Crimson Accent': '#e50914',
    'Neon Crimson': '#e50914',
  };
  return colorMap[color] ?? '#666';
}

// ─── Available / Filters Summary ────────────────────────────────

function ActiveFilterTags({
  filters,
  onReset,
}: {
  filters: FilterState;
  onReset: () => void;
}) {
  const activeCount =
    filters.priceRanges.length +
    filters.sizes.length +
    filters.colors.length +
    (filters.inStockOnly ? 1 : 0);

  if (activeCount === 0) return null;

  return (
    <div className="mb-5 flex items-center gap-2">
      <span className="text-xs text-muted-foreground">
        {activeCount} filter{activeCount > 1 ? 's' : ''} active
      </span>
      <button
        type="button"
        onClick={onReset}
        className="text-xs text-accent hover:text-destructive transition-colors flex items-center gap-1 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm px-1"
      >
        <RotateCcw className="w-3 h-3" aria-hidden="true" />
        Clear all
      </button>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export function CollectionFilters({
  filters,
  onFilterChange,
  availableSizes,
  availableColors,
}: CollectionFiltersProps) {
  const updateFilter = useCallback(
    (key: keyof FilterState, value: unknown) => {
      onFilterChange({ ...filters, [key]: value });
    },
    [filters, onFilterChange]
  );

  const toggleArrayFilter = useCallback(
    (key: 'priceRanges' | 'sizes' | 'colors', value: string) => {
      const current = filters[key];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      updateFilter(key, updated);
    },
    [filters, updateFilter]
  );

  const resetFilters = useCallback(() => {
    onFilterChange(DEFAULT_FILTERS);
  }, [onFilterChange]);

  return (
    <aside className="w-full" aria-label="Product filters" role="form">
      <ActiveFilterTags filters={filters} onReset={resetFilters} />

      {/* Price Ranges */}
      <FilterSection title="Price">
        {PRICE_RANGES.map(range => (
          <FilterCheckbox
            key={range.value}
            label={range.label}
            checked={filters.priceRanges.includes(range.value)}
            onChange={() => toggleArrayFilter('priceRanges', range.value)}
          />
        ))}
      </FilterSection>

      {/* Sizes */}
      <FilterSection title="Size">
        {availableSizes.map(size => (
          <FilterCheckbox
            key={size}
            label={size}
            checked={filters.sizes.includes(size)}
            onChange={() => toggleArrayFilter('sizes', size)}
          />
        ))}
        {availableSizes.length === 0 && (
          <p className="text-xs text-muted-foreground px-1">
            No size options available
          </p>
        )}
      </FilterSection>

      {/* Colors */}
      <FilterSection title="Color">
        {availableColors.map(color => (
          <ColorSwatch
            key={color}
            color={color}
            checked={filters.colors.includes(color)}
            onChange={() => toggleArrayFilter('colors', color)}
          />
        ))}
        {availableColors.length === 0 && (
          <p className="text-xs text-muted-foreground px-1">
            No color options available
          </p>
        )}
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" defaultOpen={false}>
        <FilterCheckbox
          label="In Stock Only"
          checked={filters.inStockOnly}
          onChange={() => updateFilter('inStockOnly', !filters.inStockOnly)}
        />
      </FilterSection>
    </aside>
  );
}
