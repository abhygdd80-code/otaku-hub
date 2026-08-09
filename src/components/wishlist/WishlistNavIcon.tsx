'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/store';
import { cn } from '@/utils/cn';

interface WishlistNavIconProps {
  className?: string;
}

/**
 * Wishlist icon rendered in the navbar.
 *
 * Follows the same pattern as CartButton:
 * - Heart icon linked to /wishlist
 * - Animated badge count via Framer Motion AnimatePresence
 * - Clamps displayed count at "99+"
 * - No badge when the wishlist is empty
 *
 * The wishlist store persists to localStorage and rehydrates synchronously
 * during store creation, so the persisted count is not available during SSR.
 * Gate the badge on `mounted` to avoid a hydration mismatch.
 */
export function WishlistNavIcon({ className }: WishlistNavIconProps) {
  const count = useWishlistStore(s => s.items.length);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visibleCount = mounted ? count : 0;
  const displayCount = visibleCount > 99 ? '99+' : String(visibleCount);

  const label =
    visibleCount > 0
      ? `Wishlist, ${visibleCount} item${visibleCount === 1 ? '' : 's'}`
      : 'Wishlist (empty)';

  return (
    <Link
      href="/wishlist"
      className={cn(
        'relative flex items-center justify-center w-10 h-10 rounded-full',
        'text-zinc-400 hover:text-white hover:bg-white/5',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      aria-label={label}
    >
      <Heart className="w-[18px] h-[18px]" aria-hidden="true" />
      <AnimatePresence mode="popLayout">
        {visibleCount > 0 && (
          <motion.span
            key={displayCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 20,
              mass: 0.5,
            }}
            className="absolute -top-1 -right-1 flex h-4 w-4 min-w-[16px] items-center justify-center rounded-full bg-accent text-[10px] font-bold leading-none text-white border-2 border-background select-none pointer-events-none"
            aria-hidden="true"
          >
            {displayCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
