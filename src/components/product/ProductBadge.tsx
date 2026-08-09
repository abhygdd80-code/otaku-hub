import { cn } from '@/utils/cn';

export interface ProductBadgeProps {
  /** Badge text — rendered only when truthy */
  badge?: string | null;
  className?: string;
}

/**
 * Accent-coloured product badge pill.
 * Returns `null` when `badge` is falsy so the parent layout
 * doesn&rsquo;t need conditional rendering.
 */
export function ProductBadge({ badge, className }: ProductBadgeProps) {
  if (!badge) return null;

  return (
    <span
      className={cn(
        'inline-block px-2.5 py-1 rounded-md',
        'text-[10px] font-bold uppercase tracking-wider text-white',
        'bg-accent/90 backdrop-blur-md',
        className
      )}
    >
      {badge}
    </span>
  );
}
