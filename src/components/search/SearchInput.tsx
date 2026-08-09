'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  /** Current query value */
  value: string;
  /** Called when the query changes */
  onChange: (value: string) => void;
  /** Called when the input should be submitted (e.g. Enter key) */
  onSubmit?: () => void;
  /** Called when the input should be closed */
  onClose?: () => void;
  /** Auto-focus the input on mount */
  autoFocus?: boolean;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Animated search input with icon, clear button, and responsive design.
 */
export function SearchInput({
  value,
  onChange,
  onSubmit,
  onClose,
  autoFocus = true,
  placeholder = 'Search anime hoodies, figures, tees...',
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const raf = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [autoFocus]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit?.();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    },
    [onSubmit, onClose]
  );

  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  return (
    <div className="relative flex items-center">
      <Search
        className="absolute left-0 w-5 h-5 text-muted-foreground pointer-events-none shrink-0"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Search products"
        role="combobox"
        aria-expanded={value.length > 0}
        aria-controls="search-results"
        className="w-full bg-transparent text-lg sm:text-xl text-foreground placeholder:text-zinc-600 focus:outline-none border-none pl-8 pr-10 py-3 leading-relaxed rounded-lg focus-visible:ring-2 focus-visible:ring-accent/40"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-0 flex items-center justify-center w-10 h-10 rounded-full text-zinc-500 hover:text-foreground hover:bg-surface/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
