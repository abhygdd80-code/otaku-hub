'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface SizeSelectorProps {
  /** Available size options (e.g. ['S', 'M', 'L', 'XL']) */
  sizes: string[];
  /** Called with the selected size string */
  onChange: (size: string) => void;
  /** Optional elements rendered on the header row (e.g. Size Guide link) */
  headerExtras?: ReactNode;
  className?: string;
}

/**
 * Size picker — accent-highlighted active state, spring animation.
 */
export function SizeSelector({
  sizes,
  onChange,
  headerExtras,
  className,
}: SizeSelectorProps) {
  const [selected, setSelected] = useState(sizes[0] ?? '');

  const handleSelect = useCallback(
    (size: string) => {
      setSelected(size);
      onChange(size);
    },
    [onChange]
  );

  if (!sizes.length) return null;

  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Size — <span className="text-white">{selected}</span>
        </p>
        {headerExtras}
      </div>

      <div className="flex flex-wrap gap-2">
        {sizes.map(size => {
          const active = selected === size;
          return (
            <motion.button
              key={size}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(size)}
              className={cn(
                'relative px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider',
                'transition-all duration-200',
                'border',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                active
                  ? 'bg-accent/15 border-accent text-accent shadow-[0_0_12px_rgba(229,9,20,0.2)]'
                  : 'bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:border-white/20 hover:text-white'
              )}
              aria-pressed={active}
              aria-label={`Size ${size}`}
            >
              {size}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
