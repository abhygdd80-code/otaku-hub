import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AddressesPageClient } from './AddressesPageClient';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Addresses',
  description:
    'Manage your saved shipping addresses for faster checkout at OtakuSaga.',
  alternates: {
    canonical: `${siteConfig.url}/account/addresses`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AddressesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <AddressesPageClient />
    </Suspense>
  );
}
