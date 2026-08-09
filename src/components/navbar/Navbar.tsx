'use client';

import { useRef, useCallback, useEffect } from 'react';
import { gsap } from '@/lib/gsap';
import { useUIStore, useAnnouncementStore } from '@/store';
import { Z_INDEX } from '@/constants';
import { cn } from '@/utils/cn';
import { createNavbarScrollAnimation } from '@/animations/gsap/navbar';
import { NavLogo } from './NavLogo';
import { DesktopNav } from './DesktopNav';
import { SearchButton } from './SearchButton';
import { WishlistNavIcon } from '@/components/wishlist/WishlistNavIcon';
import { AccountMenu } from '@/components/auth/AccountMenu';
import { CartButton } from './CartButton';
import { MobileMenu } from './MobileMenu';
import {
  AnnouncementBar,
  ANNOUNCEMENT_HEIGHT,
} from '@/components/announcement/AnnouncementBar';

/**
 * Premium sticky navbar for OtakuSaga.
 *
 * Layout
 * ------
 *   Left:   OtakuSaga logo (NavLogo)
 *   Center: DesktopNav (Home, Collections, New Drops, About)
 *   Right:  SearchButton, WishlistNavIcon, AccountMenu, CartButton, hamburger (mobile)
 *
 * Animations
 * ----------
 * - Logo entrance + floating handled by NavLogo internally
 * - Scroll-driven background transition via GSAP MatchMedia + ScrollTrigger
 *   (transparent → glassmorphic black on scroll, with logo shrink on desktop)
 * - Escape key closes mobile menu and search overlay
 *
 * Accessibility
 * -------------
 * - Fixed header with proper z-index stacking
 * - Spacer div accounts for fixed height so content isn't hidden
 * - Mobile menu rendered outside header for correct z-index
 */
export function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const toggleMobileMenu = useUIStore(s => s.toggleMobileMenu);
  const isMobileMenuOpen = useUIStore(s => s.isMobileMenuOpen);
  const isSearchOpen = useUIStore(s => s.isSearchOpen);
  const barVisible = useAnnouncementStore(s => !s.isDismissed);

  // ── GSAP entrance + scroll-driven background ──────────────────
  useEffect(() => {
    const header = headerRef.current;
    const logo = logoRef.current;
    if (!header) return;

    const ctx = gsap.context(() => {
      // Scroll-driven background transition
      createNavbarScrollAnimation(header, logo);

      // Subtle continuous floating for the logo
      if (logo) {
        gsap.to(logo, {
          y: -3,
          duration: 3,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      }
    });

    return () => ctx.revert();
  }, []);

  // ── Close overlays on Escape ──────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMobileMenuOpen) {
          useUIStore.getState().setMobileMenuOpen(false);
        }
        if (isSearchOpen) {
          useUIStore.getState().setSearchOpen(false);
        }
      }
    },
    [isMobileMenuOpen, isSearchOpen]
  );

  return (
    <>
      {/* ── Announcement bar (fixed, above navbar) ─────────── */}
      <AnnouncementBar />

      <header
        ref={headerRef}
        onKeyDown={handleKeyDown}
        style={{
          zIndex: Z_INDEX.navbar,
          top: barVisible ? `${ANNOUNCEMENT_HEIGHT}px` : '0px',
        }}
        className={cn(
          // Layout
          'fixed left-0 right-0',
          // Slide down / up with the announcement bar
          'transition-[top] duration-300 ease-out',
          // Initial transparent state — GSAP animates background on scroll
          'bg-transparent border-b border-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Logo */}
            <NavLogo ref={logoRef} />

            {/* Center: Desktop navigation */}
            <DesktopNav />

            {/* Right: Action icons */}
            <div className="flex items-center gap-0.5">
              <SearchButton />

              <WishlistNavIcon />

              <AccountMenu />

              <CartButton />

              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={toggleMobileMenu}
                className={cn(
                  'md:hidden relative flex items-center justify-center w-10 h-10 rounded-lg',
                  'text-zinc-400 hover:text-white',
                  'transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                )}
                aria-label={
                  isMobileMenuOpen
                    ? 'Close navigation menu'
                    : 'Open navigation menu'
                }
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <div className="relative w-5 h-4">
                  <span
                    className={cn(
                      'absolute left-0 top-0 h-[2px] w-full rounded-full bg-current transition-all duration-300',
                      isMobileMenuOpen
                        ? 'top-1/2 -translate-y-1/2 rotate-45'
                        : ''
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
                      isMobileMenuOpen
                        ? 'bottom-1/2 translate-y-1/2 -rotate-45'
                        : ''
                    )}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to account for fixed navbar + announcement bar height */}
      <div
        className={cn('h-16 sm:h-20', barVisible && 'h-[100px] sm:h-[116px]')}
        aria-hidden="true"
      />

      {/* Mobile menu overlay (rendered outside header for z-index) */}
      <MobileMenu />
    </>
  );
}

export default Navbar;
