import { Star } from 'lucide-react';

const trustItems = [
  { label: 'Premium Quality' },
  { label: 'Fast Shipping' },
  { label: 'Secure Checkout' },
] as const;

/**
 * Trust row displaying star rating and key brand promises.
 * Used below the CTA buttons in the hero content column.
 */
export function HeroStats() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-6 border-t border-white/10">
      {/* Star rating */}
      <div className="flex items-center gap-1 shrink-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="w-3.5 h-3.5 fill-accent text-accent"
            aria-hidden="true"
          />
        ))}
        <span className="ml-1.5 text-xs font-semibold text-zinc-400">5.0</span>
      </div>

      {/* Divider dot */}
      <span
        className="hidden sm:block w-1 h-1 rounded-full bg-zinc-700"
        aria-hidden="true"
      />

      {/* Trust items */}
      <div className="flex items-center gap-3 sm:gap-4">
        {trustItems.map((item, i) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-500 font-medium tracking-wide whitespace-nowrap">
              {item.label}
            </span>
            {i < trustItems.length - 1 && (
              <span
                className="w-0.5 h-0.5 rounded-full bg-zinc-700"
                aria-hidden="true"
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
