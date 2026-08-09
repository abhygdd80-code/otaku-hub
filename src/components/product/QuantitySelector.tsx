'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface QuantitySelectorProps {
  /** Current quantity value */
  value?: number;
  /** Called with the updated quantity */
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

/**
 * Minimal quantity stepper with minus / plus buttons.
 * Used inside the PDP info panel.
 */
export function QuantitySelector({
  value: externalValue,
  onChange,
  min = 1,
  max = 10,
  className,
}: QuantitySelectorProps) {
  const [internalValue, setInternalValue] = useState(externalValue ?? min);

  const value = externalValue ?? internalValue;

  useEffect(() => {
    if (externalValue !== undefined) setInternalValue(externalValue);
  }, [externalValue]);

  const update = useCallback(
    (next: number) => {
      const clamped = Math.max(min, Math.min(max, next));
      if (externalValue === undefined) setInternalValue(clamped);
      onChange?.(clamped);
    },
    [min, max, externalValue, onChange]
  );

  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div className={cn('space-y-2.5', className)}>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Quantity
      </p>

      <div
        className={cn(
          'inline-flex items-center gap-0',
          'rounded-xl border border-white/[0.08] overflow-hidden',
          'bg-white/[0.03]'
        )}
      >
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!canDecrement}
          onClick={() => update(value - 1)}
          className={cn(
            'p-3 text-zinc-400 transition-colors duration-200',
            'hover:text-white hover:bg-white/[0.05]',
            'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent'
          )}
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4" />
        </motion.button>

        <span className="w-14 text-center text-sm font-bold text-white tabular-nums select-none">
          {value}
        </span>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!canIncrement}
          onClick={() => update(value + 1)}
          className={cn(
            'p-3 text-zinc-400 transition-colors duration-200',
            'hover:text-white hover:bg-white/[0.05]',
            'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent'
          )}
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
