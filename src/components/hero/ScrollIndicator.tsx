'use client';

import { ChevronDown } from 'lucide-react';
import { useLenis } from '@/hooks/useLenis';
import { cn } from '@/utils/cn';

export interface ScrollIndicatorProps {
  targetSelector?: string;
  className?: string;
}

/**
 * Animated scroll-down indicator at the bottom of the hero.
 * Smooth-scrolls to the next section on click using Lenis.
 */
export function ScrollIndicator({
  targetSelector = '#category-slider',
  className,
}: ScrollIndicatorProps) {
  const lenis = useLenis();

  const handleClick = () => {
    if (lenis) {
      lenis.scrollTo(targetSelector, { duration: 1.2 });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'absolute bottom-6 left-1/2 -translate-x-1/2 z-20',
        'flex flex-col items-center gap-1.5',
        'text-zinc-500 hover:text-white transition-colors duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg',
        className
      )}
      aria-label="Scroll down to next section"
    >
      <span className="text-[10px] uppercase tracking-[0.2em] font-medium">
        Scroll
      </span>
      <ChevronDown
        className="w-4 h-4 text-accent animate-bounce"
        aria-hidden="true"
      />
    </button>
  );
}
