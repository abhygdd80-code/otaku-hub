'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, PackageOpen, Truck } from 'lucide-react';
import { useAuthStore } from '@/store';
import type { CustomerOrder } from '@/types/auth';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants';

/**
 * Order history (client).
 *
 * Pulls the authenticated customer's orders from /api/orders (which reads
 * the HTTP-only auth cookie and queries Shopify). Renders order cards with
 * status badges, dates, totals, and a link to the per-order detail page.
 */
export function OrdersPageClient() {
  const user = useAuthStore(s => s.user);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/orders');
        const data = (await res.json()) as { orders: CustomerOrder[] };
        if (!cancelled) setOrders(data.orders ?? []);
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = user?.name ?? 'there';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-primary">
          Order History
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your purchases
          {displayName ? `, ${displayName.split(' ')[0]}` : ''}.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-4">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ul>
      )}
    </motion.div>
  );
}

// ─── Order Card ────────────────────────────────────────────────

function OrderCard({ order }: { order: CustomerOrder }) {
  const itemCount = order.lineItems.reduce((sum, it) => sum + it.quantity, 0);
  const orderDate = new Date(order.processedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <li>
      <Link
        href={`${ROUTES.account.orders}/${order.id.split('/').pop()}`}
        className={cn(
          'group block rounded-2xl bg-surface border border-border p-5 sm:p-6',
          'transition-all duration-300',
          'hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5'
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: order meta */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-sm font-bold text-primary">
                {order.name}
              </p>
              <StatusBadge status={order.fulfillmentStatus} />
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Placed {orderDate} · {itemCount}{' '}
              {itemCount === 1 ? 'item' : 'items'}
            </p>
            {order.fulfillments?.[0]?.trackingCompany && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-accent">
                <Truck className="h-3 w-3" aria-hidden="true" />
                {order.fulfillments[0].trackingCompany}
                {order.fulfillments[0].trackingNumber
                  ? ` · #${order.fulfillments[0].trackingNumber}`
                  : ''}
              </p>
            )}
          </div>

          {/* Right: total + preview */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <p className="font-display text-lg font-bold text-primary">
                {order.currencyCode} {order.totalPrice.toFixed(2)}
              </p>
              <p className="text-[11px] uppercase tracking-wider text-zinc-500">
                {order.financialStatus ?? 'Paid'}
              </p>
            </div>
            <LineItemPreviews items={order.lineItems} />
          </div>
        </div>
      </Link>
    </li>
  );
}

// ─── Status Badge ──────────────────────────────────────────────

function StatusBadge({ status }: { status?: string | null }) {
  const label = status ?? 'Ordered';
  const tone =
    label === 'FULFILLED'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : label === 'PARTIALLY_FULFILLED'
        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        : label === 'IN_PROGRESS'
          ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
          : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';

  const pretty = label
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
        tone
      )}
    >
      {pretty}
    </span>
  );
}

// ─── Line Item Previews ────────────────────────────────────────

function LineItemPreviews({ items }: { items: CustomerOrder['lineItems'] }) {
  const visible = items.slice(0, 3);
  const remaining = items.length - visible.length;

  return (
    <div className="flex items-center -space-x-3">
      {visible.map((item, i) =>
        item.image?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={item.image.url}
            alt={item.image.altText ?? item.title}
            className="h-11 w-11 rounded-lg object-cover border border-border bg-background"
          />
        ) : (
          <span
            key={i}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background"
            aria-hidden="true"
          >
            <Package className="h-4 w-4 text-zinc-500" />
          </span>
        )
      )}
      {remaining > 0 && (
        <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-[11px] font-bold text-zinc-400">
          +{remaining}
        </span>
      )}
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="rounded-2xl bg-surface border border-border px-6 py-16 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/60 ring-1 ring-border">
        <PackageOpen className="h-7 w-7 text-zinc-400" strokeWidth={1.6} />
      </div>
      <h2 className="font-display text-lg font-bold text-primary">
        No orders yet
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
        When you complete a purchase it will show up here with live tracking
        details.
      </p>
      <Link
        href={ROUTES.shop}
        className="mt-6 inline-flex items-center rounded-xl bg-accent px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:shadow-[0_0_30px_rgba(229,9,20,0.4)] hover:-translate-y-0.5"
      >
        Start Shopping
      </Link>
    </div>
  );
}
