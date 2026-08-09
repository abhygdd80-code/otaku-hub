'use client';

import { gsap } from '@/lib/gsap';
import { DURATION } from '@/constants';

// ─── Wishlist heart burst ────────────────────────────────────────

const BURST_PARTICLE_COUNT = 8;

/**
 * Fires a small burst of accent particles from the centre of a
 * wishlist button when an item is saved.
 *
 * Particles are appended to the button (absolutely positioned at its
 * centre) and removed when the animation completes.
 * Skips entirely when the user prefers reduced motion.
 */
export function createWishlistBurst(button: HTMLElement): void {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const particles: HTMLSpanElement[] = [];

  for (let i = 0; i < BURST_PARTICLE_COUNT; i++) {
    const el = document.createElement('span');
    el.setAttribute('aria-hidden', 'true');
    el.className =
      'pointer-events-none absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-accent';
    button.appendChild(el);
    particles.push(el);
  }

  const angleStep = (Math.PI * 2) / BURST_PARTICLE_COUNT;

  gsap.fromTo(
    particles,
    { scale: 0, opacity: 1, x: 0, y: 0 },
    {
      scale: 1,
      opacity: 0,
      x: i => Math.cos(angleStep * i) * (18 + (i % 3) * 6),
      y: i => Math.sin(angleStep * i) * (18 + (i % 3) * 6),
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.02,
      onComplete: () => particles.forEach(p => p.remove()),
    }
  );
}

// ─── Wishlist page entrance ──────────────────────────────────────

/**
 * Staggered entrance for the wishlist page header.
 *
 * Animates any `[data-wishlist-reveal]` children of `container`.
 * The container itself is expected to start with `opacity: 0` (inline
 * style) so nothing flashes before the effect runs — this timeline
 * restores it to visible as its first step.
 */
export function createWishlistPageEntrance(container: HTMLElement) {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.set(container, { autoAlpha: 1 }).from('[data-wishlist-reveal]', {
    autoAlpha: 0,
    y: 24,
    duration: DURATION.slower,
    stagger: 0.1,
  });

  return tl;
}
