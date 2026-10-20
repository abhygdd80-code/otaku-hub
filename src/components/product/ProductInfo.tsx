'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { trackViewItem, type AnalyticsProduct } from '@/lib/analytics';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Ruler } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useCart } from '@/context/CartContext';
import { useCartDrawer } from '@/components/cart/CartDrawerContext';
import { useSizeGuide } from '@/components/sizeguide';
import type { Product } from '@/data/products';
import { getInventoryInfo } from '@/data/inventory';
import { getProductImage } from '@/features/collections';
import { ProductBadge } from './ProductBadge';
import { StockBadge } from './StockBadge';
import { ProductPrice } from './ProductPrice';
import { SizeSelector } from './SizeSelector';
import { ColorSelector } from './ColorSelector';
import { QuantitySelector } from './QuantitySelector';
import { AddToCartButton } from './AddToCartButton';
import { MobileStickyPurchase } from './MobileStickyPurchase';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { isShopifyConfigured } from '@/lib/shopify/config';

export interface ProductInfoProps {
  product: Product;
  className?: string;
}

/** Stagger-delay map for the content reveal animation */
const STAGGER_MAP = {
  badge: 0,
  category: 0.05,
  title: 0.1,
  price: 0.15,
  description: 0.2,
  inventory: 0.23,
  selectors: 0.28,
  actions: 0.38,
  shipping: 0.43,
} as const;

/**
 * Right-column product information panel.
 *
 * Composes all the selectors, actions, and metadata into a
 * single scrollable panel with a Framer Motion stagger entry.
 */
export function ProductInfo({ product, className }: ProductInfoProps) {
  const { addToCart } = useCart();
  const { onOpen } = useCartDrawer();
  const { openSizeGuide } = useSizeGuide();
  const shopifyConfigured = isShopifyConfigured();
  const actionsRef = useRef<HTMLDivElement>(null);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? '');
  const [selectedColor, setSelectedColor] = useState(
    product.colors.length === 0 && product.options.length > 0
      ? (product.options[0]?.values[0] ?? '')
      : (product.colors[0] ?? '')
  );
  const [quantity, setQuantity] = useState(1);

  // Mock inventory — drives the stock badge and cart gating.
  const inventory = getInventoryInfo(product.handle);
  const outOfStock = inventory.quantity === 0;

  // ── Analytics: fire view_item when the PDP info panel mounts ──
  useEffect(() => {
    const item: AnalyticsProduct = {
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
      currencyCode: product.currencyCode,
      item_variant: undefined,
    };
    trackViewItem(item);
  }, [product.id, product.name, product.category, product.price]);

  const handleAddToCart = useCallback(() => {
    addToCart({
      id: product.id,
      name: product.name,
      image: getProductImage(product),
      price: product.price,
      currencyCode: product.currencyCode,
      size: selectedSize,
      color: selectedColor,
      quantity,
      collection: product.category,
    });
    onOpen();
  }, [product, selectedSize, selectedColor, quantity, addToCart, onOpen]);

  // ── Animate entry for each content block ─────────────
  const fadeUp = (delay: number) =>
    ({
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay, ease: 'easeOut' as const },
    }) as const;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' as const }}
      className={cn(
        'space-y-6 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pb-0',
        className
      )}
    >
      {/* ── Badge ──────────────────────────────────────── */}
      <motion.div {...fadeUp(STAGGER_MAP.badge)}>
        <ProductBadge badge={product.badge} />
      </motion.div>

      {/* ── Category label ──────────────────────────────── */}
      <motion.p
        {...fadeUp(STAGGER_MAP.category)}
        className="text-xs font-bold text-accent tracking-[0.25em] uppercase"
      >
        {product.category}
      </motion.p>

      {/* ── Title ────────────────────────────────────────── */}
      <motion.h1
        {...fadeUp(STAGGER_MAP.title)}
        className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white leading-[1.1]"
      >
        {product.name}
      </motion.h1>

      {/* ── Price ────────────────────────────────────────── */}
      <motion.div {...fadeUp(STAGGER_MAP.price)}>
        <ProductPrice
          price={product.price}
          currencyCode={product.currencyCode}
        />
      </motion.div>

      {/* ── Description ──────────────────────────────────── */}
      <motion.p
        {...fadeUp(STAGGER_MAP.description)}
        className="text-sm sm:text-base text-zinc-400 leading-relaxed"
      >
        {product.description}
      </motion.p>

      {/* ── Inventory status ─────────────────────────────── */}
      <motion.div {...fadeUp(STAGGER_MAP.inventory)}>
        <StockBadge productHandle={product.handle} />
      </motion.div>

      {/* ── Selector controls ────────────────────────────── */}
      <motion.div
        {...fadeUp(STAGGER_MAP.selectors)}
        className="space-y-4 pt-2 border-t border-white/[0.06]"
      >
        <SizeSelector
          sizes={product.sizes}
          onChange={setSelectedSize}
          headerExtras={
            <button
              type="button"
              onClick={() => openSizeGuide(product.name)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              <Ruler className="h-3.5 w-3.5" aria-hidden="true" />
              Size Guide
            </button>
          }
        />

        <ColorSelector colors={product.colors} onChange={setSelectedColor} />

        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={outOfStock ? 1 : Math.min(10, inventory.quantity)}
        />
      </motion.div>

      {/* ── Add to cart + Wishlist ─────────────────────────── */}
      <motion.div ref={actionsRef} {...fadeUp(STAGGER_MAP.actions)}>
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <AddToCartButton
              productName={product.name}
              onAddToCart={handleAddToCart}
              disabled={outOfStock}
            />
          </div>
          <WishlistButton
            productHandle={product.handle}
            size="xl"
            productName={product.name}
            showLabel
          />
        </div>
      </motion.div>

      {/* ── Shipping info ────────────────────────────────── */}
      <motion.div
        {...fadeUp(STAGGER_MAP.shipping)}
        className={cn(
          'p-4 rounded-xl',
          'bg-white/[0.03] border border-white/[0.06]',
          'space-y-3'
        )}
      >
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <Truck className="w-4 h-4 text-accent shrink-0" />
          <span>
            {shopifyConfigured
              ? 'Shipping details are provided at checkout.'
              : 'Shipping details will be confirmed when checkout is connected.'}{' '}
            <span className="text-zinc-500">
              {shopifyConfigured
                ? 'Review the final delivery options before paying.'
                : 'This demo does not create orders or collect payment.'}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
          <span>
            {shopifyConfigured
              ? 'Checkout is handled by our store.'
              : 'Local cart preview only.'}{' '}
            <span className="text-zinc-500">
              {shopifyConfigured
                ? 'Payment is collected only after you confirm checkout.'
                : 'Returns and payment become available with a connected store.'}
            </span>
          </span>
        </div>
      </motion.div>

      {/* ── Mobile sticky purchase bar ─────────────────────── */}
      <MobileStickyPurchase
        productName={product.name}
        productHandle={product.handle}
        price={product.price}
        currencyCode={product.currencyCode}
        onAddToCart={handleAddToCart}
        disabled={outOfStock}
        targetRef={actionsRef}
      />
    </motion.div>
  );
}
