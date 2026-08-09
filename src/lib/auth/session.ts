// ─── Session resolution ──────────────────────────────────────────────
// Shared by the auth API routes: resolves the current request's cookie to
// a mapped UserProfile, or returns nulls when there is no session.

import { getAuthToken } from './cookies';
import { shopifyGetCustomer } from '@/lib/shopify/auth';
import { mapCustomerToProfile } from './profile';
import type { UserProfile } from '@/types/auth';

export interface SessionResult {
  /** Resolved profile, or null when there is no valid session. */
  user: UserProfile | null;
  /** Raw Shopify access token for the request, if the cookie existed. */
  token: string | null;
}

/**
 * Read the request cookie and resolve it to a customer profile.
 *
 * Returns `{ user: null, token }` when the token is present but invalid or
 * expired — callers can then clear the cookie. Throws are swallowed into a
 * null user so a Shopify outage never blocks page/route rendering.
 */
export async function getSessionProfile(): Promise<SessionResult> {
  const token = await getAuthToken();
  if (!token) return { user: null, token: null };

  try {
    const customer = await shopifyGetCustomer(token);
    if (!customer) return { user: null, token };
    return { user: mapCustomerToProfile(customer), token };
  } catch {
    return { user: null, token };
  }
}
