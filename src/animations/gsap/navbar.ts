'use client';

import { gsap, ScrollTrigger } from '@/lib/gsap';
import { DURATION } from '@/constants';

/**
 * Creates the scroll-driven navbar animation.
 *
 * @param navbarRef - The sticky header element
 * @param logoRef   - The logo element inside the navbar
 * @returns A GSAP MediaQuery instance for cleanup
 */
export function createNavbarScrollAnimation(
  navbarRef: HTMLElement | null,
  logoRef: HTMLElement | null
) {
  if (!navbarRef || !logoRef) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 768px)', () => {
    // Desktop: shrink logo + add backdrop blur on scroll
    const tl = gsap
      .timeline({ paused: true })
      .to(navbarRef, {
        backgroundColor: 'rgba(5, 5, 5, 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottomColor: 'rgba(34, 34, 34, 0.8)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
        duration: DURATION.normal,
        ease: 'power2.out',
      })
      .to(
        logoRef,
        {
          scale: 0.92,
          duration: DURATION.normal,
          ease: 'power2.out',
        },
        0
      );

    // Drive timeline progress from scroll
    ScrollTrigger.create({
      start: 'top -15px',
      end: 'top -80px',
      onUpdate: self => {
        tl.progress(self.progress);
      },
    });
  });

  mm.add('(max-width: 767px)', () => {
    // Mobile: simpler blur transition
    ScrollTrigger.create({
      start: 'top -1px',
      onEnter: () => {
        gsap.to(navbarRef, {
          backgroundColor: 'rgba(5, 5, 5, 0.9)',
          backdropFilter: 'blur(16px) saturate(180%)',
          borderBottomColor: 'rgba(34, 34, 34, 0.8)',
          duration: 0.15,
          ease: 'power2.out',
        });
      },
      onLeaveBack: () => {
        gsap.to(navbarRef, {
          backgroundColor: 'transparent',
          backdropFilter: 'blur(0px)',
          borderBottomColor: 'transparent',
          duration: 0.15,
          ease: 'power2.out',
        });
      },
    });
  });

  return mm;
}

/**
 * Logo entrance animation on page load.
 * Fades in and slides down from slightly above.
 */
export function createLogoEntrance(logoRef: HTMLElement | null) {
  if (!logoRef) return;

  return gsap.from(logoRef, {
    y: -12,
    opacity: 0,
    duration: DURATION.slower,
    ease: 'power3.out',
    delay: 0.1,
  });
}

/**
 * Subtle floating animation for the logo accent dot.
 */
export function createDotFloat(dotRef: HTMLElement | null) {
  if (!dotRef) return;

  return gsap.to(dotRef, {
    y: -4,
    duration: 2.5,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
  });
}
