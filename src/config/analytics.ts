/**
 * Analytics configuration — feature-flag driven.
 *
 * Every provider is DISABLED by default and only activates when its
 * `NEXT_PUBLIC_ENABLE_*` flag is set to `true` AND the matching key is
 * present in the environment. No keys are shipped with the repo — see
 * `.env.example` for the full list of variables.
 */

interface AnalyticsConfig {
  ga4: {
    enabled: boolean;
    measurementId: string;
  };
  meta: {
    enabled: boolean;
    pixelId: string;
  };
  posthog: {
    enabled: boolean;
    apiKey: string;
    host: string;
  };
  clarity: {
    enabled: boolean;
    projectId: string;
  };
}

export const analytics: AnalyticsConfig = {
  ga4: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_GA4 === 'true',
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '',
  },
  meta: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_META_PIXEL === 'true',
    pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '',
  },
  posthog: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_POSTHOG === 'true',
    apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '',
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
  },
  clarity: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_CLARITY === 'true',
    projectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? '',
  },
};

/** True when at least one analytics provider is active. */
export const analyticsEnabled =
  analytics.ga4.enabled ||
  analytics.meta.enabled ||
  analytics.posthog.enabled ||
  analytics.clarity.enabled;
