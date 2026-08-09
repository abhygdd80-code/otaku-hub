// ─── Coupon System ──────────────────────────────────────────
// Single source of truth for promo codes. Each coupon defines a
// discount rate applied to the merchandise subtotal. Keep this
// module framework-agnostic so it can be reused by the cart,
// checkout, and any future promo UIs.

export interface Coupon {
  /** Canonical code, e.g. `SAVE10` (case-insensitive on input). */
  code: string;
  /** Discount fraction — `0.10` means 10% off. */
  rate: number;
  /** Human-friendly blurb shown on success. */
  label: string;
}

/** All active coupons. Add new promos here to surface them everywhere. */
export const COUPONS: Coupon[] = [
  { code: 'SAVE10', rate: 0.1, label: '10% off your order' },
  { code: 'WELCOME15', rate: 0.15, label: '15% off your order' },
  { code: 'ANIME20', rate: 0.2, label: '20% off your order' },
];

const COUPON_MAP = new Map<string, Coupon>(
  COUPONS.map(coupon => [coupon.code, coupon])
);

/**
 * Resolve a user-entered code to its coupon definition.
 * Normalizes whitespace + case, so `" save10 "` matches `SAVE10`.
 * Returns `undefined` when the code is unknown.
 */
export function getCoupon(rawCode: string): Coupon | undefined {
  const code = rawCode.trim().toUpperCase();
  if (!code) return undefined;
  return COUPON_MAP.get(code);
}

/**
 * Dollar amount saved for a given code and subtotal, rounded to cents.
 * Returns 0 for unknown codes or non-positive subtotals.
 */
export function computeCouponDiscount(
  rawCode: string,
  subtotal: number
): number {
  const coupon = getCoupon(rawCode);
  if (!coupon || subtotal <= 0) return 0;
  return Math.round(subtotal * coupon.rate * 100) / 100;
}
