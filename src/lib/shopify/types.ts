// ─── Shopify Storefront API Types ──────────────────────────────────
// Minimal typed shapes for the Storefront API responses consumed by the
// integration layer. Only the fields we actually request are modeled.

/** Relay-style paginated connection. */
export interface Connection<T> {
  edges: { node: T; cursor?: string }[];
}

/** Money value returned by the Storefront API. */
export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

/** Price range for a product. */
export interface ShopifyPriceRange {
  minVariantPrice: ShopifyMoney;
  maxVariantPrice: ShopifyMoney;
}

/** Product image. */
export interface ShopifyImage {
  id?: string;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

/** A single product variant. */
export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  selectedOptions: { name: string; value: string }[];
}

/** A product option (Size / Color / Edition). */
export interface ShopifyProductOption {
  name: string;
  values: string[];
}

/** Product object from the Storefront API. */
export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  productType: string;
  vendor?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  availableForSale: boolean;
  featuredImage?: ShopifyImage | null;
  priceRange: ShopifyPriceRange;
  images: Connection<ShopifyImage>;
  options: ShopifyProductOption[];
  variants: Connection<ShopifyVariant>;
}

/** Collection object from the Storefront API. */
export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  products: Connection<ShopifyProduct>;
}

/** Product node inside a predictive-search result. */
export interface ShopifyPredictiveProduct {
  id: string;
  handle: string;
  title: string;
  productType?: string;
  description?: string;
  tags?: string[];
  featuredImage?: ShopifyImage | null;
  priceRange?: ShopifyPriceRange;
  availableForSale?: boolean;
}

// ─── Query response shapes ─────────────────────────────────────────

export interface ProductsQueryResponse {
  products: Connection<ShopifyProduct>;
}

export interface ProductByHandleQueryResponse {
  product: ShopifyProduct | null;
}

export interface CollectionProductsQueryResponse {
  collection: ShopifyCollection | null;
}

export interface CollectionsQueryResponse {
  collections: Connection<{
    id: string;
    handle: string;
    title: string;
    description?: string | null;
  }>;
}

export interface PredictiveSearchQueryResponse {
  predictiveSearch: {
    products: Connection<ShopifyPredictiveProduct>;
  } | null;
}

// ─── Cart types ────────────────────────────────────────────────────

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
  };
  lines: Connection<ShopifyCartLine>;
}

export interface CartCreateResponse {
  cartCreate: {
    cart: ShopifyCart | null;
    userErrors: { field?: string; message: string }[];
  };
}

export interface CartLinesAddResponse {
  cartLinesAdd: {
    cart: ShopifyCart | null;
    userErrors: { field?: string; message: string }[];
  };
}

export interface CartLinesUpdateResponse {
  cartLinesUpdate: {
    cart: ShopifyCart | null;
    userErrors: { field?: string; message: string }[];
  };
}

export interface CartLinesRemoveResponse {
  cartLinesRemove: {
    cart: ShopifyCart | null;
    userErrors: { field?: string; message: string }[];
  };
}

export interface CartQueryResponse {
  cart: ShopifyCart | null;
}

/** A cart line to create/update — maps to Storefront API `CartLineInput`. */
export interface ShopifyCartLineInput {
  merchandiseId: string;
  quantity: number;
}

// ─── Blog / Article types ───────────────────────────────────────────

/** Article object from the Storefront API. */
export interface ShopifyArticle {
  id: string;
  handle: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  contentHtml?: string | null;
  publishedAt: string;
  tags: string[];
  author: { name: string } | null;
  image?: ShopifyImage | null;
}

export interface ArticlesQueryResponse {
  articles: Connection<ShopifyArticle>;
}

export interface ArticleByHandleQueryResponse {
  articles: Connection<ShopifyArticle>;
}

// ─── Product recommendation types ───────────────────────────────────

export type ShopifyRecommendationIntent = 'RELATED' | 'COMPLEMENTARY';

export interface ProductRecommendationsQueryResponse {
  productRecommendations: ShopifyProduct[];
}

// ─── Customer (newsletter) types ────────────────────────────────────

export interface ShopifyCustomer {
  id: string;
  email: string;
  acceptsMarketing: boolean;
}

export interface CustomerCreateResponse {
  customerCreate: {
    customer: ShopifyCustomer | null;
    customerUserErrors: { field?: string; message: string }[];
  };
}

// ─── Customer authentication types ───────────────────────────────────

/** Short-lived customer access token from the Storefront API. */
export interface ShopifyCustomerAccessToken {
  accessToken: string;
  expiresAt: string;
}

export interface CustomerAccessTokenCreateResponse {
  customerAccessTokenCreate: {
    customerAccessToken: ShopifyCustomerAccessToken | null;
    customerUserErrors: { field?: string; message: string }[];
  };
}

export interface CustomerAccessTokenDeleteResponse {
  customerAccessTokenDelete: {
    deletedAccessToken?: string | null;
    deletedCustomerAccessTokenId?: string | null;
    userErrors: { field?: string; message: string }[];
  };
}

export interface CustomerRecoverResponse {
  customerRecover: {
    customerUserErrors: { field?: string; message: string }[];
  };
}

// ─── Customer profile / orders types ────────────────────────────────

export interface ShopifyCustomerAddress {
  id: string;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  provinceCode?: string | null;
  country?: string | null;
  countryCode?: string | null;
  zip?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  formatted?: string[] | null;
}

export interface ShopifyFulfillment {
  trackingCompany?: string | null;
  trackingInfo: { number?: string | null; url?: string | null }[];
  status?: string | null;
}

export interface ShopifyOrderLineItem {
  title: string;
  quantity: number;
  variant?: {
    id: string;
    title: string;
    image?: ShopifyImage | null;
  } | null;
}

export interface ShopifyCustomerOrder {
  id: string;
  orderNumber: number;
  name: string;
  processedAt: string;
  statusUrl: string;
  totalPrice: ShopifyMoney;
  subtotalPrice: ShopifyMoney;
  totalShippingPrice: ShopifyMoney;
  totalTax: ShopifyMoney;
  fulfillmentStatus?: string | null;
  financialStatus?: string | null;
  lineItems: Connection<ShopifyOrderLineItem>;
  fulfillments: ShopifyFulfillment[];
}

export interface ShopifyCustomerProfile {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  acceptsMarketing?: boolean;
  createdAt?: string;
  defaultAddress?: ShopifyCustomerAddress | null;
  addresses: Connection<ShopifyCustomerAddress>;
  orders: Connection<ShopifyCustomerOrder>;
}

export interface CustomerQueryResponse {
  customer: ShopifyCustomerProfile | null;
}

export interface CustomerUpdateResponse {
  customerUpdate: {
    customer: ShopifyCustomer | null;
    customerUserErrors: { field?: string; message: string }[];
  };
}

// ─── Customer address mutation responses ───────────────────────────

/** MailingAddressInput shape accepted by create/update mutations. */
export interface ShopifyMailingAddressInput {
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

export interface CustomerAddressCreateResponse {
  customerAddressCreate: {
    customerAddress: ShopifyCustomerAddress | null;
    customerUserErrors: { field?: string; message: string }[];
  };
}

export interface CustomerAddressUpdateResponse {
  customerAddressUpdate: {
    customerAddress: ShopifyCustomerAddress | null;
    customerUserErrors: { field?: string; message: string }[];
  };
}

export interface CustomerAddressDeleteResponse {
  customerAddressDelete: {
    deletedCustomerAddressId: string | null;
    customerUserErrors: { field?: string; message: string }[];
  };
}

export interface CustomerDefaultAddressUpdateResponse {
  customerDefaultAddressUpdate: {
    customer: ShopifyCustomer | null;
    customerUserErrors: { field?: string; message: string }[];
  };
}

// ─── Customer wishlist (metafield) types ───────────────────────────
// Wishlist handles live on the Shopify customer as a JSON-array metafield
// in the `custom` namespace (`custom.wishlist`).

export interface ShopifyMetafield {
  id: string;
  key: string;
  namespace: string;
  value: string;
}

export interface CustomerWishlistQueryResponse {
  customer: {
    id: string;
    metafields: Connection<ShopifyMetafield>;
  } | null;
}

export interface CustomerWishlistUpdateResponse {
  customerUpdate: {
    customer: { id: string } | null;
    customerUserErrors: { field?: string; message: string }[];
  };
}
