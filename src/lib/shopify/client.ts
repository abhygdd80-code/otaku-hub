// ─── Shopify GraphQL Client ────────────────────────────────────────
// Minimal, type-safe fetch wrapper around the Shopify Storefront API.
//
// Features:
// • Typed request/response via a generic `shopifyFetch<T>`.
// • Automatic retry with exponential backoff for transient network errors.
// • Request timeout via AbortController (never hang a page render).
// • Distinguishes GraphQL errors from network errors.
// • Server-side caching via Next `revalidate` (default 1 hour) so static
//   pages are generated from cached Shopify data; client-side requests use
//   `no-store` so the catalog is always fresh per session.

import { getShopifyConfig } from './config';

// ─── Constants ──────────────────────────────────────────────────────

/** How long to wait for a Shopify response before giving up (ms). */
const REQUEST_TIMEOUT_MS = 10_000;

/** Retry delays between attempts — exponential backoff (ms). */
const RETRY_DELAYS = [500, 1_500];

/** Default server-side revalidation window for Shopify fetches (seconds). */
export const DEFAULT_REVALIDATE = 3_600;

// ─── Error types ───────────────────────────────────────────────────

export interface ShopifyGraphQLErrorItem {
  message: string;
  locations?: { line: number; column: number }[];
  path?: (string | number)[];
  extensions?: Record<string, unknown>;
}

/**
 * Thrown when a Shopify request fails. Carries the HTTP status and any
 * GraphQL-level errors so callers can decide whether to fall back.
 */
export class ShopifyError extends Error {
  readonly status?: number;
  readonly graphQLErrors: ShopifyGraphQLErrorItem[];

  constructor(
    message: string,
    options: {
      status?: number;
      graphQLErrors?: ShopifyGraphQLErrorItem[];
      cause?: unknown;
    } = {}
  ) {
    super(message, { cause: options.cause });
    this.name = 'ShopifyError';
    this.status = options.status;
    this.graphQLErrors = options.graphQLErrors ?? [];
  }
}

// ─── Client helpers ────────────────────────────────────────────────

interface ShopifyFetchOptions {
  /** Cache/revalidation strategy. Defaults to server `revalidate` behavior. */
  revalidate?: number;
  /** Fetch-level cache mode override (used by client-side calls). */
  cache?: RequestCache;
  /** Number of retry attempts on transient failures. */
  attempts?: number;
}

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const isServer = (): boolean => typeof window === 'undefined';

/**
 * Perform a GraphQL request against the Shopify Storefront API.
 *
 * @param query   GraphQL query or mutation string.
 * @param variables Variables object (optional).
 * @param options Request options.
 * @returns The `data` object from the response, typed by the caller.
 *
 * @throws {ShopifyError} when the request fails after retries, the response
 *   contains GraphQL errors, or Shopify is not configured.
 */
export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: ShopifyFetchOptions = {}
): Promise<T> {
  const config = getShopifyConfig();
  if (!config) {
    throw new ShopifyError('Shopify is not configured.');
  }

  const attempts = options.attempts ?? RETRY_DELAYS.length + 1;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) {
      await sleep(RETRY_DELAYS[Math.min(attempt - 1, RETRY_DELAYS.length - 1)]);
    }

    try {
      return await execute<T>(
        config.apiUrl,
        config.storefrontAccessToken,
        query,
        variables,
        options
      );
    } catch (error) {
      lastError = error;
      // Only retry transient network failures — not GraphQL/HTTP errors,
      // which are deterministic and would just burn the retry budget.
      if (
        error instanceof ShopifyError &&
        (error.status !== undefined || error.graphQLErrors.length > 0)
      ) {
        throw error;
      }
    }
  }

  throw new ShopifyError('Shopify request failed after retries.', {
    cause: lastError,
  });
}

async function execute<T>(
  apiUrl: string,
  token: string,
  query: string,
  variables: Record<string, unknown> | undefined,
  options: ShopifyFetchOptions
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const init: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    };

    // Server-side: let Next cache the fetch (revalidate). Client-side:
    // always fetch fresh from the client module cache.
    if (isServer()) {
      init.next = {
        revalidate: options.revalidate ?? DEFAULT_REVALIDATE,
      };
    } else {
      init.cache = options.cache ?? 'no-store';
    }

    const response = await fetch(apiUrl, init);

    const payload = (await response.json()) as {
      data?: T;
      errors?: ShopifyGraphQLErrorItem[];
    };

    if (!response.ok) {
      throw new ShopifyError(
        `Shopify responded with HTTP ${response.status}.`,
        { status: response.status }
      );
    }

    if (payload.errors && payload.errors.length > 0) {
      const messages = payload.errors.map(e => e.message).join('; ');
      throw new ShopifyError(`Shopify GraphQL error: ${messages}`, {
        graphQLErrors: payload.errors,
      });
    }

    if (!payload.data) {
      throw new ShopifyError('Shopify returned an empty response.');
    }

    return payload.data;
  } catch (error) {
    if (error instanceof ShopifyError) throw error;

    // AbortController throws a DOMException on timeout — wrap it clearly.
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ShopifyError('Shopify request timed out.', { cause: error });
    }

    throw new ShopifyError('Network error while contacting Shopify.', {
      cause: error,
    });
  } finally {
    clearTimeout(timeout);
  }
}
