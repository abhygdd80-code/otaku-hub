// ─── Shopify Customer Auth API ──────────────────────────────────────
// Thin wrappers over the Storefront API auth mutations. Every function
// returns a typed result and throws only on transport-level failures
// (callers — the API routes — decide how to surface those).
//
// Feature-gating: these are only invoked by routes that already checked
// `isShopifyConfigured()`, so no guard is duplicated here.

import { shopifyFetch } from './client';
import {
  CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
  CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION,
  CUSTOMER_ADDRESS_CREATE_MUTATION,
  CUSTOMER_ADDRESS_DELETE_MUTATION,
  CUSTOMER_ADDRESS_UPDATE_MUTATION,
  CUSTOMER_CREATE_MUTATION,
  CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION,
  CUSTOMER_RECOVER_MUTATION,
  CUSTOMER_UPDATE_MUTATION,
  CUSTOMER_QUERY,
} from './queries';
import type {
  CustomerAccessTokenCreateResponse,
  CustomerAccessTokenDeleteResponse,
  CustomerAddressCreateResponse,
  CustomerAddressDeleteResponse,
  CustomerAddressUpdateResponse,
  CustomerCreateResponse,
  CustomerDefaultAddressUpdateResponse,
  CustomerQueryResponse,
  CustomerRecoverResponse,
  CustomerUpdateResponse,
  ShopifyCustomerAccessToken,
  ShopifyCustomerAddress,
  ShopifyCustomerProfile,
  ShopifyMailingAddressInput,
} from './types';

// ─── Result shapes ──────────────────────────────────────────────────

export interface AuthTokenResult {
  ok: boolean;
  accessToken?: ShopifyCustomerAccessToken;
  error?: string;
}

export interface RecoverResult {
  ok: boolean;
  error?: string;
}

// ─── Login ──────────────────────────────────────────────────────────

/**
 * Exchange email + password for a customer access token.
 *
 * @throws {ShopifyError} on transport-level failures.
 */
export async function shopifyLogin(
  email: string,
  password: string
): Promise<AuthTokenResult> {
  const data = await shopifyFetch<CustomerAccessTokenCreateResponse>(
    CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
    { input: { email, password } }
  );

  const { customerAccessToken, customerUserErrors } =
    data.customerAccessTokenCreate;

  if (customerAccessToken) {
    return { ok: true, accessToken: customerAccessToken };
  }

  const message =
    customerUserErrors[0]?.message ?? 'Invalid email or password.';
  return { ok: false, error: message };
}

// ─── Signup ─────────────────────────────────────────────────────────

export interface ShopifySignupResult {
  ok: boolean;
  accessToken?: ShopifyCustomerAccessToken;
  error?: string;
}

/**
 * Create a customer then immediately exchange the password for a token
 * (auto-login) so signup and session start in one round-trip.
 *
 * @throws {ShopifyError} on transport-level failures.
 */
export async function shopifySignup(
  name: string,
  email: string,
  password: string
): Promise<ShopifySignupResult> {
  // The Storefront customerCreate input accepts firstName/lastName.
  const [firstName = '', lastName = ''] = name
    .trim()
    .split(/\s+/)
    .reduce<string[]>(
      (parts, word, i) => {
        if (i === 0) parts[0] = word;
        else parts[1] = parts[1] ? `${parts[1]} ${word}` : word;
        return parts;
      },
      ['', '']
    );

  const input: Record<string, unknown> = {
    email,
    password,
    acceptsMarketing: true,
  };
  if (firstName) input.firstName = firstName;
  if (lastName) input.lastName = lastName;

  const data = await shopifyFetch<CustomerCreateResponse>(
    CUSTOMER_CREATE_MUTATION,
    { input }
  );

  const { customer, customerUserErrors } = data.customerCreate;

  if (!customer) {
    const message =
      customerUserErrors[0]?.message ?? 'Could not create account.';
    return { ok: false, error: message };
  }

  // Auto-login with the same credentials.
  return shopifyLogin(email, password);
}

// ─── Password recovery ──────────────────────────────────────────────

/**
 * Ask Shopify to email a password-reset link to the customer.
 *
 * @throws {ShopifyError} on transport-level failures.
 */
export async function shopifyRecoverPassword(
  email: string
): Promise<RecoverResult> {
  const data = await shopifyFetch<CustomerRecoverResponse>(
    CUSTOMER_RECOVER_MUTATION,
    { email }
  );

  const { customerUserErrors } = data.customerRecover;

  // customerRecover returns success (200) even for unknown emails to avoid
  // leaking which addresses have accounts — treat "no errors" as success.
  if (customerUserErrors.length === 0) {
    return { ok: true };
  }

  const message = customerUserErrors[0]?.message ?? 'Unable to reset password.';
  return { ok: false, error: message };
}

// ─── Logout ─────────────────────────────────────────────────────────

/**
 * Revoke a customer access token server-side.
 *
 * @throws {ShopifyError} on transport-level failures.
 */
export async function shopifyLogout(token: string): Promise<{ ok: boolean }> {
  const data = await shopifyFetch<CustomerAccessTokenDeleteResponse>(
    CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION,
    { customerAccessToken: token }
  );

  const { userErrors } = data.customerAccessTokenDelete;
  return { ok: userErrors.length === 0 };
}

// ─── Profile ────────────────────────────────────────────────────────

/**
 * Fetch the full customer profile (profile + addresses + orders) for a
 * valid access token.
 *
 * @returns `null` when the token is invalid/expired.
 * @throws {ShopifyError} on transport-level failures.
 */
export async function shopifyGetCustomer(
  token: string
): Promise<ShopifyCustomerProfile | null> {
  const data = await shopifyFetch<CustomerQueryResponse>(
    CUSTOMER_QUERY,
    { customerAccessToken: token },
    { revalidate: 0 }
  );

  return data.customer;
}

// ─── Profile update ─────────────────────────────────────────────────

export interface ProfileUpdateResult {
  ok: boolean;
  error?: string;
}

/**
 * Update mutable profile fields (firstName/lastName/email) for a token.
 *
 * @throws {ShopifyError} on transport-level failures.
 */
export async function shopifyUpdateCustomer(
  token: string,
  patch: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    acceptsMarketing?: boolean;
  }
): Promise<ProfileUpdateResult> {
  const data = await shopifyFetch<CustomerUpdateResponse>(
    CUSTOMER_UPDATE_MUTATION,
    { customerAccessToken: token, customer: patch },
    { revalidate: 0 }
  );

  const { customer, customerUserErrors } = data.customerUpdate;

  if (customer) return { ok: true };

  const message = customerUserErrors[0]?.message ?? 'Unable to update profile.';
  return { ok: false, error: message };
}

// ─── Address book ───────────────────────────────────────────────────

export interface AddressResult {
  ok: boolean;
  address?: ShopifyCustomerAddress;
  error?: string;
}

export interface DeleteAddressResult {
  ok: boolean;
  error?: string;
}

/**
 * Create a new address on the customer's account.
 *
 * @throws {ShopifyError} on transport-level failures.
 */
export async function shopifyCreateAddress(
  token: string,
  address: ShopifyMailingAddressInput
): Promise<AddressResult> {
  const data = await shopifyFetch<CustomerAddressCreateResponse>(
    CUSTOMER_ADDRESS_CREATE_MUTATION,
    { customerAccessToken: token, address },
    { revalidate: 0 }
  );

  const { customerAddress, customerUserErrors } = data.customerAddressCreate;

  if (customerAddress) return { ok: true, address: customerAddress };

  const message = customerUserErrors[0]?.message ?? 'Unable to add address.';
  return { ok: false, error: message };
}

/**
 * Update an existing address by ID.
 *
 * @throws {ShopifyError} on transport-level failures.
 */
export async function shopifyUpdateAddress(
  token: string,
  id: string,
  address: ShopifyMailingAddressInput
): Promise<AddressResult> {
  const data = await shopifyFetch<CustomerAddressUpdateResponse>(
    CUSTOMER_ADDRESS_UPDATE_MUTATION,
    { customerAccessToken: token, id, address },
    { revalidate: 0 }
  );

  const { customerAddress, customerUserErrors } = data.customerAddressUpdate;

  if (customerAddress) return { ok: true, address: customerAddress };

  const message = customerUserErrors[0]?.message ?? 'Unable to update address.';
  return { ok: false, error: message };
}

/**
 * Delete an address by ID.
 *
 * @throws {ShopifyError} on transport-level failures.
 */
export async function shopifyDeleteAddress(
  token: string,
  id: string
): Promise<DeleteAddressResult> {
  const data = await shopifyFetch<CustomerAddressDeleteResponse>(
    CUSTOMER_ADDRESS_DELETE_MUTATION,
    { customerAccessToken: token, id },
    { revalidate: 0 }
  );

  const { customerUserErrors } = data.customerAddressDelete;

  if (customerUserErrors.length === 0) return { ok: true };

  const message = customerUserErrors[0]?.message ?? 'Unable to delete address.';
  return { ok: false, error: message };
}

/**
 * Mark an address as the customer's default.
 *
 * @throws {ShopifyError} on transport-level failures.
 */
export async function shopifySetDefaultAddress(
  token: string,
  addressId: string
): Promise<ProfileUpdateResult> {
  const data = await shopifyFetch<CustomerDefaultAddressUpdateResponse>(
    CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION,
    { customerAccessToken: token, addressId },
    { revalidate: 0 }
  );

  const { customer, customerUserErrors } = data.customerDefaultAddressUpdate;

  if (customer) return { ok: true };

  const message =
    customerUserErrors[0]?.message ?? 'Unable to set default address.';
  return { ok: false, error: message };
}
