import { NextResponse } from 'next/server';
import { shopifySetDefaultAddress } from '@/lib/shopify/auth';
import { isShopifyConfigured } from '@/lib/shopify/config';
import { getAuthToken } from '@/lib/auth/cookies';

export const runtime = 'nodejs';

/**
 * PUT /api/addresses/default
 *
 * Marks an existing address as the customer's default shipping address.
 * Body: { id: "<address GID>" }. 503 when not configured, 401 without a
 * valid session.
 */
export async function PUT(req: Request) {
  if (!isShopifyConfigured()) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { id?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  if (typeof body.id !== 'string' || !body.id) {
    return NextResponse.json(
      { error: 'Address id is required.' },
      { status: 400 }
    );
  }

  try {
    const result = await shopifySetDefaultAddress(token, body.id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Could not set default address' },
      { status: 502 }
    );
  }
}
