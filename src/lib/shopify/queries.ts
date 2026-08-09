// ─── Shopify GraphQL Queries ───────────────────────────────────────
// Centralized query/mutation strings for the Storefront API.

// ─── Fragments ─────────────────────────────────────────────────────

/** Core product fields used by list + detail queries. */
const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    productType
    vendor
    tags
    createdAt
    updatedAt
    availableForSale
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 8) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    options {
      name
      values
    }
    variants(first: 50) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`;

// ─── Product queries ───────────────────────────────────────────────

export const PRODUCTS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query ProductsQuery($first: Int!, $cursor: String, $sortKey: ProductSortKeys) {
    products(first: $first, after: $cursor, sortKey: $sortKey) {
      edges {
        node {
          ...ProductFields
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  ${PRODUCT_FRAGMENT}
  query ProductByHandleQuery($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`;

// ─── Collection queries ────────────────────────────────────────────

export const COLLECTIONS_QUERY = `
  query CollectionsQuery($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
        }
      }
    }
  }
`;

export const COLLECTION_PRODUCTS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query CollectionProductsQuery($handle: String!, $first: Int!, $cursor: String) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(first: $first, after: $cursor) {
        edges {
          node {
            ...ProductFields
          }
        }
      }
    }
  }
`;

// ─── Search ────────────────────────────────────────────────────────

export const PREDICTIVE_SEARCH_QUERY = `
  query PredictiveSearchQuery($query: String!, $first: Int!) {
    predictiveSearch(query: $query, types: [PRODUCT], limit: $first) {
      products {
        edges {
          node {
            id
            handle
            title
            productType
            description
            tags
            availableForSale
            featuredImage {
              url
              altText
              width
              height
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;

// ─── Cart mutations ────────────────────────────────────────────────

const CART_LINE_FIELDS = `
  id
  quantity
  merchandise {
    id
    title
  }
`;

const CART_QUERY_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
    totalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 100) {
    edges {
      node {
        ${CART_LINE_FIELDS}
      }
    }
  }
`;

export const CART_CREATE_MUTATION = `
  mutation CartCreateMutation($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ${CART_QUERY_FIELDS}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAddMutation($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_QUERY_FIELDS}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdateMutation($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_QUERY_FIELDS}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemoveMutation($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ${CART_QUERY_FIELDS}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_QUERY = `
  query CartQuery($cartId: ID!) {
    cart(id: $cartId) {
      ${CART_QUERY_FIELDS}
    }
  }
`;

// ─── Blog / Articles ────────────────────────────────────────────────

const ARTICLE_FIELDS = `
  id
  handle
  title
  excerpt
  content
  contentHtml
  publishedAt
  tags
  author {
    name
  }
  image {
    url
    altText
    width
    height
  }
`;

/** Latest articles across the store's blogs (paginated). */
export const ARTICLES_QUERY = `
  query ArticlesQuery($first: Int!, $cursor: String) {
    articles(first: $first, after: $cursor) {
      edges {
        node {
          ${ARTICLE_FIELDS}
        }
        cursor
      }
    }
  }
`;

/** Single article fetched by handle (Storefront has no articleByHandle root). */
export const ARTICLE_BY_HANDLE_QUERY = `
  query ArticleByHandleQuery($handle: String!) {
    articles(first: 1, query: "handle:$handle") {
      edges {
        node {
          ${ARTICLE_FIELDS}
        }
      }
    }
  }
`;

// ─── Product recommendations ────────────────────────────────────────
// The Storefront API recommendation product supports two intents:
//   RELATED          — "customers also bought" / product associations
//   COMPLEMENTARY    — "complete the look" / frequently bought together

export const PRODUCT_RECOMMENDATIONS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query ProductRecommendationsQuery($productId: ID!, $intent: ProductRecommendationIntent) {
    productRecommendations(productId: $productId, intent: $intent) {
      ...ProductFields
    }
  }
`;

// ─── Customer mutation (newsletter signup) ──────────────────────────
// The Storefront API has no direct "subscribe to marketing" mutation, so
// we create a customer with `acceptsMarketing: true`. Marketing opt-ins
// then surface in the store's customer list / Klaviyo via their sync.

export const CUSTOMER_CREATE_MUTATION = `
  mutation CustomerCreateMutation($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        acceptsMarketing
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

// ─── Customer Auth mutations ───────────────────────────────────────
// Login (access-token create), logout (access-token delete), password
// recovery, customer profile + orders + addresses.

export const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = `
  mutation CustomerAccessTokenCreateMutation($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION = `
  mutation CustomerAccessTokenDeleteMutation($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      deletedCustomerAccessTokenId
      userErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_RECOVER_MUTATION = `
  mutation CustomerRecoverMutation($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_UPDATE_MUTATION = `
  mutation CustomerUpdateMutation(
    $customerAccessToken: String!
    $customer: CustomerUpdateInput!
  ) {
    customerUpdate(
      customerAccessToken: $customerAccessToken
      customer: $customer
    ) {
      customer {
        id
        firstName
        lastName
        email
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

/** Shared MailingAddress fields used by the customer query + address mutations. */
const CUSTOMER_ADDRESS_FIELDS = `
  id
  address1
  address2
  city
  province
  provinceCode
  country
  countryCode
  zip
  phone
  firstName
  lastName
  company
  formatted
`;

// ─── Customer address mutations ──────────────────────────────────────
// Create/update/delete/default-address for the authenticated customer's
// address book. All return the created/updated node so the client can
// reconcile its local list without a full profile refetch.

export const CUSTOMER_ADDRESS_CREATE_MUTATION = `
  mutation CustomerAddressCreateMutation(
    $customerAccessToken: String!
    $address: MailingAddressInput!
  ) {
    customerAddressCreate(
      customerAccessToken: $customerAccessToken
      address: $address
    ) {
      customerAddress {
        ${CUSTOMER_ADDRESS_FIELDS}
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ADDRESS_UPDATE_MUTATION = `
  mutation CustomerAddressUpdateMutation(
    $customerAccessToken: String!
    $id: ID!
    $address: MailingAddressInput!
  ) {
    customerAddressUpdate(
      customerAccessToken: $customerAccessToken
      id: $id
      address: $address
    ) {
      customerAddress {
        ${CUSTOMER_ADDRESS_FIELDS}
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ADDRESS_DELETE_MUTATION = `
  mutation CustomerAddressDeleteMutation(
    $customerAccessToken: String!
    $id: ID!
  ) {
    customerAddressDelete(
      customerAccessToken: $customerAccessToken
      id: $id
    ) {
      deletedCustomerAddressId
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION = `
  mutation CustomerDefaultAddressUpdateMutation(
    $customerAccessToken: String!
    $addressId: ID!
  ) {
    customerDefaultAddressUpdate(
      customerAccessToken: $customerAccessToken
      addressId: $addressId
    ) {
      customer {
        id
        defaultAddress {
          ${CUSTOMER_ADDRESS_FIELDS}
        }
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

// ─── Customer wishlist (metafield) ──────────────────────────────────
// Wishlist handles are persisted on the customer as a JSON-array metafield
// (`custom.wishlist`). Read via a dedicated query so the heavier profile
// query stays untouched; written through `customerUpdate.metafields`.
// NOTE: requires the `custom.wishlist` metafield definition in Shopify
// admin with "Storefront API" access enabled — failures degrade to local-
// only gracefully.

export const CUSTOMER_WISHLIST_QUERY = `
  query CustomerWishlistQuery($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      metafields(namespace: "custom", first: 10) {
        edges {
          node {
            id
            key
            namespace
            value
          }
        }
      }
    }
  }
`;

export const CUSTOMER_WISHLIST_UPDATE_MUTATION = `
  mutation CustomerWishlistUpdateMutation(
    $customerAccessToken: String!
    $customer: CustomerUpdateInput!
  ) {
    customerUpdate(
      customerAccessToken: $customerAccessToken
      customer: $customer
    ) {
      customer {
        id
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

// ─── Customer profile query ────────────────────────────────────────
// Returns full profile including addresses, orders (with fulfillments /
// tracking), and default address — used by /api/auth/me, /api/orders,
// and wishlist sync.

export const CUSTOMER_QUERY = `
  query CustomerQuery($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      acceptsMarketing
      createdAt
      defaultAddress {
        ${CUSTOMER_ADDRESS_FIELDS}
      }
      addresses(first: 10) {
        edges {
          node {
            ${CUSTOMER_ADDRESS_FIELDS}
          }
        }
      }
      orders(first: 20, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            orderNumber
            name
            processedAt
            statusUrl
            totalPrice {
              amount
              currencyCode
            }
            subtotalPrice {
              amount
              currencyCode
            }
            totalShippingPrice {
              amount
              currencyCode
            }
            totalTax {
              amount
              currencyCode
            }
            fulfillmentStatus
            financialStatus
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    id
                    title
                    image {
                      url
                      altText
                      width
                      height
                    }
                  }
                }
              }
            }
            fulfillments {
              trackingCompany
              trackingInfo {
                number
                url
              }
              status
            }
          }
        }
      }
    }
  }
`;
