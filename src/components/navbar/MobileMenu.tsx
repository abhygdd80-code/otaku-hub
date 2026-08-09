'use client';

import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Globe, MessageCircle, Video, X as XIcon } from 'lucide-react';
import { ROUTES } from '@/constants';
import { useUIStore } from '@/store';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

interface MobileMenuProps {
  className?: string;
}

const MOBILE_NAV_ITEMS = [
  { label: 'Home', href: ROUTES.home },
  { label: 'Collections', href: ROUTES.collections },
  { label: 'New Drops', href: ROUTES.newArrivals },
] as const;

const socialLinks = [
  { icon: Globe, href: 'https://instagram.com', label: 'Instagram' },
  { icon: MessageCircle, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Video, href: 'https://youtube.com', label: 'YouTube' },
] as const;

/**
 * Full-screen animated mobile navigation menu.
 *
 * - Slides in from the right with staggered link animations
 * - Locks body scroll when open, compensates for scrollbar width
 * - Closes on Escape keydown or backdrop click
 * - Includes social links and a "Shop Now" CTA at the bottom
 * - Active route highlighted with accent background
 */
export function MobileMenu({ className }: MobileMenuProps) {
  const isOpen = useUIStore(s => s.isMobileMenuOpen);
  const setOpen = useUIStore(s => s.setMobileMenuOpen);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const closeMenu = useCallback(() => setOpen(false), [setOpen]);

  // ── Close on Escape ──────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setOpen(false);
      }
    },
    [isOpen, setOpen]
  );

  // ── Move focus into the menu on open ──────────────────────────
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current =
        document.activeElement as HTMLElement | null;
      // Focus the close button after the spring animation settles
      requestAnimationFrame(() => {
        menuRef.current
          ?.querySelector<HTMLElement>('button:not([disabled])')
          ?.focus();
      });
    }
  }, [isOpen]);

  // ── Restore focus when the menu closes ────────────────────────
  useEffect(() => {
    if (isOpen) return;
    previouslyFocusedRef.current?.focus();
    previouslyFocusedRef.current = null;
  }, [isOpen]);

  // ── Lock body scroll when open ───────────────────────────────
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // ── Register Escape key listener ─────────────────────────────
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Trap Tab focus inside the menu ────────────────────────────
  const FOCUSABLE =
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const handlePanelKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const panel = menuRef.current;
    if (!panel) return;

    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE)
    );
    if (focusables.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement;

    if (e.shiftKey && (active === first || !panel.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  const linkVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1 + i * 0.06,
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    }),
    exit: (i: number) => ({
      opacity: 0,
      x: 40,
      transition: {
        delay: 0.05 * (MOBILE_NAV_ITEMS.length - i),
        duration: 0.25,
        ease: 'easeIn' as const,
      },
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* ── Menu panel ────────────────────────────────────── */}
          <motion.div
            ref={menuRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            onKeyDown={handlePanelKeyDown}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className={cn(
              'fixed top-0 right-0 bottom-0 w-full max-w-sm z-50 md:hidden',
              'bg-surface/95 backdrop-blur-2xl',
              'border-l border-border/60',
              'flex flex-col',
              className
            )}
          >
            {/* ── Header ────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <span className="text-sm font-medium text-zinc-500">
                Navigation
              </span>
              <button
                type="button"
                onClick={closeMenu}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full',
                  'text-zinc-400 hover:text-white hover:bg-white/5',
                  'transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                )}
                aria-label="Close navigation menu"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* ── Nav links ─────────────────────────────────── */}
            <nav
              className="flex-1 px-6 py-8 overflow-y-auto"
              aria-label="Mobile navigation"
            >
              <ul className="space-y-1">
                {MOBILE_NAV_ITEMS.map((link, i) => {
                  const active = isActive(link.href);
                  return (
                    <motion.li
                      key={link.href}
                      custom={i}
                      variants={linkVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className={cn(
                          'block px-4 py-3 rounded-xl text-xl sm:text-2xl font-display font-bold tracking-tight transition-all duration-200',
                          active
                            ? 'text-white bg-accent/10 border border-accent/20'
                            : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                        )}
                        aria-current={active ? 'page' : undefined}
                      >
                        {link.label}
                        {active && (
                          <span className="inline-block ml-2 w-1.5 h-1.5 rounded-full bg-accent align-middle" />
                        )}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            {/* ── Footer ──────────────────────────────────── */}
            <div className="px-6 py-6 border-t border-border/60 space-y-6">
              {/* CTA */}
              <Link
                href={ROUTES.shop}
                onClick={closeMenu}
                className={cn(
                  'block w-full py-3 px-6 rounded-xl text-center text-base font-semibold',
                  'bg-accent text-white hover:bg-accent/90',
                  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                )}
              >
                Shop Now
              </Link>

              {/* Social links */}
              <div className="flex items-center justify-center gap-4">
                {socialLinks.map(social => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full',
                      'text-zinc-500 hover:text-white hover:bg-white/5',
                      'transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                    )}
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
