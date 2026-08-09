import { isShopifyConfigured } from '@/lib/shopify/config';
import { fetchShopifyProducts } from '@/lib/shopify/products';
import { setCatalogProducts } from '@/features/catalog';

/**
 * Server-side catalog hydration — runs once per request.
 *
 * When Shopify is configured (env vars present), this fetches the full
 * product catalog from the Storefront API and populates the module-level
 * catalog store so all downstream server components and client hydration
 * receive live Shopify data.
 *
 * When Shopify is NOT configured, the catalog store retains the built-in
 * local catalog — identical to the pre-Phase 15 behavior.
 *
 * This component renders nothing; it is a side-effect wrapper only.
 */
export async function CatalogHydrator({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isShopifyConfigured()) {
    try {
      const products = await fetchShopifyProducts();
      if (products.length > 0) {
        setCatalogProducts(products);
      }
    } catch (error) {
      console.warn(
        '[CatalogHydrator] Failed to fetch Shopify products, using local catalog.',
        error
      );
    }
  }

  return <>{children}</>;
}
