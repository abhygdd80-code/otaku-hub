import { sentryConfig, sentryEnabled } from '@/config/sentry';

/**
 * Initialize the Sentry browser SDK.
 *
 * Safe to call multiple times — it no-ops on the server, when disabled,
 * or when already initialized. The SDK chunk is loaded lazily so the
 * default build never pulls it in.
 */
let initialized = false;

export async function initSentry(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!sentryEnabled || initialized) return;

  const Sentry = await import('@sentry/browser');
  Sentry.init({
    dsn: sentryConfig.dsn,
    tracesSampleRate: 0.1,
  });
  initialized = true;
}

/**
 * Capture an exception with Sentry when error monitoring is enabled.
 * No-ops everywhere else. Safe to call from error boundaries and
 * `app/error.tsx`.
 */
export async function captureError(
  error: unknown,
  context?: Record<string, unknown>
): Promise<void> {
  if (typeof window === 'undefined' || !sentryEnabled) return;

  const Sentry = await import('@sentry/browser');
  Sentry.captureException(error, { extra: context });
}
