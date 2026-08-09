'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Scale } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useCompareStore } from '@/store';
import { Z_INDEX } from '@/constants';

export interface CompareButtonProps {
  className?: string;
}

/**
 * Sticky floating compare bar.
 *
 * Slides up from the bottom once at least two products are queued, shows
 * the running count, and opens the comparison drawer on click. Hidden
 * while the drawer is open so it never floats above the backdrop.
 */
export function CompareButton({ className }: CompareButtonProps) {
  const items = useCompareStore(s => s.items);
  const isLoaded = useCompareStore(s => s.isLoaded);
  const isOpen = useCompareStore(s => s.isOpen);
  const setIsOpen = useCompareStore(s => s.setIsOpen);

  const visible = isLoaded && items.length >= 2 && !isOpen;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className={cn(
            'fixed inset-x-0 bottom-4 sm:bottom-6 z-[55] flex justify-center px-4 pointer-events-none',
            className
          )}
        >
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={cn(
              'pointer-events-auto inline-flex items-center gap-3',
              'rounded-full border border-accent/40 bg-background/90 py-3 pl-4 pr-5',
              'shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl',
              'transition-colors hover:border-accent/70 hover:bg-accent/10',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
            )}
            style={{ zIndex: Z_INDEX.navbarDropdown }}
            aria-label={`Compare ${items.length} products`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
              <Scale className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="text-sm font-bold uppercase tracking-wider text-white">
              Compare{' '}
              <span className="text-accent tabular-nums">{items.length}</span>{' '}
              products
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
