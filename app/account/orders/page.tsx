import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OrdersPageClient } from './OrdersPageClient';
import { siteConfig } from '@/config/site';

// Order history is read from the authenticated Shopify session, so it is
// never statically cached — the auth cookie can change per request.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Orders',
  description:
    'Review your OtakuSaga order history, track shipments, and view delivery progress.',
  alternates: {
    canonical: `${siteConfig.url}/account/orders`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <OrdersPageClient />
    </Suspense>
  );
}
