import { NextResponse } from 'next/server';
import { shopifyGetCustomer } from '@/lib/shopify/auth';
import { isShopifyConfigured } from '@/lib/shopify/config';
import { getAuthToken } from '@/lib/auth/cookies';

export const runtime = 'nodejs';

/**
 * GET /api/orders
 *
 * Returns the authenticated customer's orders as a JSON array. Falls back
 * to an empty array when Shopify is not configured or the session is
 * invalid — the client uses this as the source of truth for order history.
 */
export async function GET() {
  if (!isShopifyConfigured()) {
    return NextResponse.json({ orders: [] });
  }

  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ orders: [] });
  }

  try {
    const customer = await shopifyGetCustomer(token);
    if (!customer) {
      return NextResponse.json({ orders: [] });
    }

    return NextResponse.json({ orders: customer.orders });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}
