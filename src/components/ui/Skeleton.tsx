import { cn } from '@/utils';

interface SkeletonProps {
  className?: string;
  /**
   * Aspect ratio as a string, e.g. "16/9", "1/1", "4/3"
   */
  aspectRatio?: string;
  /**
   * Predefined skeleton shapes
   */
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

const variantClasses: Record<string, string> = {
  text: 'h-4 w-full rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-lg',
  card: 'rounded-2xl aspect-[4/5] w-full',
};

/**
 * Premium skeleton loading placeholder.
 *
 * A flat base tone with a soft highlight sweeping across — reads as
 * "content is loading" without the harsh CSS pulse. The highlight is
 * hidden entirely under `prefers-reduced-motion`, leaving a calm base
 * block. Renders a fixed-size box so it never causes layout shift.
 */
export function Skeleton({
  className,
  variant = 'text',
  aspectRatio,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative isolate overflow-hidden bg-border/50',
        variantClasses[variant],
        className
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
      aria-hidden="true"
    >
      {/* Shimmer sweep — clipped by the parent's overflow-hidden */}
      <div
        className={cn(
          'absolute inset-0 -translate-x-full animate-shimmer',
          'bg-gradient-to-r from-transparent via-white/[0.07] to-transparent',
          'motion-reduce:hidden'
        )}
      />
    </div>
  );
}
