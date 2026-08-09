'use client';

import { useEffect } from 'react';
import { initSentry } from '@/lib/sentry';

/**
 * Boots the Sentry browser SDK once on the client.
 *
 * Env-gated: does nothing unless `NEXT_PUBLIC_ENABLE_SENTRY=true` and a
 * DSN are configured, so the default build stays Sentry-free.
 */
export function SentryProvider() {
  useEffect(() => {
    void initSentry();
  }, []);

  return null;
}

export default SentryProvider;
