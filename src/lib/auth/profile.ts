// ─── Shopify customer → app UserProfile mapper ───────────────────────
// Converts a Storefront API customer (profile + addresses + orders) into
// the flattened UserProfile shape the client stores consume.

import type {
  CustomerAddress,
  CustomerFulfillment,
  CustomerOrder,
  CustomerOrderLineItem,
  UserProfile,
} from '@/types/auth';
import type {
  ShopifyCustomerAddress,
  ShopifyCustomerOrder,
  ShopifyCustomerProfile,
  ShopifyFulfillment,
  ShopifyOrderLineItem,
} from '@/lib/shopify/types';

/** Map a full customer object into the app's UserProfile shape. */
export function mapCustomerToProfile(
  customer: ShopifyCustomerProfile
): UserProfile {
  const firstName = customer.firstName ?? undefined;
  const lastName = customer.lastName ?? undefined;
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  return {
    id: customer.id,
    shopifyId: customer.id,
    email: customer.email,
    name: fullName || customer.email,
    firstName: customer.firstName ?? null,
    lastName: customer.lastName ?? null,
    phone: customer.phone ?? null,
    acceptsMarketing: customer.acceptsMarketing ?? undefined,
    createdAt: customer.createdAt ?? new Date().toISOString(),
    defaultAddress: customer.defaultAddress
      ? mapAddress(customer.defaultAddress)
      : null,
    addresses: customer.addresses.edges.map(edge => mapAddress(edge.node)),
    orders: customer.orders.edges.map(edge => mapOrder(edge.node)),
  };
}

function mapAddress(address: ShopifyCustomerAddress): CustomerAddress {
  return {
    id: address.id,
    address1: address.address1 ?? null,
    address2: address.address2 ?? null,
    city: address.city ?? null,
    province: address.province ?? null,
    provinceCode: address.provinceCode ?? null,
    country: address.country ?? null,
    countryCode: address.countryCode ?? null,
    zip: address.zip ?? null,
    phone: address.phone ?? null,
    firstName: address.firstName ?? null,
    lastName: address.lastName ?? null,
    company: address.company ?? null,
    formatted: address.formatted ?? null,
  };
}

function mapOrder(order: ShopifyCustomerOrder): CustomerOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    name: order.name,
    processedAt: order.processedAt,
    statusUrl: order.statusUrl,
    totalPrice: Number(order.totalPrice.amount),
    currencyCode: order.totalPrice.currencyCode,
    subtotalPrice: Number(order.subtotalPrice.amount),
    totalShippingPrice: Number(order.totalShippingPrice.amount),
    totalTax: Number(order.totalTax.amount),
    fulfillmentStatus: order.fulfillmentStatus ?? null,
    financialStatus: order.financialStatus ?? null,
    lineItems: order.lineItems.edges.map(edge => mapLineItem(edge.node)),
    fulfillments: order.fulfillments.map(mapFulfillment),
  };
}

function mapLineItem(item: ShopifyOrderLineItem): CustomerOrderLineItem {
  return {
    title: item.title,
    quantity: item.quantity,
    variantTitle: item.variant?.title ?? null,
    image: item.variant?.image
      ? {
          url: item.variant.image.url,
          altText: item.variant.image.altText ?? null,
          width: item.variant.image.width ?? null,
          height: item.variant.image.height ?? null,
        }
      : null,
  };
}

function mapFulfillment(fulfillment: ShopifyFulfillment): CustomerFulfillment {
  const tracking = fulfillment.trackingInfo[0];
  return {
    trackingCompany: fulfillment.trackingCompany ?? null,
    trackingNumber: tracking?.number ?? null,
    trackingUrl: tracking?.url ?? null,
    status: fulfillment.status ?? null,
  };
}
