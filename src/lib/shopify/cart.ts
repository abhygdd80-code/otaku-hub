// ─── Shopify Cart API ──────────────────────────────────────────────
// CRUD operations against the Shopify Storefront Cart API.
//
// The existing `CartContext` remains the single source of truth for the
// drawer; when Shopify is configured the context delegates mutations
// here in the background and falls back to local-only on any error.
//
// A persisted `cartId` in localStorage ties the session to a single
// Shopify Cart so state survives page reloads.

import { shopifyFetch } from './client';
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_QUERY,
} from './queries';
import type {
  ShopifyCart,
  ShopifyCartLineInput,
  CartCreateResponse,
  CartLinesAddResponse,
  CartLinesUpdateResponse,
  CartLinesRemoveResponse,
  CartQueryResponse,
} from './types';

// ─── localStorage helpers ──────────────────────────────────────────

const CART_ID_KEY = 'otaku-shopify-cart-id';
const CHECKOUT_URL_KEY = 'otaku-shopify-checkout-url';

/** Persisted Shopify Cart ID for the current session. */
export function getCartId(): string | null {
  try {
    return localStorage.getItem(CART_ID_KEY);
  } catch {
    return null;
  }
}

export function setCartId(id: string): void {
  try {
    localStorage.setItem(CART_ID_KEY, id);
  } catch {
    // Storage quota or private browsing — silently degrade.
  }
}

export function clearCartId(): void {
  try {
    localStorage.removeItem(CART_ID_KEY);
    localStorage.removeItem(CHECKOUT_URL_KEY);
  } catch {
    // Ignore.
  }
}

/** Persisted checkout URL for quick access (avoids fetching the cart). */
export function getCheckoutUrl(): string | null {
  try {
    return localStorage.getItem(CHECKOUT_URL_KEY);
  } catch {
    return null;
  }
}

function storeCheckoutUrl(url: string): void {
  try {
    localStorage.setItem(CHECKOUT_URL_KEY, url);
  } catch {
    // Ignore.
  }
}

// ─── Helpers ───────────────────────────────────────────────────────

function extractCart(
  responseData: Record<string, unknown>
): ShopifyCart | null {
  const top = Object.values(responseData)[0] as
    | {
        cart?: ShopifyCart | null;
        userErrors?: { field?: string; message: string }[];
      }
    | undefined;

  if (!top) return null;
  if (top.userErrors && top.userErrors.length > 0) {
    const messages = top.userErrors.map(e => e.message).join('; ');
    console.warn(`[Shopify Cart] user errors: ${messages}`);
  }
  return top.cart ?? null;
}

// ─── Cart operations ──────────────────────────────────────────────

/**
 * Create a brand-new Shopify Cart and persist its ID.
 * Returns the cart object, or null on any failure.
 */
export async function createShopifyCart(
  lines: ShopifyCartLineInput[]
): Promise<ShopifyCart | null> {
  try {
    const data = await shopifyFetch<CartCreateResponse>(CART_CREATE_MUTATION, {
      input: { lines },
    });
    const cart = extractCart(data as unknown as Record<string, unknown>);
    if (cart) {
      setCartId(cart.id);
      storeCheckoutUrl(cart.checkoutUrl);
    }
    return cart;
  } catch (error) {
    console.warn('[Shopify Cart] create failed, falling back to local.', error);
    return null;
  }
}

/**
 * Add lines to the existing Shopify Cart (or create one if none exists).
 */
export async function addShopifyCartLines(
  lines: ShopifyCartLineInput[]
): Promise<ShopifyCart | null> {
  const cartId = getCartId();
  if (!cartId) {
    return createShopifyCart(lines);
  }

  try {
    const data = await shopifyFetch<CartLinesAddResponse>(
      CART_LINES_ADD_MUTATION,
      { cartId, lines }
    );
    const cart = extractCart(data as unknown as Record<string, unknown>);
    if (cart) storeCheckoutUrl(cart.checkoutUrl);
    return cart;
  } catch {
    // Cart may have been voided server-side — recreate once.
    return createShopifyCart(lines);
  }
}

/**
 * Update quantities of existing lines.
 */
export async function updateShopifyCartLines(
  lines: { id: string; quantity: number }[]
): Promise<ShopifyCart | null> {
  const cartId = getCartId();
  if (!cartId) return null;

  try {
    const data = await shopifyFetch<CartLinesUpdateResponse>(
      CART_LINES_UPDATE_MUTATION,
      { cartId, lines }
    );
    const cart = extractCart(data as unknown as Record<string, unknown>);
    if (cart) storeCheckoutUrl(cart.checkoutUrl);
    return cart;
  } catch (error) {
    console.warn('[Shopify Cart] update failed.', error);
    return null;
  }
}

/**
 * Remove lines from the Shopify Cart.
 */
export async function removeShopifyCartLines(
  lineIds: string[]
): Promise<ShopifyCart | null> {
  const cartId = getCartId();
  if (!cartId) return null;

  try {
    const data = await shopifyFetch<CartLinesRemoveResponse>(
      CART_LINES_REMOVE_MUTATION,
      { cartId, lineIds }
    );
    const cart = extractCart(data as unknown as Record<string, unknown>);
    if (cart) storeCheckoutUrl(cart.checkoutUrl);
    return cart;
  } catch (error) {
    console.warn('[Shopify Cart] remove failed.', error);
    return null;
  }
}

/**
 * Fetch the current Shopify Cart by its persisted ID.
 * Returns null when no cart is stored.
 */
export async function fetchShopifyCart(): Promise<ShopifyCart | null> {
  const cartId = getCartId();
  if (!cartId) return null;

  try {
    const data = await shopifyFetch<CartQueryResponse>(CART_QUERY, { cartId });
    const cart = data.cart;
    if (cart) storeCheckoutUrl(cart.checkoutUrl);
    return cart;
  } catch {
    clearCartId();
    return null;
  }
}
