'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Check, X, Info } from 'lucide-react';
import { useCart } from './CartContext';
import { useCartDrawer } from './CartDrawerContext';
import { cn } from '@/utils/cn';
import { ROUTES, DURATION } from '@/constants';
import { toast } from 'sonner';
import { FREE_SHIPPING_THRESHOLD } from './ShippingProgress';
import { getCoupon, computeCouponDiscount } from '@/lib/coupons';
import { trackBeginCheckout, type AnalyticsProduct } from '@/lib/analytics';
import { isShopifyConfigured } from '@/lib/shopify/config';
import { getCheckoutUrl, fetchShopifyCart } from '@/lib/shopify/cart';
import { setPendingPurchase } from '@/lib/checkout';
import { formatPrice } from '@/lib/utils';

/**
 * Cart summary panel showing subtotal, shipping, tax, and total.
 *
 * Includes a promo-code field (SAVE10 / WELCOME15 / ANIME20) with
 * inline validation, a success flash, and a removable discount line.
 * When Shopify is not configured this remains a local/demo cart: no payment
 * is collected and no order is created.
 */
export function CartSummary() {
  const { cart, subtotal } = useCart();
  const { onClose } = useCartDrawer();
  const router = useRouter();

  // ── Coupon state ──────────────────────────────────────────
  const [couponInput, setCouponInput] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const discount = appliedCode
    ? computeCouponDiscount(appliedCode, subtotal)
    : 0;
  const discountedSubtotal = subtotal - discount;
  const currencyCode = cart[0]?.currencyCode ?? 'INR';
  const shopifyConfigured = isShopifyConfigured();

  if (cart.length === 0) return null;

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 12;
  const tax = discountedSubtotal * 0.08;
  const total = discountedSubtotal + shipping + tax;

  // ── Coupon handlers ───────────────────────────────────────
  const failCoupon = (message: string) => {
    setError(message);
    setShake(true);
  };

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      failCoupon('Please enter a coupon code.');
      return;
    }
    if (appliedCode === code) {
      failCoupon(`Code ${code} is already applied.`);
      return;
    }
    const coupon = getCoupon(code);
    if (!coupon) {
      failCoupon(`"${code}" is not a valid coupon code.`);
      return;
    }
    setError(null);
    setAppliedCode(code);
    setCouponInput('');
    toast.success(`Coupon ${code} applied!`, {
      description: coupon.label,
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCode(null);
    setError(null);
  };

  const handleCheckout = async () => {
    if (!shopifyConfigured) {
      toast.info('Checkout is not available in this demo.', {
        id: 'checkout',
        description:
          'Your cart is saved locally. Connect a store to enable payment and order creation.',
      });
      return;
    }

    // ── Analytics: begin_checkout ────────────────────────────
    const analyticsItems: AnalyticsProduct[] = cart.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.collection,
      price: item.price,
      currencyCode: item.currencyCode,
      quantity: item.quantity,
    }));
    trackBeginCheckout(analyticsItems, total, appliedCode ?? undefined);

    // Persist a snapshot of what the customer is buying so the confirmation
    // page can replay the purchase event accurately after hosted checkout.
    setPendingPurchase({
      items: analyticsItems,
      total,
      currency: currencyCode,
      coupon: appliedCode ?? undefined,
      createdAt: new Date().toISOString(),
    });

    let checkoutUrl = getCheckoutUrl();
    if (!checkoutUrl) {
      // No persisted URL for this session — refresh the cart once to
      // obtain the canonical checkout link.
      const shopifyCart = await fetchShopifyCart();
      checkoutUrl = shopifyCart?.checkoutUrl ?? null;
    }

    if (!checkoutUrl) {
      toast.error('Unable to open checkout. Please try again.');
      return;
    }

    // Ask Shopify to return the customer to our confirmation page.
    const returnUrl = `${window.location.origin}${ROUTES.orderConfirmed}`;
    const separator = checkoutUrl.includes('?') ? '&' : '?';
    window.location.href = `${checkoutUrl}${separator}return_to=${encodeURIComponent(returnUrl)}`;
  };

  const handleContinue = () => {
    onClose();
    router.push(ROUTES.shop);
  };

  const inputState = error
    ? 'border-destructive/60 focus-visible:ring-destructive/40'
    : appliedCode
      ? 'border-success/60 focus-visible:ring-success/40'
      : 'border-zinc-700 focus-visible:ring-accent';

  return (
    <div className="space-y-4">
      {/* ── Promo code ─────────────────────────────────────── */}
      <div className="space-y-2">
        <label
          htmlFor="coupon-input"
          className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
        >
          Promo Code
        </label>

        <motion.div
          className="flex gap-2"
          animate={shake ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          onAnimationComplete={() => setShake(false)}
        >
          <div className="relative flex-1">
            <Tag
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
              aria-hidden="true"
            />
            <input
              id="coupon-input"
              type="text"
              value={couponInput}
              onChange={e => {
                setCouponInput(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyCoupon();
                }
              }}
              placeholder="SAVE10, WELCOME15, ANIME20"
              aria-label="Promo code"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'coupon-error' : undefined}
              disabled={appliedCode !== null}
              className={cn(
                'w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm text-zinc-200',
                'bg-white/5 placeholder:text-zinc-500',
                'transition-colors duration-300',
                'focus-visible:outline-none focus-visible:ring-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                inputState
              )}
            />
          </div>

          <button
            type="button"
            onClick={handleApplyCoupon}
            disabled={appliedCode !== null}
            className={cn(
              'shrink-0 rounded-lg bg-accent px-4',
              'text-xs font-bold uppercase tracking-wider text-white',
              'transition-all duration-300',
              'hover:shadow-[0_0_20px_rgba(229,9,20,0.35)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            )}
          >
            Apply
          </button>
        </motion.div>

        {/* Error + success feedback */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key="coupon-error"
              id="coupon-error"
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: DURATION.fast }}
              className="text-xs font-medium text-destructive"
            >
              {error}
            </motion.p>
          ) : appliedCode ? (
            <motion.p
              key="coupon-success"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: DURATION.fast }}
              className="flex items-center gap-1.5 text-xs font-medium text-success"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              {appliedCode} applied — enjoy {getCoupon(appliedCode)?.label}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      {!shopifyConfigured && (
        <div
          role="status"
          className="flex gap-3 rounded-xl border border-accent/20 bg-accent/5 p-3.5 text-xs text-zinc-300"
        >
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-accent"
            aria-hidden="true"
          />
          <p className="leading-relaxed">
            <span className="font-semibold text-white">Demo cart only.</span>{' '}
            Items stay in this browser. No payment is taken and no order is
            created until checkout is connected.
          </p>
        </div>
      )}

      {/* ── Line items ─────────────────────────────────────── */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-zinc-400">
          <span>Subtotal</span>
          <span className="text-white">
            {formatPrice(subtotal, currencyCode)}
          </span>
        </div>

        {appliedCode && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.normal }}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5 text-success">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Discount ({appliedCode})</span>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                aria-label={`Remove coupon ${appliedCode}`}
                className="rounded text-zinc-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
            <span className="font-semibold text-success">
              -{formatPrice(discount, currencyCode)}
            </span>
          </motion.div>
        )}

        <div className="flex items-center justify-between text-zinc-400">
          <span>{shopifyConfigured ? 'Shipping' : 'Estimated shipping'}</span>
          <span className="text-white">
            {shipping === 0 ? 'Free' : formatPrice(shipping, currencyCode)}
          </span>
        </div>
        <div className="flex items-center justify-between text-zinc-400">
          <span>Estimated Tax</span>
          <span className="text-white">{formatPrice(tax, currencyCode)}</span>
        </div>
      </div>

      {/* ── Total ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-border/60 pt-4">
        <span className="text-base font-bold text-white">Total</span>
        <span className="text-xl font-extrabold text-white">
          {formatPrice(total, currencyCode)}
        </span>
      </div>

      {/* Free shipping threshold */}
      {shipping > 0 && (
        <p className="text-center text-[11px] text-zinc-500">
          {shopifyConfigured
            ? 'Free shipping on orders over'
            : 'Demo free-shipping threshold:'}{' '}
          {formatPrice(100, currencyCode)}
        </p>
      )}

      {!shopifyConfigured && (
        <p className="text-center text-[11px] leading-relaxed text-zinc-500">
          Prices, shipping, tax, and discounts are previews until checkout is
          connected.
        </p>
      )}

      {/* ── Actions ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={handleCheckout}
          disabled={!shopifyConfigured}
          title={
            shopifyConfigured
              ? 'Proceed to checkout'
              : 'Checkout is unavailable until a store is connected'
          }
          className={cn(
            'w-full rounded-xl px-6 py-3.5',
            'bg-accent text-sm font-bold uppercase tracking-wider text-white',
            'transition-all duration-300',
            'hover:shadow-[0_0_30px_rgba(229,9,20,0.4)]',
            'hover:-translate-y-0.5 active:translate-y-0',
            'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          )}
        >
          {shopifyConfigured ? 'Proceed to Checkout' : 'Checkout Unavailable'}
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className={cn(
            'w-full rounded-xl border border-zinc-700 px-6 py-3',
            'bg-white/5 text-xs font-semibold uppercase tracking-wider text-zinc-300 backdrop-blur-sm',
            'transition-all duration-300',
            'hover:-translate-y-0.5 hover:border-accent/50 hover:text-white active:translate-y-0',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
          )}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
