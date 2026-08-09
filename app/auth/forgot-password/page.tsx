import type { Metadata } from 'next';
import { ForgotPasswordPageClient } from './ForgotPasswordPageClient';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your OtakuSaga account password.',
  alternates: {
    canonical: `${siteConfig.url}/auth/forgot-password`,
  },
  openGraph: {
    type: 'website',
    url: `${siteConfig.url}/auth/forgot-password`,
    title: 'Forgot Password',
    description: 'Reset your OtakuSaga account password.',
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
    title: 'Forgot Password',
    description: 'Reset your OtakuSaga account password.',
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />;
}
