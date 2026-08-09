import type { Metadata } from 'next';
import { LoginPageClient } from './LoginPageClient';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Sign in to your OtakuSaga account to access your wishlist, orders, and more.',
  alternates: {
    canonical: `${siteConfig.url}/auth/login`,
  },
  openGraph: {
    type: 'website',
    url: `${siteConfig.url}/auth/login`,
    title: 'Sign In',
    description:
      'Sign in to your OtakuSaga account to access your wishlist, orders, and more.',
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
    title: 'Sign In',
    description:
      'Sign in to your OtakuSaga account to access your wishlist, orders, and more.',
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
  },
};

export default function LoginPage() {
  return <LoginPageClient />;
}
