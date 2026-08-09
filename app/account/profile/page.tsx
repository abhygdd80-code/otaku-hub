import type { Metadata } from 'next';
import { ProfilePageClient } from './ProfilePageClient';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'My Profile',
  description:
    'Manage your OtakuSaga profile, preferences, and account settings.',
  alternates: {
    canonical: `${siteConfig.url}/account/profile`,
  },
  openGraph: {
    type: 'website',
    url: `${siteConfig.url}/account/profile`,
    title: 'My Profile',
    description:
      'Manage your OtakuSaga profile, preferences, and account settings.',
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Profile',
    description:
      'Manage your OtakuSaga profile, preferences, and account settings.',
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
  },
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}
