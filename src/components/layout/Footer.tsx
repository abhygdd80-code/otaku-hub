'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { siteConfig } from '@/config/site';
import { useNewsletterSubscription } from '@/hooks/useNewsletterSubscription';

export const Footer: React.FC = () => {
  const { email, setEmail, submitting, subscribed, handleSubscribe } =
    useNewsletterSubscription('footer');

  const linkClasses = cn(
    'hover:text-primary transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-sm'
  );

  return (
    <footer className="bg-surface border-t border-border mt-auto relative z-10 text-secondary-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-display font-bold text-2xl tracking-tighter text-accent">
                OTAKU<span className="text-white">SAGA</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-secondary-text max-w-sm">
              Premium anime apparel, streetwear, and collector merchandise.
              Engineered for true fans.
            </p>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="text-sm font-semibold text-primary tracking-wider uppercase mb-4">
              Shop Collections
            </h3>
            <ul className="space-y-2.5 text-sm">
              {siteConfig.footerLinks.shop.map(item => (
                <li key={item.label}>
                  <Link href={item.href} className={linkClasses}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-sm font-semibold text-primary tracking-wider uppercase mb-4">
              Help &amp; Account
            </h3>
            <ul className="space-y-2.5 text-sm">
              {siteConfig.footerLinks.support.map(item => (
                <li key={item.label}>
                  <Link href={item.href} className={linkClasses}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-sm font-semibold text-primary tracking-wider uppercase mb-4">
              Stay in the Loop
            </h3>
            <p className="text-sm text-secondary-text mb-4">
              Subscribe for exclusive drops, early collection access, and
              special offers.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address for newsletter
              </label>
              <div className="flex">
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={subscribed}
                  className={cn(
                    'w-full bg-background border border-border rounded-l-md px-3 py-2 text-sm',
                    'text-primary placeholder-muted',
                    'focus:outline-none focus:border-accent',
                    'focus-visible:ring-2 focus-visible:ring-accent',
                    'disabled:opacity-60'
                  )}
                />
                <button
                  type="submit"
                  disabled={submitting || subscribed}
                  className={cn(
                    'bg-accent hover:bg-accent/90 text-white font-medium text-sm px-4 py-2',
                    'rounded-r-md transition-colors duration-200',
                    'active:scale-[0.98]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    'focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                    'disabled:opacity-60 disabled:cursor-not-allowed'
                  )}
                >
                  {subscribed ? '✓' : submitting ? '…' : 'Join'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex space-x-6">
            {siteConfig.footerLinks.social.map(social => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClasses}
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
