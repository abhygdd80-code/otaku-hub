// ─── Wishlist persistence (server) ──────────────────────────────────
// Persists a customer's wishlist as a JSON-array metafield (`custom.wishlist`)
// on the Shopify customer. This is the server-side source of truth that the
// Zustand store synchronizes against so a wishlist survives across devices
// and can be merged with a guest wishlist on login.
//
// All functions degrade gracefully: a missing/restricted metafield or a
// Shopify outage surfaces as an empty list / failed write, and the client
// keeps working from localStorage.

import { shopifyFetch } from './shopify/client';
import {
  CUSTOMER_WISHLIST_QUERY,
  CUSTOMER_WISHLIST_UPDATE_MUTATION,
} from './shopify/queries';
import type {
  CustomerWishlistQueryResponse,
  CustomerWishlistUpdateResponse,
} from './shopify/types';

// ─── Constants ──────────────────────────────────────────────────────

export const WISHLIST_METAFIELD = {
  namespace: 'custom',
  key: 'wishlist',
} as const;

/** Upper bound on the number of handles persisted per customer. */
export const MAX_WISHLIST_HANDLES = 200;

/** Max characters for a single product handle. */
const MAX_HANDLE_LENGTH = 100;

// ─── Helpers ───────────────────────────────────────────────────────

/** Normalize untrusted input into a clean, deduped handle list. */
export function sanitizeHandles(handles: unknown): string[] {
  if (!Array.isArray(handles)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of handles) {
    if (typeof item !== 'string') continue;
    const handle = item.trim();
    if (!handle || handle.length > MAX_HANDLE_LENGTH) continue;
    if (seen.has(handle)) continue;
    seen.add(handle);
    out.push(handle);
    if (out.length >= MAX_WISHLIST_HANDLES) break;
  }
  return out;
}

/** Parse the JSON-array value stored on the wishlist metafield. */
function parseHandles(value: string | undefined | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return sanitizeHandles(parsed);
  } catch {
    return [];
  }
}

// ─── Read ──────────────────────────────────────────────────────────

/**
 * Fetch the customer's saved wishlist handles.
 *
 * @returns the saved handles, or `[]` when there is no wishlist metafield.
 * @throws {ShopifyError} on transport-level failures.
 */
export async function getCustomerWishlist(token: string): Promise<string[]> {
  const data = await shopifyFetch<CustomerWishlistQueryResponse>(
    CUSTOMER_WISHLIST_QUERY,
    { customerAccessToken: token },
    { revalidate: 0 }
  );

  const customer = data.customer;
  if (!customer) return [];

  const node = customer.metafields.edges.find(
    edge => edge.node.key === WISHLIST_METAFIELD.key
  )?.node;

  return parseHandles(node?.value);
}

// ─── Write ─────────────────────────────────────────────────────────

export interface WishlistWriteResult {
  ok: boolean;
  error?: string;
}

/**
 * Replace the customer's saved wishlist with the given handles.
 *
 * @throws {ShopifyError} on transport-level failures (callers decide how
 *   to surface those — the route returns a 502).
 */
export async function setCustomerWishlist(
  token: string,
  handles: string[]
): Promise<WishlistWriteResult> {
  const clean = sanitizeHandles(handles);

  const data = await shopifyFetch<CustomerWishlistUpdateResponse>(
    CUSTOMER_WISHLIST_UPDATE_MUTATION,
    {
      customerAccessToken: token,
      customer: {
        metafields: [
          {
            namespace: WISHLIST_METAFIELD.namespace,
            key: WISHLIST_METAFIELD.key,
            value: JSON.stringify(clean),
          },
        ],
      },
    },
    { revalidate: 0 }
  );

  const { customer, customerUserErrors } = data.customerUpdate;

  if (customer) return { ok: true };

  const message = customerUserErrors[0]?.message ?? 'Unable to save wishlist.';
  return { ok: false, error: message };
}
