'use client';

import { gsap } from '@/lib/gsap';
import { DURATION } from '@/constants';

// ─── Order confirmation entrance ────────────────────────────────────

/**
 * Staggered entrance for the order-confirmed page.
 *
 * Animates any `[data-confirm-reveal]` children of `container`. The
 * container is expected to start with `opacity: 0` (inline style) so
 * nothing flashes before the effect runs — the timeline restores it to
 * visible as its first step. Skips entirely under reduced motion.
 */
export function createOrderConfirmedEntrance(container: HTMLElement) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    container.style.opacity = '1';
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.set(container, { autoAlpha: 1 }).from('[data-confirm-reveal]', {
    autoAlpha: 0,
    y: 24,
    duration: DURATION.slower,
    stagger: 0.1,
  });

  return tl;
}
