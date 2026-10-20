'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import { SignupForm } from '@/components/auth/SignupForm';
import { isShopifyConfigured } from '@/lib/shopify/config';

/**
 * Signup page — client component with animated entrance.
 */
export function SignupPageClient() {
  return (
    <Section className="py-24 bg-background min-h-[80vh] flex items-center">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-md mx-auto"
        >
          {/* Card */}
          <div className="bg-surface border border-border rounded-2xl shadow-2xl p-8 sm:p-10 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-accent tracking-[0.2em] uppercase">
                  GET STARTED
                </span>
                <Sparkles className="w-3.5 h-3.5 text-accent" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-primary">
                Create Account
              </h1>
              <p className="text-sm text-muted-foreground">
                Join the community and never miss a drop.
              </p>
              {!isShopifyConfigured() && (
                <p
                  className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200"
                  role="status"
                >
                  Account creation is unavailable until the real account
                  integration is enabled.
                </p>
              )}
            </div>

            {/* Form */}
            <SignupForm />
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
