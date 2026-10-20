'use client';

import { useRef, useEffect } from 'react';
import { useUIStore } from '@/store';
import { cn } from '@/utils/cn';

interface MobileMenuWrapperProps {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
}

export function MobileMenuWrapper({
  isMobileMenuOpen,
  isSearchOpen,
}: MobileMenuWrapperProps) {
  const headerRef = useRef<HTMLElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  // Store the hamburger element for animation coordination
  useEffect(() => {
    if (hamburgerRef.current) {
      headerRef.current = hamburgerRef.current.closest('header') as HTMLElement;
    }
  }, []);

  // Handle hamburger button click
  const toggleMobileMenu = useUIStore(s => s.toggleMobileMenu);

  // Escape key handler for mobile menu
  useEffect(() => {
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        useUIStore.getState().setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Escape key handler for search
  useEffect(() => {
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        useUIStore.getState().setSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSearchOpen]);

  return (
    <button
      ref={hamburgerRef}
      type="button"
      onClick={toggleMobileMenu}
      className={cn(
        'md:hidden relative flex items-center justify-center w-10 h-10 rounded-lg',
        'text-zinc-400 hover:text-white',
        'transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
      )}
      aria-label={
        isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
      }
      aria-expanded={isMobileMenuOpen}
      aria-controls="mobile-menu"
    >
      <div className="relative w-5 h-4">
        <span
          className={cn(
            'absolute left-0 top-0 h-[2px] w-full rounded-full bg-current transition-all duration-300',
            isMobileMenuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : ''
          )}
        />
        <span
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 h-[2px] w-full rounded-full bg-current transition-all duration-300',
            isMobileMenuOpen ? 'opacity-0' : ''
          )}
        />
        <span
          className={cn(
            'absolute left-0 bottom-0 h-[2px] w-full rounded-full bg-current transition-all duration-300',
            isMobileMenuOpen ? 'bottom-1/2 translate-y-1/2 -rotate-45' : ''
          )}
        />
      </div>
    </button>
  );
}
