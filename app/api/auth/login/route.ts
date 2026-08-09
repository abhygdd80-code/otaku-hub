import { NextRequest, NextResponse } from 'next/server';
import { shopifyLogin, shopifyGetCustomer } from '@/lib/shopify/auth';
import { isShopifyConfigured } from '@/lib/shopify/config';
import { setAuthCookie } from '@/lib/auth/cookies';
import { mapCustomerToProfile } from '@/lib/auth/profile';

export const runtime = 'nodejs';

/**
 * POST /api/auth/login
 *   { "email": "fans@otakusaga.com", "password": "••••••••" }
 *
 * Exchanges credentials for a Shopify customer access token, stores it in an
 * HttpOnly cookie, and returns the full customer profile.
 *
 * Returns 200 with { user } on success, 401 on bad credentials, 503 when
 * Shopify is not configured (client falls back to local mock auth).
 */
export async function POST(request: NextRequest) {
  if (!isShopifyConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Shopify is not configured.' },
      { status: 503 }
    );
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: 'Email and password are required.' },
      { status: 400 }
    );
  }
  if (email.length > 254) {
    return NextResponse.json(
      { ok: false, error: 'Please provide a valid email address.' },
      { status: 400 }
    );
  }

  try {
    const result = await shopifyLogin(email, password);

    if (!result.ok || !result.accessToken) {
      return NextResponse.json(
        { ok: false, error: result.error ?? 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const { accessToken } = result;
    await setAuthCookie(accessToken.accessToken, accessToken.expiresAt);

    // Resolve the full profile in the same request so the client has
    // everything it needs without a follow-up round-trip.
    const customer = await shopifyGetCustomer(accessToken.accessToken);
    if (!customer) {
      return NextResponse.json(
        { ok: false, error: 'Unable to load your account.' },
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
