import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

/**
 * Search-engine crawl rules for OtakuSaga.
 *
 * Generated as a Next.js App Router `robots.ts` — no manual file needed
 * in the public directory.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/account/'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
