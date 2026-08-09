// ─── Shopify Customer API (newsletter opt-in) ───────────────────────
// Creates a customer with `acceptsMarketing: true` so newsletter signups
// land in the store's customer list and propagate to any connected
// marketing app (Klaviyo, Mailchimp) via their own sync. Only called
// when `isShopifyConfigured()` is true; otherwise signups are recorded
// locally and logged.

import { shopifyFetch } from './client';
import { CUSTOMER_CREATE_MUTATION } from './queries';
import type { CustomerCreateResponse, ShopifyCustomer } from './types';

export interface NewsletterSignupResult {
  ok: boolean;
  /** Created customer (Shopify id + email) when the store accepted it. */
  customer?: ShopifyCustomer;
  /** Human-readable error message on failure. */
  error?: string;
}

/**
 * Register a newsletter email as a marketing-accepting customer.
 *
 * @throws {ShopifyError} on transport-level failures (callers fall back).
 */
export async function createMarketingCustomer(
  email: string,
  options: { firstName?: string; tags?: string[] } = {}
): Promise<NewsletterSignupResult> {
  const input: Record<string, unknown> = {
    email,
    acceptsMarketing: true,
  };
  if (options.firstName) input.firstName = options.firstName;
  if (options.tags && options.tags.length > 0) input.tags = options.tags;

  const data = await shopifyFetch<CustomerCreateResponse>(
    CUSTOMER_CREATE_MUTATION,
    { input }
  );

  const { customer, customerUserErrors } = data.customerCreate;

  if (customer) {
    return { ok: true, customer };
  }

  const message =
    customerUserErrors[0]?.message ?? 'Could not create customer.';
  return { ok: false, error: message };
}
