import { NextResponse } from 'next/server';
import { shopifyDeleteAddress, shopifyUpdateAddress } from '@/lib/shopify/auth';
import { isShopifyConfigured } from '@/lib/shopify/config';
import { getAuthToken } from '@/lib/auth/cookies';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

/**
 * Single-address mutations.
 *
 * PUT    /api/addresses/[id]  → update an address
 * DELETE /api/addresses/[id]  → remove an address
 *
 * Both return 503 when Shopify is not configured and 401 without a session.
 */
export async function PUT(req: Request, { params }: Params) {
  if (!isShopifyConfigured()) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const address = {
    address1:
      typeof body.address1 === 'string' ? body.address1.trim() : undefined,
    address2:
      typeof body.address2 === 'string' ? body.address2.trim() : undefined,
    city: typeof body.city === 'string' ? body.city.trim() : undefined,
    province:
      typeof body.province === 'string' ? body.province.trim() : undefined,
    country: typeof body.country === 'string' ? body.country.trim() : undefined,
    zip: typeof body.zip === 'string' ? body.zip.trim() : undefined,
    phone: typeof body.phone === 'string' ? body.phone.trim() : undefined,
    firstName:
      typeof body.firstName === 'string' ? body.firstName.trim() : undefined,
    lastName:
      typeof body.lastName === 'string' ? body.lastName.trim() : undefined,
    company: typeof body.company === 'string' ? body.company.trim() : undefined,
  };

  try {
    const result = await shopifyUpdateAddress(token, id, address);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ address: result.address });
  } catch {
    return NextResponse.json(
      { error: 'Could not update address' },
      { status: 502 }
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!isShopifyConfigured()) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await shopifyDeleteAddress(token, id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Could not delete address' },
      { status: 502 }
    );
  }
}
