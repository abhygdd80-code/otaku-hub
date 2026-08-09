// ─── HTTP-only session cookie helpers ────────────────────────────────
// The Shopify customer access token never reaches the client bundle —
// it lives in an HttpOnly cookie that only the API routes read/write.

import { cookies } from 'next/headers';

export const AUTH_COOKIE_NAME = 'otaku-customer-token';
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days — Shopify default expiry

/** Read the session token for the current request, if present. */
export async function getAuthToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(AUTH_COOKIE_NAME)?.value ?? null;
}

/** Persist a fresh token, expiring it at Shopify's own expiry time. */
export async function setAuthCookie(
  token: string,
  expiresAt: string
): Promise<void> {
  const store = await cookies();
  const msUntilExpiry = new Date(expiresAt).getTime() - Date.now();
  const maxAge = Math.max(
    Math.floor(msUntilExpiry / 1000),
    Math.min(60 * 60, MAX_AGE_SECONDS)
  );

  store.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.min(maxAge, MAX_AGE_SECONDS),
  });
}

/** Invalidate the session cookie (used by logout + expired-token handling). */
export async function clearAuthCookie(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE_NAME);
}
