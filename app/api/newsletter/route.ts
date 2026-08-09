import { NextRequest, NextResponse } from 'next/server';
import { createMarketingCustomer } from '@/lib/shopify/customer';
import { isShopifyConfigured } from '@/lib/shopify/config';

export const runtime = 'nodejs';

/**
 * Newsletter opt-in endpoint.
 *
 * POST /api/newsletter
 *   { "email": "fans@otakusaga.com", "firstName": "Fan", "source": "footer" }
 *
 * Behaviour:
 * • Validates the payload (email shape, length, one field at a time).
 * • When Shopify is configured, creates a marketing-accepting customer via
 *   the Storefront `customerCreate` mutation so the address propagates to
 *   connected marketing apps (Klaviyo, Mailchimp) through their own sync.
 * • When Shopify is NOT configured the app still returns success (the
 *   signup is logged server-side) so the premium UI is never broken in
 *   local/dev mode.
 *
 * Returns 200 on success, 400 on invalid input, 502 on Shopify failure.
 */
export async function POST(request: NextRequest) {
  let body: { email?: unknown; firstName?: unknown; source?: unknown };

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
  const firstName =
    typeof body.firstName === 'string' ? body.firstName.trim() : undefined;
  const source =
    typeof body.source === 'string'
      ? body.source.trim().slice(0, 40)
      : undefined;

  if (!email) {
    return NextResponse.json(
      { ok: false, error: 'Email is required.' },
      { status: 400 }
    );
  }

  // Cheap RFC-5322-ish shape check — no reliance on HTML5 input only.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: 'Please provide a valid email address.' },
      { status: 400 }
    );
  }

  if (firstName && firstName.length > 40) {
    return NextResponse.json(
      { ok: false, error: 'First name is too long.' },
      { status: 400 }
    );
  }

  // ── No Shopify configured: record locally, still succeed ─────────
  if (!isShopifyConfigured()) {
    console.info('[newsletter] signup (local mode)', {
      email,
      firstName,
      source,
    });
    return NextResponse.json({ ok: true });
  }

  // ── Shopify configured: create marketing-accepting customer ──────
  try {
    const result = await createMarketingCustomer(email, {
      firstName,
      tags: source ? ['newsletter', `source:${source}`] : ['newsletter'],
    });

    if (result.ok) {
      return NextResponse.json({ ok: true, customerId: result.customer?.id });
    }

    // customerUserErrors — e.g. an already-registered email is a hard error
    // from Shopify, so surface it as a 4xx the form can display.
    const message =
      result.error ?? 'Unable to subscribe. Please try again later.';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again later.' },
      { status: 502 }
    );
  }
}
