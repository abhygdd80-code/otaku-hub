'use client';

import { ShieldCheck, Truck } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ShippingInfoProps {
  className?: string;
}

/**
 * Reusable shipping / returns reassurance block.
 *
 * Shared between the PDP info panel and the Quick View modal so the
 * copy stays identical everywhere it appears.
 */
export function ShippingInfo({ className }: ShippingInfoProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl',
        'bg-white/[0.03] border border-white/[0.06]',
        'space-y-3',
        className
      )}
    >
      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <Truck className="w-4 h-4 text-accent shrink-0" />
        <span>
          Free worldwide shipping on orders over $100.{' '}
          <span className="text-zinc-500">Express 2–4 business days.</span>
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
        <span>
          Secure checkout.{' '}
          <span className="text-zinc-500">30-day hassle-free returns.</span>
        </span>
      </div>
    </div>
  );
}
