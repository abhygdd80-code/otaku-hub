'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface ColorSelectorProps {
  /** Available color names (e.g. ['Obsidian Black', 'Cyber Crimson']) */
  colors: string[];
  /** Called with the selected color name */
  onChange: (color: string) => void;
  className?: string;
}

/**
 * Colour swatch selector with selected-ring accent.
 *
 * Displays colour name buttons rather than raw hex swatches
 * since our data layer stores colour names. Each option has a
 * subtle dot-grid or visual indicator in its active state.
 */
export function ColorSelector({
  colors,
  onChange,
  className,
}: ColorSelectorProps) {
  const [selected, setSelected] = useState(colors[0] ?? '');

  const handleSelect = useCallback(
    (color: string) => {
      setSelected(color);
      onChange(color);
    },
    [onChange]
  );

  if (!colors.length) return null;

  return (
    <div className={cn('space-y-2.5', className)}>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Color — <span className="text-white">{selected}</span>
      </p>

      <div className="flex flex-wrap gap-2">
        {colors.map(color => {
          const active = selected === color;
          return (
            <motion.button
              key={color}
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelect(color)}
              className={cn(
                'relative px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider',
                'transition-all duration-200',
                'border',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                active
                  ? 'bg-accent/15 border-accent text-accent shadow-[0_0_12px_rgba(229,9,20,0.2)]'
                  : 'bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:border-white/20 hover:text-white'
              )}
              aria-pressed={active}
              aria-label={`Color ${color}`}
            >
              {color}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
