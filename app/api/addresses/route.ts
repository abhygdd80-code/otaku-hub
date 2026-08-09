import { NextResponse } from 'next/server';
import { shopifyCreateAddress, shopifyGetCustomer } from '@/lib/shopify/auth';
import { isShopifyConfigured } from '@/lib/shopify/config';
import { getAuthToken } from '@/lib/auth/cookies';

export const runtime = 'nodejs';

/**
 * Address book API.
 *
 * GET  /api/addresses         → the authenticated customer's addresses
 * POST /api/addresses         → create a new address
 *
 * Both return 503 when Shopify is not configured and 401 when there is no
 * valid session cookie.
 */
export async function GET() {
  if (!isShopifyConfigured()) {
    return NextResponse.json({ addresses: [] }, { status: 503 });
  }

  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const customer = await shopifyGetCustomer(token);
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      addresses: customer.addresses.edges.map(edge => edge.node),
      defaultAddress: customer.defaultAddress,
    });
  } catch {
    return NextResponse.json(
      { error: 'Could not load addresses' },
      { status: 502 }
    );
  }
}

export async function POST(req: Request) {
  if (!isShopifyConfigured()) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const address = {
    address1: typeof body.address1 === 'string' ? body.address1.trim() : '',
    address2:
      typeof body.address2 === 'string' ? body.address2.trim() : undefined,
    city: typeof body.city === 'string' ? body.city.trim() : '',
    province:
      typeof body.province === 'string' ? body.province.trim() : undefined,
    country: typeof body.country === 'string' ? body.country.trim() : '',
    zip: typeof body.zip === 'string' ? body.zip.trim() : '',
    phone: typeof body.phone === 'string' ? body.phone.trim() : undefined,
    firstName:
      typeof body.firstName === 'string' ? body.firstName.trim() : undefined,
    lastName:
      typeof body.lastName === 'string' ? body.lastName.trim() : undefined,
    company: typeof body.company === 'string' ? body.company.trim() : undefined,
  };

  if (!address.address1 || !address.city || !address.country || !address.zip) {
    return NextResponse.json(
      { error: 'Address, city, country and zip are required.' },
      { status: 400 }
    );
  }

  try {
    const result = await shopifyCreateAddress(token, address);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ address: result.address }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Could not save address' },
      { status: 502 }
    );
  }
}
