// ─── Unified analytics facade ─────────────────────────────
// Fans a single `trackEvent` call out to every enabled provider (GA4,
// Meta Pixel, PostHog, Clarity). No-ops entirely when analytics are
// disabled or no keys are configured.

import { analytics } from '@/config/analytics';
import type { FbqStandardEvent } from '@/types/analytics';

// ─── E-commerce product shape ─────────────────────────────

/** Product data as consumed by ecommerce event payloads. */
export interface AnalyticsProduct {
  item_id: string;
  item_name: string;
  item_category?: string;
  price: number;
  quantity?: number;
  /** Shopify variant GID — forwarded to Meta as content_ids. */
  item_variant?: string;
  /** SKU if available. */
  item_variant_sku?: string;
}

// ─── Core event ───────────────────────────────────────────

export interface TrackEventInput {
  /** Event name, e.g. `add_to_cart`, `view_item`. */
  name: string;
  /** Optional structured properties forwarded to all providers. */
  properties?: Record<string, unknown>;
}

/**
 * Dispatch an event to every enabled analytics provider.
 *
 * Providers that are not enabled, or whose required key is empty, are
 * silently skipped — this function never throws.
 */
export function trackEvent({ name, properties }: TrackEventInput): void {
  if (typeof window === 'undefined') return;

  // ── GA4 (gtag) ───────────────────────────────────────────
  if (analytics.ga4.enabled && analytics.ga4.measurementId) {
    try {
      window.gtag?.('event', name, properties);
    } catch {
      // gtag failures must not break the app.
    }
  }

  // ── Meta Pixel ───────────────────────────────────────────
  if (analytics.meta.enabled && analytics.meta.pixelId && window.fbq) {
    try {
      const mapped = FB_EVENT_MAP[name];
      if (mapped) {
        // Standard event → fbq('track', 'AddToCart', params)
        window.fbq('track', mapped, properties);
      } else {
        // Custom / unknown event → fbq('trackCustom', name, params)
        window.fbq('trackCustom', name, properties);
      }
    } catch {
      // Meta Pixel failures must not break the app.
    }
  }

  // ── PostHog ──────────────────────────────────────────────
  if (analytics.posthog.enabled && analytics.posthog.apiKey) {
    try {
      window.posthog?.capture?.(name, properties);
    } catch {
      // PostHog failures must not break the app.
    }
  }

  // ── Clarity ──────────────────────────────────────────────
  if (analytics.clarity.enabled && analytics.clarity.projectId) {
    try {
      window.clarity?.('event', name);
    } catch {
      // Clarity failures must not break the app.
    }
  }

  // ── Shopify storefront analytics (web pixel extensions) ──
  // Web pixel extensions call analytics.publish() from the customer
  // account. On headless stores, the host is injected after the
  // extension loads. The call is completely defensive.
  try {
    window.Shopify?.analytics?.publish?.(name, properties);
  } catch {
    // Shopify pixel failures must not break the app.
  }
}

// ─── Meta Pixel event mapping ─────────────────────────────
// Maps our internal event names to Meta standard events where a
// mapping exists.  Events without a mapping fall back to fbq('trackCustom').

const FB_EVENT_MAP: Partial<Record<string, FbqStandardEvent>> = {
  page_view: 'PageView',
  view_item: 'ViewContent',
  view_item_list: 'ViewContent',
  add_to_cart: 'AddToCart',
  add_to_wishlist: 'AddToWishlist',
  begin_checkout: 'InitiateCheckout',
  purchase: 'Purchase',
  search: 'Search',
  contact: 'Contact',
  complete_registration: 'CompleteRegistration',
  schedule: 'Schedule',
  subscribe: 'Subscribe',
};

// ─── Typed ecommerce helpers ──────────────────────────────

export function trackViewItem(product: AnalyticsProduct): void {
  trackEvent({
    name: 'view_item',
    properties: {
      currency: 'USD',
      value: product.price,
      items: [product],
    },
  });
}

export function trackAddToCart(
  item: AnalyticsProduct,
  totalPrice?: number
): void {
  trackEvent({
    name: 'add_to_cart',
    properties: {
      currency: 'USD',
      value: totalPrice ?? item.price,
      items: [item],
    },
  });
}

export function trackRemoveFromCart(item: AnalyticsProduct): void {
  trackEvent({
    name: 'remove_from_cart',
    properties: {
      currency: 'USD',
      value: item.price * (item.quantity ?? 1),
      items: [item],
    },
  });
}

export function trackBeginCheckout(
  items: AnalyticsProduct[],
  totalPrice: number,
  coupon?: string
): void {
  trackEvent({
    name: 'begin_checkout',
    properties: {
      currency: 'USD',
      value: totalPrice,
      ...(coupon ? { coupon } : {}),
      items,
    },
  });
}

export function trackPurchase(
  items: AnalyticsProduct[],
  totalPrice: number,
  transactionId: string,
  coupon?: string
): void {
  trackEvent({
    name: 'purchase',
    properties: {
      currency: 'USD',
      value: totalPrice,
      transaction_id: transactionId,
      ...(coupon ? { coupon } : {}),
      items,
    },
  });
}

export function trackSearch(searchTerm: string): void {
  if (!searchTerm.trim()) return;
  trackEvent({
    name: 'search',
    properties: { search_term: searchTerm.trim() },
  });
}

export function trackViewItemList(
  items: AnalyticsProduct[],
  listName: string
): void {
  trackEvent({
    name: 'view_item_list',
    properties: {
      currency: 'USD',
      item_list_name: listName,
      items,
    },
  });
}
