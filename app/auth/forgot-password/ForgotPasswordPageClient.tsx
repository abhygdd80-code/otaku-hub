'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

/**
 * Forgot password page — client component.
 */
export function ForgotPasswordPageClient() {
  return (
    <Section className="py-24 bg-background min-h-[80vh] flex items-center">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-md mx-auto"
        >
          <div className="bg-surface border border-border rounded-2xl shadow-2xl p-8 sm:p-10 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6 text-accent" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-primary">
                Forgot Password
              </h1>
              <p className="text-sm text-muted-foreground">
                No worries — we&apos;ll send you a reset link.
              </p>
            </div>

            {/* Form */}
            <ForgotPasswordForm />
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
