'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Truck, Sparkles, CalendarDays, Crown } from 'lucide-react';
import { useAnnouncementStore } from '@/store';
import { formatPrice } from '@/lib/utils';
import { isShopifyConfigured } from '@/lib/shopify/config';

/**
 * Fixed height of the announcement bar in pixels. The Navbar offsets
 * its top and spacer to account for this value.
 */
export const ANNOUNCEMENT_HEIGHT = 36;

/**
 * Rotating messages displayed inside the announcement bar.
 * Each entry pairs an icon with a short copy string.
 */
const MESSAGES = [
  {
    icon: Truck,
    text: `Free shipping on orders over ${formatPrice(1000, 'INR')}`,
  },
  {
    icon: Sparkles,
    text: 'Limited drops — while supplies last',
  },
  {
    icon: CalendarDays,
    text: 'New releases every Friday',
  },
  {
    icon: Crown,
    text: 'Members get exclusive early access',
  },
] as const;

/** Milliseconds between message rotations. */
const ROTATION_MS = 4000;

/**
 * Dismissible rotating announcement bar pinned to the top of the viewport.
 *
 * Renders nothing when dismissed (persisted via localStorage). The bar
 * lives above the Navbar: both the header and the Navbar spacer are
 * offset down by `ANNOUNCEMENT_HEIGHT` while the bar is visible.
 *
 * ── Animation ──────────────────────────────────────────
 * Messages cross-fade every 4 s with a quick opacity + slight Y shift.
 * Reduced-motion users see a single static message (no rotation interval,
 * opacity-only AnimatePresence transition).
 *
 * ── Accessibility ──────────────────────────────────────
 * The bar is labelled `"Announcements"` and the dismiss button is
 * keyboard-accessible. Rotating text is deliberately not aria-live
 * to avoid repeated SR announcements.
 */
export function AnnouncementBar() {
  const isDismissed = useAnnouncementStore(s => s.isDismissed);
  const dismiss = useAnnouncementStore(s => s.dismiss);
  const shopifyConfigured = isShopifyConfigured();
  const messages = shopifyConfigured
    ? MESSAGES
    : MESSAGES.map((message, messageIndex) =>
        messageIndex === 0
          ? {
              ...message,
              text: `Demo shipping preview over ${formatPrice(1000, 'INR')}`,
            }
          : message
      );
  const [index, setIndex] = useState(0);
  // Reduced-motion users see a single static message (see doc comment).
  const [reducedMotion, setReducedMotion] = useState(false);

  // Track the OS reduced-motion preference.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Rotation interval (skipped for reduced-motion users) ─
  useEffect(() => {
    if (isDismissed || reducedMotion) return;
    const id = setInterval(
      () => setIndex(i => (i + 1) % messages.length),
      ROTATION_MS
    );
    return () => clearInterval(id);
  }, [isDismissed, reducedMotion, messages.length]);

  if (isDismissed) return null;

  const { icon: Icon, text } = messages[index % messages.length];

  return (
    <div
      role="region"
      aria-label="Announcements"
      className="fixed top-0 left-0 right-0 z-50 h-9 border-b border-white/[0.06] bg-surface/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* ── Rotating message ──────────────────────────────── */}
        <div className="relative flex-1 text-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={index}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 text-xs font-bold tracking-wide text-white/90 sm:text-[13px]"
            >
              <Icon
                className="h-3.5 w-3.5 text-accent shrink-0"
                aria-hidden="true"
              />
              <span>{text}</span>
            </motion.span>
          </AnimatePresence>
        </div>

        {/* ── Dismiss button ────────────────────────────────── */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute right-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
