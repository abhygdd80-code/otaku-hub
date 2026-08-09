import { NextRequest, NextResponse } from 'next/server';
import { isShopifyConfigured } from '@/lib/shopify/config';
import { getAuthToken } from '@/lib/auth/cookies';
import {
  getCustomerWishlist,
  setCustomerWishlist,
  sanitizeHandles,
} from '@/lib/wishlist-store';

export const runtime = 'nodejs';

/**
 * GET /api/wishlist — the authenticated customer's saved wishlist handles.
 *
 * Returns 200 { handles: string[] }. Degrades to an empty list when Shopify
 * is not configured, there is no session, or the metafield can't be read —
 * the client treats this as "nothing saved" and stays on local state.
 */
export async function GET() {
  if (!isShopifyConfigured()) {
    return NextResponse.json({ handles: [] });
  }

  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ handles: [] });
  }

  try {
    const handles = await getCustomerWishlist(token);
    return NextResponse.json({ handles });
  } catch {
    // A failed Shopify read must NOT masquerade as an empty wishlist —
    // the client uses a non-200 response to abort the login merge and
    // prevent overwriting a customer's saved list with the (possibly
    // empty) guest list.
    return NextResponse.json(
      { ok: false, handles: [], error: 'Unable to read wishlist.' },
      { status: 502 }
    );
  }
}

/**
 * PUT /api/wishlist — replace the authenticated customer's saved wishlist.
 *   { "handles": ["demon-slayer-tee", "jujutsu-kaisen-hoodie"] }
 *
 * Returns 200 { ok, handles } on success, 401 when signed out, 503 when
 * Shopify is not configured, 400/502 on other failures.
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

  let body: { handles?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.handles)) {
    return NextResponse.json(
      { ok: false, error: 'A "handles" array is required.' },
      { status: 400 }
    );
  }

  const handles = sanitizeHandles(body.handles);

  try {
    const result = await setCustomerWishlist(token, handles);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error ?? 'Unable to save wishlist.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, handles });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again later.' },
      { status: 502 }
    );
  }
}
