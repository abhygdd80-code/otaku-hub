'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Package, ShoppingBag } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useCart } from '@/context/CartContext';
import { useAuthStore } from '@/store';
import { trackPurchase } from '@/lib/analytics';
import { formatPrice } from '@/lib/utils';
import {
  clearPendingPurchase,
  getPendingPurchase,
  type PendingPurchase,
} from '@/lib/checkout';
import { createOrderConfirmedEntrance } from '@/animations/gsap/order-confirmed';
import { ROUTES } from '@/constants';
import { isShopifyConfigured } from '@/lib/shopify/config';

/**
 * Post-checkout thank-you page (client).
 *
 * On mount it:
 *  1. Requires a connected checkout and a return reference.
 *  2. Reads the pending-purchase snapshot saved before the Shopify redirect.
 *  3. Fires the `purchase` analytics event with the checkout reference.
 *  4. Clears the snapshot + the local cart after a real checkout return.
 *  5. Runs the GSAP staggered entrance.
 *
 * Direct visits without a snapshot render a graceful "no order" state.
 */
export function OrderConfirmedClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId =
    searchParams.get('order_id') ??
    searchParams.get('checkout_token') ??
    searchParams.get('id');
  const shopifyConfigured = isShopifyConfigured();
  const hasRealCheckoutReturn = shopifyConfigured && Boolean(orderId);
  const { clearCart } = useCart();
  const user = useAuthStore(s => s.user);

  const containerRef = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);
  const [purchase, setPurchase] = useState<PendingPurchase | null>(null);

  // ── Replay analytics + clean up after hydration ──────────────────
  useEffect(() => {
    const snapshot = getPendingPurchase();

    if (!hasRealCheckoutReturn) {
      // A local/demo visit must never turn a stale snapshot into a success
      // state. Keep the cart intact so browsing can continue.
      if (!shopifyConfigured) clearPendingPurchase();
      setPurchase(null);
      return;
    }

    if (snapshot && !firedRef.current) {
      firedRef.current = true;
      trackPurchase(
        snapshot.items,
        snapshot.total,
        orderId as string,
        snapshot.coupon
      );
      clearPendingPurchase();
      clearCart();
    }

    setPurchase(snapshot);
  }, [orderId, clearCart, hasRealCheckoutReturn]);

  // ── Entrance animation ───────────────────────────────────────────
  useEffect(() => {
    if (containerRef.current) {
      createOrderConfirmedEntrance(containerRef.current);
    }
  }, []);

  const firstName = user?.firstName ?? user?.name?.split(' ')[0];

  return (
    <div
      ref={containerRef}
      style={{ opacity: 0 }}
      className="min-h-[70vh] bg-background"
    >
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
        {purchase ? (
          <>
            {/* Success emblem */}
            <div
              data-confirm-reveal
              className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 ring-1 ring-accent/30"
            >
              <Check className="h-10 w-10 text-accent" strokeWidth={2.5} />
            </div>

            <p
              data-confirm-reveal
              className="text-xs font-semibold uppercase tracking-[0.3em] text-accent"
            >
              Order confirmed
            </p>

            <h1
              data-confirm-reveal
              className="mt-4 font-display text-3xl font-bold leading-tight text-foreground sm:text-5xl"
            >
              Thank you{firstName ? `, ${firstName}` : ''}!
            </h1>

            <p
              data-confirm-reveal
              className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground"
            >
              Your order is confirmed and on its way to being prepared. A
              confirmation email with tracking details is heading to your inbox.
            </p>

            {/* Order id + total */}
            <div
              data-confirm-reveal
              className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border"
            >
              <div className="bg-card/80 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Order ID
                </p>
                <p className="mt-1 font-display text-sm font-semibold text-foreground">
                  {orderId ?? `OH-${new Date(purchase.createdAt).getTime()}`}
                </p>
              </div>
              <div className="bg-card/80 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Total paid
                </p>
                <p className="mt-1 font-display text-sm font-semibold text-foreground">
                  {formatPrice(purchase.total, purchase.currency)}
                </p>
              </div>
            </div>

            {/* Purchased items */}
            <div
              data-confirm-reveal
              className="mt-6 overflow-hidden rounded-xl border border-border bg-card/40 text-left"
            >
              <div className="border-b border-border px-6 py-4">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <Package className="h-3.5 w-3.5" aria-hidden="true" />
                  {purchase.items.reduce(
                    (sum, it) => sum + (it.quantity ?? 1),
                    0
                  )}{' '}
                  items
                </p>
              </div>
              <ul className="divide-y divide-border">
                {purchase.items.map((item, i) => (
                  <li
                    key={`${item.item_id}-${i}`}
                    className="flex items-center justify-between gap-4 px-6 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.item_name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {item.item_category ?? 'OtakuSaga'} · qty{' '}
                        {item.quantity ?? 1}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-foreground">
                      {formatPrice(
                        (item.price ?? 0) * (item.quantity ?? 1),
                        item.currencyCode ?? purchase.currency
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div
              data-confirm-reveal
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <button
                type="button"
                onClick={() => router.push(ROUTES.home)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-8 py-3.5',
                  'bg-accent text-sm font-bold uppercase tracking-wider text-white',
                  'transition-all duration-300',
                  'hover:shadow-[0_0_30px_rgba(229,9,20,0.4)] hover:-translate-y-0.5 active:translate-y-0',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                )}
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                Continue Shopping
              </button>
              <button
                type="button"
                onClick={() => router.push(ROUTES.account.orders)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-8 py-3.5',
                  'bg-white/5 text-xs font-semibold uppercase tracking-wider text-zinc-300',
                  'transition-all duration-300',
                  'hover:-translate-y-0.5 hover:border-accent/50 hover:text-white active:translate-y-0',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                )}
              >
                View Order History
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              data-confirm-reveal
              className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-border"
            >
              <Package className="h-9 w-9 text-zinc-400" strokeWidth={1.8} />
            </div>

            <h1
              data-confirm-reveal
              className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl"
            >
              {shopifyConfigured
                ? 'No recent order found'
                : "Checkout isn't available in this demo"}
            </h1>

            <p
              data-confirm-reveal
              className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground"
            >
              {shopifyConfigured
                ? 'This page is reached right after a checkout. If you were sent here from an order email, your order details are available in your account.'
                : 'Your cart is local-only right now. Connect a store to enable payment, order creation, and confirmation tracking.'}
            </p>

            <div data-confirm-reveal className="mt-8">
              <button
                type="button"
                onClick={() => router.push(ROUTES.shop)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-8 py-3.5',
                  'bg-accent text-sm font-bold uppercase tracking-wider text-white',
                  'transition-all duration-300',
                  'hover:shadow-[0_0_30px_rgba(229,9,20,0.4)] hover:-translate-y-0.5 active:translate-y-0',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                )}
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                Browse Products
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
