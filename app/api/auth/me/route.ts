import { NextRequest, NextResponse } from 'next/server';
import {
  shopifyGetCustomer,
  shopifyLogout,
  shopifyUpdateCustomer,
} from '@/lib/shopify/auth';
import { isShopifyConfigured } from '@/lib/shopify/config';
import { clearAuthCookie, getAuthToken } from '@/lib/auth/cookies';
import { mapCustomerToProfile } from '@/lib/auth/profile';

export const runtime = 'nodejs';

/**
 * GET /api/auth/me — resolve the session cookie to a customer profile.
 * Returns 200 { user } when signed in, 401 { user: null } otherwise.
 */
export async function GET() {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const customer = await shopifyGetCustomer(token);
    if (!customer) {
      // Token is invalid/expired — drop the dead cookie.
      await clearAuthCookie();
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user: mapCustomerToProfile(customer) });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}

/**
 * PUT /api/auth/me — update mutable profile fields.
 *   { "firstName": "Akira", "lastName": "Tanaka", "email": "…", "phone": "…" }
 * Returns 200 { user } with the refreshed profile, 400/401/502 on failure.
 */
export async function PUT(request: NextRequest) {
  if (!isShopifyConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Shopify is not configured.' },
      { status: 503 }
    );
  }

  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json(
      { ok: false, error: 'You must be signed in.' },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  const patch: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    acceptsMarketing?: boolean;
  } = {};
  for (const field of ['firstName', 'lastName', 'email', 'phone'] as const) {
    if (typeof body[field] === 'string') {
      patch[field] = (body[field] as string).trim().slice(0, 80);
    }
  }
  if (typeof body.acceptsMarketing === 'boolean') {
    patch.acceptsMarketing = body.acceptsMarketing;
  }
  if (patch.email && patch.email.length > 254) {
    return NextResponse.json(
      { ok: false, error: 'Please provide a valid email address.' },
      { status: 400 }
    );
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Nothing to update.' },
      { status: 400 }
    );
  }

  try {
    const result = await shopifyUpdateCustomer(token, patch);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error ?? 'Unable to update profile.' },
        { status: 400 }
      );
    }

    const customer = await shopifyGetCustomer(token);
    if (!customer) {
      return NextResponse.json(
        { ok: false, error: 'Unable to reload your profile.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: mapCustomerToProfile(customer),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again later.' },
      { status: 502 }
    );
  }
}

/**
 * DELETE /api/auth/me — alias for logout (clears the session cookie).
 */
export async function DELETE() {
  const token = await getAuthToken();
  if (token && isShopifyConfigured()) {
    try {
      await shopifyLogout(token);
    } catch {
      // Best-effort revocation; cookie is cleared regardless.
    }
  }
  await clearAuthCookie();
  return NextResponse.json({ ok: true });
}
