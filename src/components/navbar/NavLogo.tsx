'use client';

import { forwardRef, useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';
import { createLogoEntrance, createDotFloat } from '@/animations/gsap/navbar';

interface NavLogoProps {
  /** Optional class name override */
  className?: string;
}

/**
 * Animated OtakuSaga brand logo.
 * - GSAP entrance: slides down and fades in on mount
 * - Accent dot has a subtle floating animation
 * - Scales down slightly when the navbar is scrolled (controlled by parent)
 *
 * Ref is forwarded to the parent for GSAP scroll animation coordination.
 */
export const NavLogo = forwardRef<HTMLAnchorElement, NavLogoProps>(
  function NavLogo({ className }, ref) {
    const dotRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      const link = typeof ref === 'function' ? null : ref?.current;
      const dot = dotRef.current;
      if (!link && !dot) return;

      const ctx = gsap.context(() => {
        if (link) createLogoEntrance(link);
        if (dot) createDotFloat(dot);
      });

      return () => ctx.revert();
    }, [ref]);

    return (
      <Link
        ref={ref}
        href="/"
        className={`relative flex items-center gap-1.5 sm:gap-2 shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className ?? ''}`}
        aria-label="OtakuSaga — Home"
      >
        {/* Accent dot */}
        <span
          ref={dotRef}
          className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(229,9,20,0.6)]"
          aria-hidden="true"
        />

        {/* Logotype */}
        <span className="font-display text-xl sm:text-2xl font-bold tracking-tight select-none">
          <span className="text-accent">OTAKU</span>
          <span className="text-white">SAGA</span>
        </span>
      </Link>
    );
  }
);
