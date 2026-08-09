'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * Background atmosphere for the Hero section.
 * Composed of layered radial gradients, a noise texture overlay,
 * and slow-moving light beams — all CSS-driven for GPU performance.
 */
export function HeroBackground() {
  const beamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const beam = beamRef.current;
    if (!beam) return;

    const ctx = gsap.context(() => {
      gsap.to(beam, {
        x: 60,
        y: -30,
        duration: 12,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Base dark backdrop */}
      <div className="absolute inset-0 bg-background" />

      {/* Primary radial glow — top right */}
      <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(229,9,20,0.2)_0%,transparent_70%)]" />

      {/* Secondary radial glow — bottom left */}
      <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(229,9,20,0.1)_0%,transparent_70%)]" />

      {/* Ambient purple-blue glow — center right */}
      <div className="absolute top-[40%] right-[5%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)]" />

      {/* Moving light beam */}
      <div
        ref={beamRef}
        className="absolute top-[20%] -left-[10%] w-[40%] h-[1px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(229,9,20,0.15) 50%, transparent 100%)',
          filter: 'blur(20px)',
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
        }}
      />

      {/* Noise texture overlay — ultra-light SVG grain */}
      <div className="texture-noise absolute inset-0 opacity-[0.035] mix-blend-overlay" />

      {/* Bottom vignette */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </div>
  );
}
