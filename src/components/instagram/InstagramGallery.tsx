'use client';

import { useRef, useState, useEffect } from 'react';
import { Camera, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/utils/cn';

export interface InstagramGalleryProps {
  className?: string;
}

interface GalleryPost {
  gradient: string;
  likes: string;
  comments: string;
  tag: string;
}

const GALLERY_POSTS: GalleryPost[] = [
  {
    gradient:
      'bg-gradient-to-br from-accent/25 via-purple-800/40 to-background',
    likes: '2.4k',
    comments: '184',
    tag: '@otakusaga',
  },
  {
    gradient:
      'bg-gradient-to-br from-cyan-800/35 via-blue-900/30 to-background',
    likes: '4.1k',
    comments: '312',
    tag: '#OtakuStreetwear',
  },
  {
    gradient:
      'bg-gradient-to-br from-amber-700/35 via-red-900/40 to-background',
    likes: '1.9k',
    comments: '95',
    tag: '#AnimeStyle',
  },
  {
    gradient: 'bg-gradient-to-br from-accent/30 via-rose-800/35 to-background',
    likes: '5.8k',
    comments: '420',
    tag: '#CyberpunkTokyo',
  },
  {
    gradient:
      'bg-gradient-to-br from-zinc-600/40 via-stone-800/35 to-background',
    likes: '3.2k',
    comments: '201',
    tag: '#StreetwearFashion',
  },
  {
    gradient:
      'bg-gradient-to-br from-emerald-800/30 via-teal-900/30 to-background',
    likes: '6.7k',
    comments: '510',
    tag: '#AnimeArt',
  },
];

/**
 * Grid spans for the masonry layout.
 * Cards 1 & 3 are tall (2 rows), card 5 is wide (2 cols) on desktop.
 * On mobile all cards flow as a simple 2-column grid.
 */
const GRID_SPANS = [
  'lg:row-span-2',
  '',
  'lg:row-span-2',
  '',
  'lg:col-span-2',
  '',
];

/**
 * Instagram social-proof gallery section.
 *
 * ── Layout ─────────────────────────────────────────────
 * Desktop: 3-column editorial grid with varying heights
 * (masonry feel).  Mobile: simple 2-column grid.
 * Footer CTA links to Instagram.
 *
 * ── Animations (GSAP + ScrollTrigger, top 80%) ───────
 * • Header items — fade up with stagger.
 * • Gallery cards — scale 0.95→1 + opacity stagger.
 *
 * ── Hover interactions ────────────────────────────────
 * • Gradient background scales 110 %.
 * • Dim overlay with Instagram icon, like/comment counts,
 *   and hashtag fades in.
 * • Icon has a subtle bounce animation.
 */
export function InstagramGallery({ className }: InstagramGalleryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // ── Reduced motion ──────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── GSAP animations ─────────────────────────────────
  useGSAP(
    () => {
      if (reducedMotion) return;
      const section = sectionRef.current;
      if (!section) return;

      const ctx = gsap.context(() => {
        const scrollTrigger = {
          trigger: section,
          start: 'top 80%' as const,
          toggleActions: 'play none none none' as const,
        };

        // 1. Header stagger
        gsap.from('[data-ig-header]', {
          scrollTrigger,
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
        });

        // 2. Card stagger
        gsap.from('[data-ig-card]', {
          scrollTrigger,
          scale: 0.95,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
        });
      }, section);

      return () => ctx.revert();
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  );

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative py-24 sm:py-32 bg-background overflow-hidden',
        className
      )}
    >
      {/* ── Background grid ───────────────────────────── */}
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      {/* Top-edge accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* ── Header ──────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3">
            <p
              data-ig-header
              className="text-xs font-bold text-accent tracking-[0.25em] uppercase"
            >
              Community
            </p>
            <h2
              data-ig-header
              className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.1]"
            >
              Follow the <span className="text-accent">OtakuSaga</span> World
            </h2>
          </div>
          <p
            data-ig-header
            className="text-sm sm:text-base text-zinc-400 max-w-sm leading-relaxed"
          >
            See how the community styles their favorite drops.
          </p>
        </div>
      </div>

      {/* ── Gallery grid (masonry layout) ───────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 auto-rows-[200px] sm:auto-rows-[220px] lg:auto-rows-[240px]">
          {GALLERY_POSTS.map((post, i) => (
            <a
              key={post.tag}
              data-ig-card
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'group relative overflow-hidden rounded-2xl',
                'border border-white/[0.06] hover:border-accent/40',
                'bg-surface',
                'transition-all duration-500 ease-out',
                'hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                GRID_SPANS[i],
                GRID_SPANS[i].includes('row-span-2')
                  ? 'lg:row-span-2'
                  : GRID_SPANS[i].includes('col-span-2')
                    ? 'lg:col-span-2'
                    : ''
              )}
              aria-label={`Instagram post by ${post.tag}`}
            >
              {/* ── Gradient placeholder ─────────────── */}
              <div
                className={cn(
                  'absolute inset-0 transition-transform duration-700 ease-out',
                  'group-hover:scale-110',
                  post.gradient
                )}
              />

              {/* Noise texture */}
              <div className="texture-noise absolute inset-0 opacity-[0.04] mix-blend-overlay" />

              {/* ── Vignette gradient ──────────────── */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/10" />

              {/* ── Hover overlay ──────────────────────── */}
              <div
                className={cn(
                  'absolute inset-0 z-10',
                  'bg-black/50 backdrop-blur-[2px]',
                  'opacity-0 group-hover:opacity-100',
                  'transition-opacity duration-300',
                  'flex flex-col items-center justify-center gap-3 p-4 text-center'
                )}
              >
                <Camera
                  className={cn(
                    'w-7 h-7 sm:w-8 sm:h-8 text-white',
                    'transition-all duration-300',
                    'group-hover:scale-110 group-hover:text-accent'
                  )}
                />
                <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-widest">
                  {post.tag}
                </span>
                <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-bold">
                  <span className="flex items-center gap-1 text-white/80">
                    <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent fill-accent" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1 text-white/80">
                    <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/60" />
                    {post.comments}
                  </span>
                </div>
              </div>

              {/* ── Bottom tag (always visible) ─────────── */}
              <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 z-10">
                <span
                  className={cn(
                    'inline-block px-2 py-0.5 rounded',
                    'text-[9px] sm:text-[10px] font-bold uppercase tracking-wider',
                    'bg-black/50 backdrop-blur-sm text-white/70',
                    'transition-opacity duration-300 group-hover:opacity-0'
                  )}
                >
                  {post.tag}
                </span>
              </div>

              {/* ── Glass edge ring ──────────────────────── */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.04] pointer-events-none" />
            </a>
          ))}
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────── */}
      <div className="relative z-10 mt-12 sm:mt-16 text-center">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'group relative inline-flex items-center gap-2.5',
            'px-8 py-3.5 rounded-xl',
            'border border-zinc-700 hover:border-accent/50',
            'bg-white/5 backdrop-blur-sm',
            'text-white font-semibold text-sm tracking-wider uppercase',
            'transition-all duration-300',
            'hover:bg-white/10 hover:-translate-y-0.5',
            'active:translate-y-0',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          )}
          aria-label="Follow OtakuSaga on Instagram"
        >
          <Camera className="w-4 h-4 text-accent" />
          <span>Follow @otakusaga</span>
          <ArrowRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}
