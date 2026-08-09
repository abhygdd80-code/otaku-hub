import { NextRequest, NextResponse } from 'next/server';
import { shopifyLogout } from '@/lib/shopify/auth';
import { isShopifyConfigured } from '@/lib/shopify/config';
import { clearAuthCookie, getAuthToken } from '@/lib/auth/cookies';

export const runtime = 'nodejs';

/**
 * POST /api/auth/logout
 *
 * Revokes the Shopify customer access token (best-effort) and clears the
 * HttpOnly session cookie. Always resolves the client to a signed-out state.
 */
export async function POST(_request: NextRequest) {
  const token = await getAuthToken();

  if (token && isShopifyConfigured()) {
    try {
      await shopifyLogout(token);
    } catch {
      // Revocation is best-effort — the cookie must still be cleared so the
      // client reaches a consistent signed-out state even if Shopify errors.
    }
  }

  await clearAuthCookie();

  return NextResponse.json({ ok: true });
}
