// ─── Pending purchase snapshot ───────────────────────────────────────
// Persisted to localStorage just before redirecting to the Shopify hosted
// checkout, so the order-confirmation page can replay the purchase analytics
// event without depending on order data that may not be queryable (or may
// still be processing) the moment the customer returns.

import type { AnalyticsProduct } from './analytics';

export const PENDING_PURCHASE_KEY = 'otaku-pending-purchase';

export interface PendingPurchase {
  items: AnalyticsProduct[];
  total: number;
  currency: string;
  coupon?: string;
  createdAt: string;
}

export function getPendingPurchase(): PendingPurchase | null {
  try {
    const raw = localStorage.getItem(PENDING_PURCHASE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPurchase;
    if (!parsed || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setPendingPurchase(purchase: PendingPurchase): void {
  try {
    localStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify(purchase));
  } catch {
    // Non-critical — analytics replay simply won't fire for this order.
  }
}

export function clearPendingPurchase(): void {
  try {
    localStorage.removeItem(PENDING_PURCHASE_KEY);
  } catch {
    // Ignore.
  }
}
