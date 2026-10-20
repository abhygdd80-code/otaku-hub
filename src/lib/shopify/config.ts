// ─── Shopify Configuration ─────────────────────────────────────────
// Central feature-flag + config for the Shopify Storefront API.
//
// The app ships with a complete local catalog so it is fully functional
// before commerce integration. Shopify is opt-in: the explicit enable flag
// must be true as well as both connection values being present. This prevents
// credentials left in a development environment from silently switching the
// storefront away from local, truthful launch mode.
//
//   NEXT_PUBLIC_ENABLE_SHOPIFY                true to opt into integration
//   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN           e.g. otaku-hub.myshopify.com
//   NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN public Storefront API token
//
// `NEXT_PUBLIC_*` vars are inlined at build time, so this flag is safe to
// read from both server components and client components.

/** Default Storefront API version. Override with SHOPIFY_API_VERSION. */
const DEFAULT_API_VERSION = '2025-07';

export interface ShopifyConfig {
  /** Storefront domain without protocol/trailing slash, e.g. "otaku-hub.myshopify.com" */
  storeDomain: string;
  /** Public Storefront API access token */
  storefrontAccessToken: string;
  /** Full GraphQL endpoint URL */
  apiUrl: string;
  /** Storefront API version, e.g. "2025-07" */
  apiVersion: string;
}

/** Normalize a raw domain string into a clean "host.example" value. */
function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '');
}

/**
 * Resolve the Shopify configuration from the environment.
 * Returns `null` (not configured) unless the explicit enable flag and both
 * required connection values are present.
 */
export function getShopifyConfig(): ShopifyConfig | null {
  if (process.env.NEXT_PUBLIC_ENABLE_SHOPIFY !== 'true') return null;

  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim();
  const storefrontAccessToken =
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();

  if (!storeDomain || !storefrontAccessToken) return null;

  const domain = normalizeDomain(storeDomain);
  const apiVersion =
    process.env.SHOPIFY_API_VERSION?.trim() || DEFAULT_API_VERSION;

  return {
    storeDomain: domain,
    storefrontAccessToken,
    apiUrl: `https://${domain}/api/${apiVersion}/graphql.json`,
    apiVersion,
  };
}

/**
 * True when a real Shopify storefront is configured.
 * All Shopify integration code paths are gated behind this check so the
 * app degrades gracefully to the built-in catalog when it returns false.
 */
export function isShopifyConfigured(): boolean {
  return getShopifyConfig() !== null;
}
