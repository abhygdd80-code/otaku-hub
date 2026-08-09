import { NextRequest, NextResponse } from 'next/server';
import { shopifySignup, shopifyGetCustomer } from '@/lib/shopify/auth';
import { isShopifyConfigured } from '@/lib/shopify/config';
import { setAuthCookie } from '@/lib/auth/cookies';
import { mapCustomerToProfile } from '@/lib/auth/profile';

export const runtime = 'nodejs';

/**
 * POST /api/auth/signup
 *   { "name": "Akira Fan", "email": "fans@otakusaga.com", "password": "••••••••" }
 *
 * Creates a customer (auto-login) and stores the resulting access token in
 * an HttpOnly cookie, returning the full profile.
 *
 * Returns 200 with { user }, 400 on validation/duplicate email, 503 when
 * Shopify is not configured.
 */
export async function POST(request: NextRequest) {
  if (!isShopifyConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Shopify is not configured.' },
      { status: 503 }
    );
  }

  let body: { name?: unknown; email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  const name =
    typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '';
  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!name || !email || !password) {
    return NextResponse.json(
      { ok: false, error: 'Name, email and password are required.' },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: 'Please provide a valid email address.' },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: 'Password must be at least 8 characters.' },
      { status: 400 }
    );
  }

  try {
    const result = await shopifySignup(name, email, password);

    if (!result.ok || !result.accessToken) {
      // Duplicate email and weak-password rejections arrive as
      // customerUserErrors — surface them as 4xx the form can display.
      const message = result.error ?? 'Unable to create your account.';
      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }

    const { accessToken } = result;
    await setAuthCookie(accessToken.accessToken, accessToken.expiresAt);

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
