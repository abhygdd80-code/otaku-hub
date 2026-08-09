'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

const PARTICLE_COUNT = 8;

/**
 * Animated ambient glow particles that drift slowly through the hero.
 * Uses GSAP for smooth continuous loops with stagger offsets.
 * GPU-accelerated via translate3d and opacity.
 */
export function AmbientGlow() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const particles = container.querySelectorAll('[data-particle]');
      gsap.to(particles, {
        y: () => gsap.utils.random(-30, -60),
        x: () => gsap.utils.random(-20, 20),
        opacity: 0.6,
        duration: 'random(3, 6)',
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.3, from: 'random' },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[1] overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const size =
          i % 3 === 0 ? 'w-1 h-1' : i % 3 === 1 ? 'w-1.5 h-1.5' : 'w-2 h-2';
        const color =
          i % 2 === 0
            ? 'bg-accent/60 shadow-[0_0_6px_rgba(229,9,20,0.4)]'
            : 'bg-white/20 backdrop-blur-[1px]';

        return (
          <span
            key={i}
            data-particle
            className={`absolute rounded-full ${size} ${color}`}
            style={{
              top: `${15 + i * 10}%`,
              left: `${5 + ((i * 17) % 90)}%`,
              transform: 'translate3d(0, 0, 0)',
              willChange: 'transform, opacity',
            }}
          />
        );
      })}
    </div>
  );
}
