'use client';

import { useEffect } from 'react';
import Container from '@/components/layout/Container';
import { captureError } from '@/lib/sentry';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Page error:', error);
    void captureError(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Container>
        <div className="max-w-md mx-auto text-center space-y-6">
          <span className="text-8xl font-display font-extrabold text-accent block">
            !
          </span>
          <h1 className="text-2xl font-bold text-primary">
            SOMETHING WENT WRONG
          </h1>
          <p className="text-sm text-secondary-text leading-relaxed">
            An unexpected error occurred. Our team has been notified.
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-sm tracking-wider uppercase transition-all"
          >
            Try Again
          </button>
        </div>
      </Container>
    </div>
  );
}
