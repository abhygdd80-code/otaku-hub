import type { Metadata } from 'next';
import { SettingsPageClient } from './SettingsPageClient';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Account Settings',
  description:
    'Update your contact information, password, and notification preferences at OtakuSaga.',
  alternates: {
    canonical: `${siteConfig.url}/account/settings`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
