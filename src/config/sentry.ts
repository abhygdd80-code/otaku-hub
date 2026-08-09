/**
 * Sentry error-monitoring configuration — feature-flag driven.
 *
 * DISABLED by default. Only activates when `NEXT_PUBLIC_ENABLE_SENTRY`
 * is set to `true` AND a DSN is present. With no DSN the SDK is never
 * loaded and no events are sent. See `.env.example`.
 */

export const sentryConfig = {
  enabled: process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true',
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? '',
} as const;

/** True only when both the flag AND a DSN are configured. */
export const sentryEnabled =
  sentryConfig.enabled && sentryConfig.dsn.length > 0;
