'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Shared newsletter-subscription logic used by the compact Footer form and the
 * full-width Newsletter section. Consolidates email validation, the POST to
 * `/api/newsletter`, loading/success state, and toast feedback so both
 * consumers stay identical.
 *
 * @param source - Attribution label sent with the request ('footer' | 'homepage')
 */
export function useNewsletterSubscription(source: string) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (submitting || subscribed) return;

      if (!email || !email.includes('@') || !email.includes('.')) {
        toast.error('Please enter a valid email address');
        return;
      }

      setSubmitting(true);
      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source }),
        });
        const data = await res.json();

        if (!res.ok || data.ok === false) {
          throw new Error(data.error ?? 'Could not subscribe.');
        }

        setSubscribed(true);
        setEmail('');
        toast.success("You're on the list!", {
          description: 'Early access codes will arrive before every drop.',
        });
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.'
        );
      } finally {
        setSubmitting(false);
      }
    },
    [email, submitting, subscribed, source]
  );

  return { email, setEmail, submitting, subscribed, handleSubscribe };
}
