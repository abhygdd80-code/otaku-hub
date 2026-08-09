// ─── Shopify Integration Layer — Barrel ─────────────────────────────
// Single import point for all Shopify Storefront API functionality.

export { getShopifyConfig, isShopifyConfigured } from './config';
export type { ShopifyConfig } from './config';

export { shopifyFetch, ShopifyError } from './client';

export { fetchShopifyProducts, fetchShopifyProductByHandle } from './products';

export {
  fetchShopifyCollections,
  fetchShopifyCollectionProducts,
} from './collections';

export { searchShopifyProducts } from './search';

export {
  getCartId,
  setCartId,
  clearCartId,
  getCheckoutUrl,
  createShopifyCart,
  addShopifyCartLines,
  updateShopifyCartLines,
  removeShopifyCartLines,
  fetchShopifyCart,
} from './cart';

export { fetchShopifyArticles, fetchShopifyArticleByHandle } from './blog';

export { fetchProductRecommendations, dedupeProducts } from './recommendations';

export { createMarketingCustomer } from './customer';

export {
  shopifyLogin,
  shopifySignup,
  shopifyRecoverPassword,
  shopifyLogout,
  shopifyGetCustomer,
  shopifyUpdateCustomer,
  shopifyCreateAddress,
  shopifyUpdateAddress,
  shopifyDeleteAddress,
  shopifySetDefaultAddress,
} from './auth';

export {
  mapShopifyProduct,
  mapPredictiveProduct,
  mapShopifyArticle,
  gradientForPrice,
  variantSelectedOptions,
} from './mappers';

export type {
  ShopifyProduct,
  ShopifyCollection,
  ShopifyVariant,
  ShopifyCart,
  ShopifyCartLineInput,
  ShopifyArticle,
  ShopifyRecommendationIntent,
  Connection,
} from './types';
