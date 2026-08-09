import { NextRequest, NextResponse } from 'next/server';
import { shopifyRecoverPassword } from '@/lib/shopify/auth';
import { isShopifyConfigured } from '@/lib/shopify/config';

export const runtime = 'nodejs';

/**
 * POST /api/auth/forgot-password
 *   { "email": "fans@otakusaga.com" }
 *
 * Requests a Shopify password-reset email. Always returns success for known
 * addresses without leaking whether an account exists (Shopify does the
 * same). Returns 400 on invalid input, 503 when Shopify is not configured.
 */
export async function POST(request: NextRequest) {
  if (!isShopifyConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Shopify is not configured.' },
      { status: 503 }
    );
  }

  let body: { email?: unknown };
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

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: 'Please provide a valid email address.' },
      { status: 400 }
    );
  }

  try {
    const result = await shopifyRecoverPassword(email);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error ?? 'Unable to send reset email.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again later.' },
      { status: 502 }
    );
  }
}
