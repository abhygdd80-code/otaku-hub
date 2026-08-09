'use client';

import { Search } from 'lucide-react';
import { useUIStore } from '@/store';
import { cn } from '@/utils/cn';

interface SearchButtonProps {
  className?: string;
}

/**
 * Search toggle button for the navbar.
 *
 * Clicking toggles the search overlay (SearchDialog).
 * State is managed by `useUIStore().isSearchOpen`.
 */
export function SearchButton({ className }: SearchButtonProps) {
  const toggleSearch = useUIStore(s => s.toggleSearch);
  const isSearchOpen = useUIStore(s => s.isSearchOpen);

  return (
    <button
      type="button"
      onClick={toggleSearch}
      className={cn(
        'relative flex items-center justify-center w-10 h-10 rounded-full',
        'text-zinc-400 hover:text-white hover:bg-white/5',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      aria-label="Search items"
      aria-expanded={isSearchOpen}
    >
      <Search className="w-[18px] h-[18px]" />
    </button>
  );
}
