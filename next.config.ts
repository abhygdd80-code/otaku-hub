import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Shopify CDN — covers all Shopify store image domains
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      // Shopify international CDN
      {
        protocol: 'https',
        hostname: '*.myshopify.com',
      },
    ],
  },
  // Enable React strict mode for development safety
  reactStrictMode: true,
  // Remove the framework-identifying `X-Powered-By` response header
  poweredByHeader: false,
  // Configure logging for performance insights
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  async headers() {
    // Shared across every environment. CSP is appended separately below
    // because Next's *dev* runtime relies on eval() and dynamic inline
    // scripts for hot-reload — a policy that allowed them would be
    // pointless, and one that didn't would break the dev server.
    const securityHeaders = [
      // ── MIME sniffing ───────────────────────────────────
      // Prevents browsers from interpreting responses as a type the
      // server didn't intend (blocks MIME-confusion attacks).
      { key: 'X-Content-Type-Options', value: 'nosniff' },

      // ── Clickjacking ────────────────────────────────────
      // Deny framing the site in any other page. `frame-ancestors`
      // in the CSP below is the modern equivalent; the legacy header
      // is kept as belt-and-suspenders for older browsers.
      { key: 'X-Frame-Options', value: 'DENY' },

      // ── Referrer privacy ────────────────────────────────
      // Full URL is sent only on same-origin requests; cross-origin
      // requests get just the origin — checkout/account URLs never
      // leak to third parties.
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

      // ── Feature gating ──────────────────────────────────
      // The storefront never needs camera, microphone, or geolocation.
      // `browsing-topics=()` opts the site out of Topics interest
      // tracking (Chrome's FLoC successor).
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
      },

      // ── DNS prefetch ────────────────────────────────────
      { key: 'X-DNS-Prefetch-Control', value: 'on' },

      // ── HSTS ────────────────────────────────────────────
      // Forces HTTPS for a year; browsers ignore this on plain HTTP
      // dev servers, so it is safe to ship unconditionally.
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
      },
    ];

    if (process.env.NODE_ENV === 'production') {
      securityHeaders.push({
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://*.posthog.com https://*.clarity.ms",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https://images.unsplash.com https://cdn.shopify.com https://*.myshopify.com",
          "font-src 'self' data:",
          "connect-src 'self' https://*.myshopify.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://connect.facebook.net https://*.clarity.ms https://*.posthog.com https://*.posthog.net",
          "object-src 'none'",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      });
    }

    return [
      {
        // Apply to every route.
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
