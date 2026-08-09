'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store';
import { AuthInput } from './AuthInput';
import { fadeUp, stagger } from '@/animations/framer/variants';

/**
 * Forgot password form — requests a password reset email.
 *
 * States:
 * - Default: email input
 * - Loading: spinner while request sends
 * - Error: invalid email / no account found
 * - Success: confirmation message with instructions
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const requestPasswordReset = useAuthStore(s => s.requestPasswordReset);
  const isLoading = useAuthStore(s => s.isLoading);
  const error = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();
      setFieldError(null);

      if (!email.trim()) {
        setFieldError('Email is required');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldError('Invalid email format');
        return;
      }

      await requestPasswordReset(email.trim());

      if (!useAuthStore.getState().error) {
        setSent(true);
        toast.success('Reset link sent to your email');
      }
    },
    [email, requestPasswordReset, clearError]
  );

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4 py-6"
      >
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-accent" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-display font-bold text-primary">
            Check your inbox
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We&apos;ve sent a password reset link to{' '}
            <span className="text-accent font-medium">{email}</span>. It will
            expire in 30 minutes.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-xs text-accent hover:underline pt-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={stagger(0.08)}
      initial="initial"
      animate="animate"
      className="space-y-5"
      noValidate
    >
      {/* Description */}
      <motion.p
        variants={fadeUp}
        className="text-sm text-muted-foreground leading-relaxed"
      >
        Enter the email address associated with your account, and we&apos;ll
        send you a link to reset your password.
      </motion.p>

      {/* Email */}
      <motion.div variants={fadeUp}>
        <AuthInput
          label="Email Address"
          type="email"
          value={email}
          onChange={v => {
            setEmail(v);
            clearError();
            setFieldError(null);
          }}
          placeholder="name@example.com"
          autoComplete="email"
          icon={<Mail className="w-4 h-4" />}
          error={fieldError || error}
          disabled={isLoading}
        />
      </motion.div>

      {/* Submit */}
      <motion.div variants={fadeUp}>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full py-3.5 rounded-xl bg-accent text-white font-bold text-sm tracking-wider uppercase transition-all shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
          <span className={isLoading ? 'opacity-0' : 'block'}>
            Send Reset Link
          </span>
          {isLoading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            </span>
          )}
        </button>
      </motion.div>

      {/* Back to login */}
      <motion.p variants={fadeUp} className="text-center pt-2">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </motion.p>
    </motion.form>
  );
}
