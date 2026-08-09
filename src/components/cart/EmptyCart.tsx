'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { useCartDrawer } from './CartDrawerContext';
import { cn } from '@/utils/cn';

interface EmptyCartProps {
  onContinue: () => void;
}

const GRADIENT_PLACEHOLDERS = [
  {
    gradient: 'from-rose-900/40 via-purple-900/30 to-background',
    name: 'Shadow Realm Hoodie',
    category: 'Premium Hoodie',
    price: '$98',
  },
  {
    gradient: 'from-accent/20 via-orange-900/30 to-background',
    name: 'Neo Tokyo Oversized Tee',
    category: 'Graphic Tee',
    price: '$68',
  },
  {
    gradient: 'from-indigo-900/40 via-violet-900/30 to-background',
    name: 'Spirit Guardian Figure',
    category: 'Collector Figure',
    price: '$248',
  },
] as const;

/**
 * Animated empty cart state with gradient placeholder recommendations.
 *
 * Shown inside the cart drawer when the cart has no items.
 * Includes a premium illustration area and suggested products
 * to encourage browsing.
 */
export function EmptyCart({ onContinue }: EmptyCartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center py-8 text-center"
    >
      {/* Icon */}
      <div className="relative mb-8">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-accent/20 bg-accent/10">
          {/* Floating bag */}
          <motion.span
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center justify-center"
          >
            <ShoppingBag className="h-8 w-8 text-accent" aria-hidden="true" />
          </motion.span>
          {/* Glow */}
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
        <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent/20">
          <Sparkles className="h-3 w-3 text-accent" aria-hidden="true" />
        </div>
      </div>

      {/* Text */}
      <h3 className="mb-2 font-display text-2xl font-bold text-white">
        Your cart is empty
      </h3>
      <p className="mb-10 max-w-xs text-sm leading-relaxed text-zinc-500">
        Discover exclusive anime-inspired streetwear. Start your collection with
        our limited edition drops.
      </p>

      {/* Recommendations */}
      <div className="mb-8 w-full space-y-3">
        <p className="text-left text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
          You might like
        </p>
        {GRADIENT_PLACEHOLDERS.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
            className={cn(
              'flex items-center gap-3 rounded-xl p-3',
              'bg-white/[0.03] border border-white/[0.06]'
            )}
          >
            {/* Gradient thumbnail */}
            <div
              className={cn(
                'h-14 w-14 shrink-0 rounded-lg',
                'bg-gradient-to-br',
                item.gradient
              )}
            />
            {/* Details */}
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-white">
                {item.name}
              </p>
              <p className="text-[11px] text-zinc-500">{item.category}</p>
            </div>
            <span className="text-sm font-bold text-zinc-300">
              {item.price}
            </span>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onContinue}
        className={cn(
          'w-full rounded-xl px-6 py-3.5',
          'bg-accent text-sm font-bold uppercase tracking-wider text-white',
          'transition-all duration-300',
          'hover:shadow-[0_0_30px_rgba(229,9,20,0.4)]',
          'hover:-translate-y-0.5 active:translate-y-0',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
        )}
      >
        Continue Shopping
      </button>
    </motion.div>
  );
}
