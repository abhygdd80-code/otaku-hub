import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OrderConfirmedClient } from './OrderConfirmedClient';
import { siteConfig } from '@/config/site';

// Order state is read from the URL + localStorage client-side, so this page
// must never be statically cached.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description:
    'Your order at OtakuSaga is confirmed. Track its status and manage your purchases from your account.',
  alternates: {
    canonical: `${siteConfig.url}/order/confirmed`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <OrderConfirmedClient />
    </Suspense>
  );
}
