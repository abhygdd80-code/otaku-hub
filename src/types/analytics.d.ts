// ─── Global analytics globals ─────────────────────────────
// Typed access to provider globals injected by AnalyticsProvider.
// All are optional: nothing is defined until a provider loads.

export interface PostHogApi {
  capture?: (eventName: string, properties?: Record<string, unknown>) => void;
  identify?: (userId: string, properties?: Record<string, unknown>) => void;
  _i?: Array<[string, string, Record<string, unknown>]>;
}

export interface ClarityApi {
  (command: string, ...args: unknown[]): void;
  q?: unknown[][];
}

// ─── Meta Pixel (Facebook) ───────────────────────────────
// `fbq(action, event, params)` is the canonical Meta Pixel API. The queue
// shim (`fbq.queue`) buffers calls made before fbevents.js loads.

export type FbqStandardEvent =
  | 'AddPaymentInfo'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'CompleteRegistration'
  | 'Contact'
  | 'CustomizeProduct'
  | 'Donate'
  | 'FindLocation'
  | 'InitiateCheckout'
  | 'Lead'
  | 'PageView'
  | 'Purchase'
  | 'Rate'
  | 'Schedule'
  | 'Search'
  | 'StartTrial'
  | 'SubmitApplication'
  | 'Subscribe'
  | 'ViewContent';

export interface FbqApi {
  (action: 'init', pixelId: string, options?: Record<string, unknown>): void;
  (
    action: 'track',
    event: FbqStandardEvent,
    params?: Record<string, unknown>
  ): void;
  (
    action: 'trackCustom',
    event: string,
    params?: Record<string, unknown>
  ): void;
  (
    action: 'trackSingle',
    pixelId: string,
    event: string,
    params?: Record<string, unknown>
  ): void;
  (
    action: 'trackSingleCustom',
    pixelId: string,
    event: string,
    params?: Record<string, unknown>
  ): void;
  (action: 'set', params: Record<string, unknown>): void;
  (
    action: 'dataProcessingOptions',
    options: unknown[],
    country?: number,
    state?: number
  ): void;
  /** Pre-load queue of (action, args) tuples buffered by the shim. */
  queue?: unknown[][];
  /** SDK version banner — set on the shim to match the real fbq object. */
  version?: string;
  /** Stub assigned to the shim so `fbq.load` calls never throw. */
  load?: () => void;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    posthog?: PostHogApi;
    clarity?: ClarityApi;
    /** Meta Pixel — defined once `fbq('init', …)` has been queued/loaded. */
    fbq?: FbqApi;
    /** Raw queue used by the Meta Pixel loader. */
    _fbq?: unknown[];
    /** Shopify storefront analytics host (web pixel extensions). */
    Shopify?: {
      analytics?: {
        publish?: (
          eventName: string,
          payload?: Record<string, unknown>
        ) => void;
      };
    };
  }
}
