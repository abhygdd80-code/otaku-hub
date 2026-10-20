import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

const MAX_REVALIDATION_BODY_BYTES = 1_048_576;

/** Read the raw webhook body without allowing an unbounded request body. */
async function readLimitedBody(request: NextRequest): Promise<string | null> {
  const contentLength = request.headers.get('content-length');
  if (contentLength !== null) {
    const parsedLength = Number(contentLength);
    if (
      !Number.isFinite(parsedLength) ||
      parsedLength > MAX_REVALIDATION_BODY_BYTES
    ) {
      return null;
    }
  }

  const reader = request.body?.getReader();
  if (!reader) return '';

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_REVALIDATION_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bodyBytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bodyBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(bodyBytes);
}

/**
 * POST /api/revalidate
 *
 * Secure webhook endpoint for Shopify to trigger cache revalidation
 * when products or collections are updated.
 *
 * Security:
 * - Validates the `X-Shopify-Hmac-Sha256` header against SHOPIFY_REVALIDATION_SECRET
 * - Rejects requests with missing/invalid signatures
 * - Does not expose secrets in responses or logs
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SHOPIFY_REVALIDATION_SECRET;

  if (!secret) {
    console.error('[Revalidate] SHOPIFY_REVALIDATION_SECRET not configured');
    return NextResponse.json(
      { error: 'Revalidation not configured' },
      { status: 500 }
    );
  }

  // Get the HMAC signature from Shopify
  const hmacHeader = request.headers.get('x-shopify-hmac-sha256');

  if (!hmacHeader) {
    console.warn('[Revalidate] Missing X-Shopify-Hmac-Sha256 header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  // Get raw body for HMAC verification, with a bounded request size.
  const body = await readLimitedBody(request);
  if (body === null) {
    return NextResponse.json(
      { error: 'Request body too large' },
      { status: 413 }
    );
  }

  // Verify the HMAC signature
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expectedHmac = Buffer.from(signature).toString('base64');

  // Constant-time comparison to prevent timing attacks
  const providedHmac = Buffer.from(hmacHeader, 'base64');
  const expectedHmacBuffer = Buffer.from(expectedHmac, 'base64');

  // Manual constant-time comparison (crypto.timingSafeEqual not available in edge runtime)
  let mismatch = providedHmac.length !== expectedHmacBuffer.length ? 1 : 0;
  const minLength = Math.min(providedHmac.length, expectedHmacBuffer.length);
  for (let i = 0; i < minLength; i++) {
    mismatch |= providedHmac[i] ^ expectedHmacBuffer[i];
  }

  if (mismatch !== 0) {
    console.warn('[Revalidate] Invalid HMAC signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Parse and validate the webhook topic from headers.
  const topic = request.headers.get('x-shopify-topic');
  const allowedTopics = new Set([
    'products/create',
    'products/update',
    'products/delete',
    'collections/create',
    'collections/update',
    'collections/delete',
  ]);

  if (!topic || !allowedTopics.has(topic)) {
    return NextResponse.json(
      { error: 'Unsupported webhook topic' },
      { status: 400 }
    );
  }

  console.log(`[Revalidate] Webhook received: topic=${topic}`);

  try {
    // Validate the JSON payload before performing any cache invalidation.
    JSON.parse(body);

    // Determine what to revalidate based on the webhook topic
    const revalidationTargets: string[] = [];

    switch (topic) {
      case 'products/create':
      case 'products/update':
      case 'products/delete':
        // Revalidate all product-related pages and the catalog
        revalidationTargets.push('/product/[handle]');
        revalidationTargets.push('/collections/all');
        revalidationTargets.push('/collections/[category]');
        // Also invalidate the product tag if using tag-based caching
        revalidateTag('products');
        break;

      case 'collections/create':
      case 'collections/update':
      case 'collections/delete':
        // Revalidate collection pages
        revalidationTargets.push('/collections/all');
        revalidationTargets.push('/collections/[category]');
        revalidateTag('collections');
        break;
    }

    // Revalidate each target path
    for (const path of revalidationTargets) {
      revalidatePath(path);
    }

    // Also revalidate the homepage which may feature products
    revalidatePath('/');

    console.log(
      `[Revalidate] Successfully revalidated: ${revalidationTargets.join(', ')}`
    );

    return NextResponse.json({
      success: true,
      topic,
      revalidated: revalidationTargets,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Revalidate] Error processing webhook:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Disable body parsing for HMAC verification - we need raw body
export const config = {
  api: {
    bodyParser: false,
  },
};
