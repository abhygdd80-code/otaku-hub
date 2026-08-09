'use client';

import { useEffect } from 'react';
import { analytics } from '@/config/analytics';
import type { PostHogApi, ClarityApi, FbqApi } from '@/types/analytics';

/**
 * Client-side analytics bootstrapper.
 *
 * Mounted once in the root layout. Loads third-party scripts only for
 * providers that are both feature-flagged ON and configured with a key,
 * so the default build ships zero tracking scripts.
 */
export function AnalyticsProvider() {
  useEffect(() => {
    const { ga4, meta, posthog, clarity } = analytics;

    // ── Google Analytics 4 (gtag) ───────────────────────────
    if (ga4.enabled && ga4.measurementId) {
      const external = document.createElement('script');
      external.async = true;
      external.src = `https://www.googletagmanager.com/gtag/js?id=${ga4.measurementId}`;
      document.head.appendChild(external);

      const init = document.createElement('script');
      init.textContent = [
        'window.dataLayer=window.dataLayer||[];',
        'function gtag(){dataLayer.push(arguments);}',
        "gtag('js',new Date());",
        `gtag('config','${ga4.measurementId}');`,
      ].join('');
      document.head.appendChild(init);
    }

    // ── Meta Pixel (Facebook) ───────────────────────────────
    // Meta's recommended loader: inject the shim first so fbq() calls
    // made before fbevents.js loads are buffered, then load the SDK.
    if (meta.enabled && meta.pixelId) {
      if (!window.fbq) {
        const queueFn: FbqApi = function (...args: unknown[]) {
          const self = window.fbq as FbqApi;
          (self.queue = self.queue || []).push(args);
        } as unknown as FbqApi;
        queueFn.load = () => {};
        queueFn.version = '2.0';
        queueFn.queue = [];
        window.fbq = queueFn;
      }
      // Ensure _fbq alias is set (some extensions read it)
      window._fbq = window._fbq || window.fbq?.queue || [];

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);

      window.fbq('init', meta.pixelId);
      window.fbq('track', 'PageView');
    }

    // ── PostHog ─────────────────────────────────────────────
    if (posthog.enabled && posthog.apiKey) {
      window.posthog = window.posthog || ([] as PostHogApi);
      window.posthog._i = window.posthog._i || [];
      window.posthog._i.push([
        'init',
        posthog.apiKey,
        { api_host: posthog.host },
      ]);
      const script = document.createElement('script');
      script.async = true;
      script.src = `${posthog.host}/static/array.js`;
      document.head.appendChild(script);
    }

    // ── Microsoft Clarity ───────────────────────────────────
    if (clarity.enabled && clarity.projectId) {
      if (!window.clarity) {
        const queueFn = ((...args: unknown[]) => {
          const self = window.clarity as ClarityApi;
          (self.q = self.q || []).push(args);
        }) as ClarityApi;
        window.clarity = queueFn;
      }
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.clarity.ms/tag/${clarity.projectId}`;
      document.head.appendChild(script);
    }
  }, []);

  return null;
}

export default AnalyticsProvider;
