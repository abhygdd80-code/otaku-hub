'use client';

import { useEffect } from 'react';
import { captureError } from '@/lib/sentry';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root-level error boundary.
 *
 * `app/error.tsx` only catches errors thrown below the root layout.
 * Errors that originate inside the layout itself (fonts, providers,
 * metadata) escape that boundary entirely — this file is the last
 * safety net and renders its own `<html>`/`<body>` because the root
 * layout is not available at this point.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Unhandled root error:', error);
    void captureError(error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-background text-primary antialiased">
        <div className="min-h-screen flex items-center justify-center px-4">
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
              className="inline-flex items-center px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-sm tracking-wider uppercase transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
