'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft, Sparkles } from 'lucide-react';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import { staggerContainer, fadeInUp } from '@/animations/framer/variants';
import { ROUTES } from '@/constants';

/**
 * Premium empty state for the wishlist page.
 *
 * Shown when the user has no saved items. A floating heart with an
 * animated ping ring, staggered entrance, and a dual CTA pair guide
 * the user toward shopping.
 */
export function WishlistEmptyState() {
  return (
    <Section className="bg-background min-h-[60vh] py-24">
      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto flex max-w-md flex-col items-center text-center"
        >
          {/* ── Icon ───────────────────────────────────────── */}
          <motion.div variants={fadeInUp} className="relative mb-8">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-accent/20 bg-accent/10">
              {/* Floating heart */}
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="flex items-center justify-center"
              >
                <Heart className="h-10 w-10 text-accent" aria-hidden="true" />
              </motion.span>
              {/* Soft glow */}
              <div
                className="absolute -inset-4 rounded-full bg-accent/5 blur-xl"
                aria-hidden="true"
              />
            </div>
            {/* Animated ring */}
            <span
              className="absolute inset-0 animate-ping rounded-full border border-accent/10"
              aria-hidden="true"
            />
            {/* Sparkle badge */}
            <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent/20">
              <Sparkles
                className="h-3.5 w-3.5 text-accent"
                aria-hidden="true"
              />
            </div>
          </motion.div>

          {/* ── Message ────────────────────────────────────── */}
          <motion.div variants={fadeInUp}>
            <h2 className="mb-3 font-display text-2xl font-bold text-primary">
              Your wishlist is empty
            </h2>
            <p className="mb-10 text-sm leading-relaxed text-muted-foreground">
              Save your favorite products by tapping the heart icon.
              They&apos;ll appear here so you can easily find them later.
            </p>
          </motion.div>

          {/* ── CTAs ───────────────────────────────────────── */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href={ROUTES.shop}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-[0_0_30px_rgba(229,9,20,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Continue Shopping
            </Link>
            <Link
              href={ROUTES.newArrivals}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-8 py-3.5 text-sm font-semibold text-zinc-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
              View New Drops
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </Section>
  );
}
