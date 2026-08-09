'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export interface FloatingCardsProps {
  mouseX: number;
  mouseY: number;
}

interface CardData {
  title: string;
  subtitle: string;
  gradient: string;
  position: {
    top: string;
    left?: string;
    right?: string;
  };
}

const cards: CardData[] = [
  {
    title: '$128',
    subtitle: 'Cyber Oni Hoodie',
    gradient: 'from-accent/20 to-purple-500/10',
    position: { top: '10%', left: '-15%' },
  },
  {
    title: '$65',
    subtitle: 'Ghost Shell Tee',
    gradient: 'from-blue-500/20 to-cyan-500/10',
    position: { top: '65%', left: '-12%' },
  },
  {
    title: '$245',
    subtitle: 'Valkyrie Statue',
    gradient: 'from-amber-500/20 to-red-500/10',
    position: { top: '15%', right: '-18%' },
  },
  {
    title: 'LIMITED',
    subtitle: '500 Pieces',
    gradient: 'from-accent/20 to-rose-500/10',
    position: { top: '70%', right: '-15%' },
  },
];

/**
 * Floating product cards rendered around the hero artwork.
 * - GSAP continuous float loop with unique offsets per card
 * - Mouse parallax translation applied via inline transform
 * - Glassmorphic styling
 * - GPU-accelerated via translate3d and will-change
 */
export function FloatingCards({ mouseX, mouseY }: FloatingCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const els = container.querySelectorAll('[data-float-card]');
      els.forEach((el, i) => {
        gsap.to(el, {
          y: () => gsap.utils.random(-8, -16),
          x: () => gsap.utils.random(-6, 6),
          rotate: () => gsap.utils.random(-3, 3),
          duration: () => gsap.utils.random(3.5, 5.5),
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.4,
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-10 pointer-events-none"
      aria-hidden="true"
    >
      {cards.map((card, i) => {
        const parallaxX = mouseX * (15 + i * 5);
        const parallaxY = mouseY * (15 + i * 5);

        return (
          <div
            key={i}
            data-float-card
            className="absolute w-[120px] sm:w-[140px]"
            style={{
              top: card.position.top,
              left: card.position.left,
              right: card.position.right,
              transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
              willChange: 'transform',
            }}
          >
            <div
              className={`
                rounded-xl border border-white/10 bg-white/5
                backdrop-blur-xl p-3
                bg-gradient-to-br ${card.gradient}
                shadow-[0_8px_32px_rgba(0,0,0,0.4)]
              `}
            >
              <p className="text-xs sm:text-sm font-bold text-white tracking-tight">
                {card.title}
              </p>
              <p className="text-[9px] sm:text-[10px] text-zinc-400 mt-0.5 font-medium">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
