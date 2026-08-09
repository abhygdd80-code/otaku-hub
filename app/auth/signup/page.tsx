import type { Metadata } from 'next';
import { SignupPageClient } from './SignupPageClient';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Create Account',
  description:
    'Join OtakuSaga — create your account for exclusive drops, wishlist, and faster checkout.',
  alternates: {
    canonical: `${siteConfig.url}/auth/signup`,
  },
  openGraph: {
    type: 'website',
    url: `${siteConfig.url}/auth/signup`,
    title: 'Create Account',
    description:
      'Join OtakuSaga — create your account for exclusive drops, wishlist, and faster checkout.',
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
    title: 'Create Account',
    description:
      'Join OtakuSaga — create your account for exclusive drops, wishlist, and faster checkout.',
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
  },
};

export default function SignupPage() {
  return <SignupPageClient />;
}
