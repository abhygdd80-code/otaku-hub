'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useWishlistStore } from '@/store';
import { cn } from '@/utils/cn';
import { createWishlistBurst } from '@/animations/gsap/wishlist';

// ─── Size map ──────────────────────────────────────────────────────

const SIZE_CLASSES = {
  sm: { button: 'w-10 h-10', icon: 'w-4 h-4' },
  md: { button: 'w-10 h-10', icon: 'w-4 h-4' },
  lg: { button: 'w-12 h-12', icon: 'w-5 h-5' },
  xl: { button: 'w-14 h-14', icon: 'w-6 h-6' },
} as const;

// ─── Props ─────────────────────────────────────────────────────────

interface WishlistButtonProps {
  /** Product handle used as the unique identifier */
  productHandle: string;
  className?: string;
  size?: keyof typeof SIZE_CLASSES;
  /** When true, shows a label next to the icon */
  showLabel?: boolean;
  /** Product name used in the aria-label */
  productName?: string;
  /** Optional callback fired after toggling */
  onToggle?: (isWishlisted: boolean) => void;
}

// ─── Component ─────────────────────────────────────────────────────

/**
 * Animated heart-shaped wishlist toggle button.
 *
 * States:
 * - Default: outline heart (secondary color)
 * - Active: filled heart (accent color + glow)
 *
 * Animations:
 * - Framer Motion hover/tap: scale 1.1 / 0.85 (spring)
 * - GSAP burst: accent particles fire outward when an item is saved
 *   (skipped under `prefers-reduced-motion`)
 *
 * Notifications (sonner):
 * - Add: success toast with a "View" action linking to /wishlist
 * - Remove: neutral toast with an "Undo" action that re-saves the item
 *
 * Accessibility:
 * - `aria-pressed` reflects the toggle state
 * - Dynamic `aria-label` conveys current state + product name
 * - Keyboard focusable with visible ring
 */
export function WishlistButton({
  productHandle,
  className,
  size = 'md',
  showLabel = false,
  productName,
  onToggle,
}: WishlistButtonProps) {
  // Gate the rendered state on mount so the server HTML (always unfilled)
  // matches the client's first render. Zustand persist hydrates
  // synchronously, so the store already holds the correct state — but the
  // server had an empty store. Without this gate React 18 would log a
  // hydration mismatch warning on pages with wishlisted products for
  // returning users.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isWishlistedFromStore = useWishlistStore(s =>
    s.isWishlisted(productHandle)
  );
  const isWishlisted = mounted && isWishlistedFromStore;
  const toggleItem = useWishlistStore(s => s.toggleItem);
  const addItem = useWishlistStore(s => s.addItem);
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const next = !isWishlisted;
      toggleItem(productHandle);
      onToggle?.(next);

      if (next) {
        // Heart burst + confirmation
        if (buttonRef.current) createWishlistBurst(buttonRef.current);
        toast.success(`${productName || 'Item'} saved to wishlist`, {
          description: "Stored in your Collector's Archive.",
          action: {
            label: 'View',
            onClick: () => router.push('/wishlist'),
          },
        });
      } else {
        toast(`${productName || 'Item'} removed from wishlist`, {
          description: 'Your saved list was updated.',
          action: {
            label: 'Undo',
            onClick: () => addItem(productHandle),
          },
        });
      }
    },
    [
      productHandle,
      toggleItem,
      isWishlisted,
      onToggle,
      productName,
      router,
      addItem,
    ]
  );

  const sizeClasses = SIZE_CLASSES[size];

  const label = isWishlisted
    ? `Remove ${productName || 'item'} from wishlist`
    : `Add ${productName || 'item'} to wishlist`;

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={cn(
        'relative flex items-center justify-center rounded-full transition-colors duration-200',
        isWishlisted ? 'text-accent' : 'text-zinc-500 hover:text-accent',
        sizeClasses.button,
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      aria-label={label}
      aria-pressed={isWishlisted}
    >
      <Heart
        className={cn(
          'transition-all duration-200',
          sizeClasses.icon,
          isWishlisted && 'fill-accent'
        )}
        aria-hidden="true"
      />
      {showLabel && (
        <span
          className={cn(
            'ml-2 text-sm font-semibold',
            isWishlisted ? 'text-accent' : 'text-foreground'
          )}
        >
          {isWishlisted ? 'Saved' : 'Save'}
        </span>
      )}
    </motion.button>
  );
}
