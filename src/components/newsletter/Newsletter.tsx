'use client';

import { useRef, useState, useEffect } from 'react';
import { Mail, ShieldCheck } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/utils/cn';
import { useNewsletterSubscription } from '@/hooks/useNewsletterSubscription';

export interface NewsletterProps {
  className?: string;
}

interface StatItem {
  /** Numeric value to count up to, or null for a static display value */
  value: number | null;
  /** Suffix appended after the number (e.g. "+", "K+") */
  suffix: string;
  /** Static display text used when value is null */
  display?: string;
  /** Label shown below the number */
  label: string;
}

const STATS: StatItem[] = [
  { value: 10000, suffix: '+', label: 'Members' },
  { value: 50, suffix: '+', label: 'Drops Released' },
  { value: null, suffix: '', display: '24/7', label: 'Community' },
];

/** Format a counter value the same way the GSAP count-up renders it. */
function formatStatValue(value: number): string {
  return value >= 1000
    ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}`
    : Math.round(value).toString();
}

/**
 * Premium email subscription section.
 *
 * ── Layout ─────────────────────────────────────────────
 * Desktop: two-column — text + stats on the left,
 * glassmorphic form card on the right.
 * Mobile: single column, stacked.
 *
 * ── Animations (GSAP + ScrollTrigger, top 80%) ───────
 * • Header text — fade up with stagger.
 * • Stats block — fade up with stagger.
 * • Numeric stats — count-up animation (0 → target).
 * • Form card — scale 0.95 → 1 with opacity fade.
 * • Button — CSS shine sweep on hover.
 *
 * ── Form behaviour ────────────────────────────────────
 * Basic email validation (contains "@" and ".").
 * On successful submit: disabled state + success toast.
 * POSTs to /api/newsletter, which creates a marketing-accepting
 * Shopify customer when the store is configured (graceful local
 * fallback otherwise).
 */
export function Newsletter({ className }: NewsletterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const {
    email,
    setEmail,
    submitting,
    subscribed: isSubmitted,
    handleSubscribe,
  } = useNewsletterSubscription('homepage');

  // Refs for counter elements (first two stats are numeric)
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);

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
      if (reducedMotion) {
        // Reduced-motion: paint the final counter values statically so users
        // never see the hardcoded "0" initial state (no count-up runs).
        const numericStats = [
          { ref: counterRefs.current[0], target: 10000 },
          { ref: counterRefs.current[1], target: 50 },
        ];
        numericStats.forEach(({ ref, target }) => {
          if (!ref) return;
          ref.textContent = formatStatValue(target);
        });
        return;
      }
      const section = sectionRef.current;
      if (!section) return;

      const ctx = gsap.context(() => {
        const scrollTrigger = {
          trigger: section,
          start: 'top 80%' as const,
          toggleActions: 'play none none none' as const,
        };

        // 1. Header text stagger
        gsap.from('[data-newsletter-header]', {
          scrollTrigger,
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
        });

        // 2. Stats block reveal
        gsap.from('[data-newsletter-stat]', {
          scrollTrigger,
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power3.out',
        });

        // 3. Form card scale + fade
        gsap.from('[data-newsletter-form]', {
          scrollTrigger,
          scale: 0.95,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        });

        // 4. Counter animation for numeric stats
        const numericStats = [
          { ref: counterRefs.current[0], target: 10000 },
          { ref: counterRefs.current[1], target: 50 },
        ];

        numericStats.forEach(({ ref, target }) => {
          if (!ref) return;
          const proxy = { val: 0 };
          gsap.to(proxy, {
            val: target,
            duration: 2.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            onUpdate: () => {
              ref.textContent = formatStatValue(proxy.val);
            },
          });
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
      {/* ── Background elements ───────────────────────── */}
      {/* Subtle dot-grid */}
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      {/* Central ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[40%] rounded-full bg-accent/[0.07] blur-[120px] pointer-events-none" />

      {/* Top-edge accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* ── Content ──────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* ── Left column: text + stats ──────────────────── */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7">
            {/* Label */}
            <p
              data-newsletter-header
              className="text-xs font-bold text-accent tracking-[0.25em] uppercase"
            >
              Join the Community
            </p>

            {/* Heading */}
            <h2
              data-newsletter-header
              className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.1]"
            >
              Get Early Access{' '}
              <span className="text-accent">to Every Drop</span>
            </h2>

            {/* Description */}
            <p
              data-newsletter-header
              className="text-sm sm:text-base lg:text-lg text-zinc-400 leading-relaxed max-w-md"
            >
              Subscribe for exclusive releases, limited collections, and
              OtakuSaga updates.
            </p>

            {/* ── Social proof stats ─────────────────────────── */}
            <div className="pt-8 border-t border-white/[0.06]">
              <div className="grid grid-cols-3 gap-6 sm:gap-8">
                {STATS.map((stat, i) => (
                  <div key={stat.label} data-newsletter-stat>
                    {stat.value !== null ? (
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-0">
                          <span
                            ref={el => {
                              counterRefs.current[i] = el;
                            }}
                            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-white leading-none"
                          >
                            0
                          </span>
                          <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-accent leading-none">
                            {stat.suffix}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-medium">
                          {stat.label}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-white leading-none">
                          {stat.display}
                        </span>
                        <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-medium">
                          {stat.label}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column: glassmorphic form card ──────────── */}
          <div data-newsletter-form className="lg:col-span-5 lg:col-start-8">
            <div
              className={cn(
                'backdrop-blur-xl bg-white/[0.04]',
                'border border-white/[0.08]',
                'rounded-2xl sm:rounded-3xl',
                'p-6 sm:p-8',
                'shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
              )}
            >
              {isSubmitted ? (
                /* ── Success state ───────────────────────────── */
                <div className="flex flex-col items-center text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                    <Mail className="w-7 h-7 text-accent" />
                  </div>
                  <p className="text-lg font-bold text-white">
                    You&apos;re in!
                  </p>
                  <p className="text-sm text-zinc-400 max-w-xs">
                    Early access codes will land in your inbox before every
                    drop.
                  </p>
                </div>
              ) : (
                /* ── Form ──────────────────────────────────────── */
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="newsletter-email"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
                    >
                      Email address
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className={cn(
                        'w-full px-4 py-3.5 rounded-xl',
                        'bg-white/[0.04] border border-white/[0.08]',
                        'text-white placeholder-zinc-500',
                        'text-sm',
                        'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30',
                        'transition-colors duration-300'
                      )}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={cn(
                      'group relative w-full overflow-hidden',
                      'px-6 py-3.5 rounded-xl',
                      'bg-accent text-white',
                      'font-semibold text-sm tracking-wider uppercase',
                      'transition-all duration-300',
                      'hover:shadow-[0_0_30px_rgba(229,9,20,0.4)]',
                      'hover:-translate-y-0.5 active:translate-y-0',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                    )}
                  >
                    {/* Shine sweep */}
                    <span
                      className={cn(
                        'absolute inset-0 -translate-x-full',
                        'bg-gradient-to-r from-transparent via-white/15 to-transparent',
                        'transition-transform duration-700 group-hover:translate-x-full'
                      )}
                    />
                    <span className="relative z-10">
                      {submitting ? 'Subscribing…' : 'Subscribe'}
                    </span>
                  </button>

                  {/* Privacy reassurance */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="text-[11px] text-zinc-500">
                      No spam. Unsubscribe anytime.
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
