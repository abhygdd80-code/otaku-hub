'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { useCompareStore, MAX_COMPARE_ITEMS } from '@/store';

export interface CompareToggleProps {
  /** Product handle used as the unique identifier */
  productHandle: string;
  /** Product name used in aria-label + toasts */
  productName: string;
  size?: 'sm' | 'md';
  className?: string;
}

const SIZE_CLASSES = {
  sm: { button: 'w-10 h-10', icon: 'w-4 h-4' },
  md: { button: 'w-10 h-10', icon: 'w-4 h-4' },
} as const;

/**
 * Scale-icon toggle that queues a product for comparison.
 *
 * Sits alongside the wishlist button on product card hover overlays.
 * Active state is reflected via `aria-pressed`, an accent fill, and
 * toasts that keep the user aware of the 4-product cap.
 */
export function CompareToggle({
  productHandle,
  productName,
  size = 'md',
  className,
}: CompareToggleProps) {
  const items = useCompareStore(s => s.items);
  const toggleItem = useCompareStore(s => s.toggleItem);
  const isCompared = items.includes(productHandle);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const adding = !isCompared;
      toggleItem(productHandle);

      if (adding) {
        if (items.length >= MAX_COMPARE_ITEMS) {
          toast.info(`${productName} added to compare`, {
            description: `Limit of ${MAX_COMPARE_ITEMS} reached — oldest selection replaced.`,
          });
        } else {
          toast.success(`${productName} added to compare`, {
            description: `${Math.min(items.length + 1, MAX_COMPARE_ITEMS)} of ${MAX_COMPARE_ITEMS} selected.`,
          });
        }
      } else {
        toast(`${productName} removed from compare`);
      }
    },
    [productHandle, productName, toggleItem, isCompared, items.length]
  );

  const sizeClasses = SIZE_CLASSES[size];

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={cn(
        'relative flex items-center justify-center rounded-full transition-colors duration-200',
        isCompared
          ? 'bg-accent/15 text-accent ring-1 ring-accent/50'
          : 'text-zinc-500 hover:text-accent',
        sizeClasses.button,
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      aria-label={
        isCompared
          ? `Remove ${productName} from compare`
          : `Add ${productName} to compare`
      }
      aria-pressed={isCompared}
    >
      <Scale className={cn(sizeClasses.icon)} aria-hidden="true" />
    </motion.button>
  );
}
