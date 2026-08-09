'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store';
import { AuthInput } from './AuthInput';
import { fadeUp, stagger } from '@/animations/framer/variants';

/**
 * Signup form with name, email, password, and confirm password.
 *
 * States:
 * - Default: empty form
 * - Loading: disabled fields + spinner
 * - Error: inline validation + store errors
 * - Success: auto-login + redirect to home
 */
export function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const signup = useAuthStore(s => s.signup);
  const isLoading = useAuthStore(s => s.isLoading);
  const error = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);

  const router = useRouter();

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Name is required';
    else if (name.trim().length < 2)
      errors.name = 'Name must be at least 2 characters';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = 'Invalid email format';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 8)
      errors.password = 'Must be at least 8 characters';
    if (!confirmPassword)
      errors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword)
      errors.confirmPassword = 'Passwords do not match';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [name, email, password, confirmPassword]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();
      if (!validate()) return;

      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });

      if (!useAuthStore.getState().error) {
        toast.success('Account created successfully!');
        router.push('/');
      }
    },
    [
      name,
      email,
      password,
      confirmPassword,
      signup,
      validate,
      clearError,
      router,
    ]
  );

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={stagger(0.08)}
      initial="initial"
      animate="animate"
      className="space-y-5"
      noValidate
    >
      {/* Name */}
      <motion.div variants={fadeUp}>
        <AuthInput
          label="Full Name"
          type="text"
          value={name}
          onChange={v => {
            setName(v);
            clearError();
          }}
          placeholder="Your name"
          autoComplete="name"
          icon={<User className="w-4 h-4" />}
          error={fieldErrors.name}
          disabled={isLoading}
        />
      </motion.div>

      {/* Email */}
      <motion.div variants={fadeUp}>
        <AuthInput
          label="Email Address"
          type="email"
          value={email}
          onChange={v => {
            setEmail(v);
            clearError();
          }}
          placeholder="name@example.com"
          autoComplete="email"
          icon={<Mail className="w-4 h-4" />}
          error={fieldErrors.email || (error ? ' ' : null)}
          disabled={isLoading}
        />
      </motion.div>

      {/* Password */}
      <motion.div variants={fadeUp}>
        <AuthInput
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={v => {
            setPassword(v);
            clearError();
          }}
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          icon={<Lock className="w-4 h-4" />}
          error={fieldErrors.password}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(prev => !prev)}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mt-1.5"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-3.5 h-3.5" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </motion.div>

      {/* Confirm Password */}
      <motion.div variants={fadeUp}>
        <AuthInput
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={v => {
            setConfirmPassword(v);
            clearError();
          }}
          placeholder="Re-enter password"
          autoComplete="new-password"
          icon={<Lock className="w-4 h-4" />}
          error={fieldErrors.confirmPassword}
          disabled={isLoading}
        />
      </motion.div>

      {/* Global error */}
      {error && !fieldErrors.email && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2"
          role="alert"
        >
          {error}
        </motion.p>
      )}

      {/* Submit */}
      <motion.div variants={fadeUp}>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full py-3.5 rounded-xl bg-accent text-white font-bold text-sm tracking-wider uppercase transition-all shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
          <span
            className={
              isLoading ? 'opacity-0' : 'flex items-center justify-center gap-2'
            }
          >
            Create Account
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </span>
          {isLoading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            </span>
          )}
        </button>
      </motion.div>

      {/* Login prompt */}
      <motion.p
        variants={fadeUp}
        className="text-center text-xs text-zinc-500 pt-2"
      >
        Already have an account?{' '}
        <Link
          href="/auth/login"
          className="text-accent font-bold hover:underline"
          tabIndex={isLoading ? -1 : 0}
        >
          Sign in
        </Link>
      </motion.p>
    </motion.form>
  );
}
