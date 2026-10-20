'use client';

import { ShieldCheck, Truck } from 'lucide-react';
import { cn } from '@/utils/cn';
import { isShopifyConfigured } from '@/lib/shopify/config';

export interface ShippingInfoProps {
  className?: string;
  currencyCode?: string;
}

/**
 * Reusable shipping / returns reassurance block.
 *
 * Shared between the PDP info panel and the Quick View modal so the
 * copy stays identical everywhere it appears.
 */
export function ShippingInfo({ className }: ShippingInfoProps) {
  const shopifyConfigured = isShopifyConfigured();

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
          {shopifyConfigured
            ? 'Shipping details are provided at checkout.'
            : 'Shipping details will be confirmed when checkout is connected.'}{' '}
          <span className="text-zinc-500">
            {shopifyConfigured
              ? 'Review the final delivery options before paying.'
              : 'This demo does not create orders or collect payment.'}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
        <span>
          {shopifyConfigured
            ? 'Checkout is handled by our store.'
            : 'Local cart preview only.'}{' '}
          <span className="text-zinc-500">
            {shopifyConfigured
              ? 'Payment is collected only after you confirm checkout.'
              : 'Returns and payment become available with a connected store.'}
          </span>
        </span>
      </div>
    </div>
  );
}
