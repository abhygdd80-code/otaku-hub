'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Modal } from '@/components/ui/Modal';
import { useCart } from '@/context/CartContext';
import { useCartDrawer } from '@/components/cart/CartDrawerContext';
import { useQuickView } from './QuickViewContext';
import { useSizeGuide } from '@/components/sizeguide/SizeGuideContext';
import { useRecentlyViewedStore } from '@/store';
import { getProductByHandle, getAllProducts } from '@/lib/products';
import { getProductImage } from '@/features/collections';
import { createQuickViewEntrance } from '@/animations/gsap/quickview';
import {
  ProductBadge,
  ProductPrice,
  ProductGallery,
  SizeSelector,
  ColorSelector,
  QuantitySelector,
  AddToCartButton,
  ShippingInfo,
} from '@/components/product';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { RatingStars } from '@/components/reviews/RatingStars';
import { getReviewSummary } from '@/data/reviews';
import type { Product } from '@/data/products';

/**
 * Quick View modal — a full product preview without leaving the page.
 *
 * Opens from any product card (Eye button), renders the gallery, size /
 * color / quantity selectors, add-to-cart, buy-now, wishlist, stock,
 * shipping reassurance and a compact related-products preview.
 *
 * ── Animations ────────────────────────────────────────────
 * • Modal shell: Framer Motion spring (via the shared `Modal`).
 * • Content: GSAP staggered entrance (`data-quickview-reveal`), replayed
 *   each time the viewed product changes.
 *
 * ── Notes ─────────────────────────────────────────────────
 * • The selectors are keyed by product handle so their internal state
 *   resets when switching products inside an open modal.
 * • Opening this modal records the product in the Recently Viewed store.
 */
export function QuickViewModal() {
  const { handle, closeQuickView } = useQuickView();
  const { openSizeGuide } = useSizeGuide();
  const { addToCart } = useCart();
  const { onOpen: openCartDrawer } = useCartDrawer();
  const recordView = useRecentlyViewedStore(s => s.recordView);

  const product = handle ? getProductByHandle(handle) : undefined;
  const isOpen = handle !== null;

  // Reset per-product selections (remounted via `key`).
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  const scopeRef = useRef<HTMLDivElement>(null);

  // ── Track the view ──────────────────────────────────────────
  useEffect(() => {
    if (product) recordView(product.handle);
  }, [product, recordView]);

  // ── GSAP staggered content entrance (replays per product) ───
  useEffect(() => {
    if (!product || !scopeRef.current) return;
    const timeline = createQuickViewEntrance(scopeRef.current);
    return () => {
      timeline?.kill();
    };
  }, [product]);

  // ── Handlers ────────────────────────────────────────────────
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      image: getProductImage(product),
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity,
      collection: product.category,
    });
    closeQuickView();
    openCartDrawer();
  }, [
    product,
    selectedSize,
    selectedColor,
    quantity,
    addToCart,
    closeQuickView,
    openCartDrawer,
  ]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      image: getProductImage(product),
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity,
      collection: product.category,
    });
    closeQuickView();
    openCartDrawer();
  }, [
    product,
    selectedSize,
    selectedColor,
    quantity,
    addToCart,
    closeQuickView,
    openCartDrawer,
  ]);

  if (!product) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={closeQuickView}
        label="Quick view product"
        panelClassName="w-full max-w-4xl sm:rounded-2xl rounded-t-2xl border border-white/[0.06] shadow-2xl"
      >
        <div className="px-6 pb-8 text-sm text-zinc-400">
          This product is no longer available.
        </div>
      </Modal>
    );
  }

  const reviewSummary = getReviewSummary(product.handle);

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeQuickView}
      label={`Quick view — ${product.name}`}
      panelClassName="w-full max-w-4xl sm:rounded-2xl rounded-t-2xl border border-white/[0.06] shadow-2xl"
    >
      <div
        ref={scopeRef}
        style={{ opacity: 0 }}
        className="px-4 sm:px-6 pb-6 sm:pb-8"
      >
        {/* ── Main grid ───────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10">
          {/* Gallery */}
          <div data-quickview-reveal>
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Details */}
          <div className="space-y-5 min-w-0">
            <div data-quickview-reveal className="flex items-center gap-3">
              <ProductBadge badge={product.badge} />
            </div>

            <div data-quickview-reveal>
              <p className="text-xs font-bold text-accent tracking-[0.25em] uppercase">
                {product.category}
              </p>
              <h2 className="mt-1.5 text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white leading-tight">
                {product.name}
              </h2>
            </div>

            <div
              data-quickview-reveal
              className="flex items-center gap-4 flex-wrap"
            >
              <ProductPrice price={product.price} />
              {reviewSummary && (
                <Link
                  href={product.href}
                  onClick={closeQuickView}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-accent transition-colors"
                  aria-label={`${reviewSummary.average.toFixed(1)} out of 5 stars, ${reviewSummary.total} reviews`}
                >
                  <RatingStars
                    rating={reviewSummary.average}
                    size="sm"
                    readOnly
                  />
                  <span className="font-semibold text-white">
                    {reviewSummary.average.toFixed(1)}
                  </span>
                  <span>({reviewSummary.total})</span>
                </Link>
              )}
            </div>

            <p
              data-quickview-reveal
              className="text-sm text-zinc-400 leading-relaxed line-clamp-3"
            >
              {product.description}
            </p>

            {/* Stock status */}
            <div
              data-quickview-reveal
              className="flex items-center gap-2 text-xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-semibold text-emerald-400">In Stock</span>
              <span className="text-zinc-500">— ships within 24 hours</span>
            </div>

            {/* Selectors */}
            <div
              data-quickview-reveal
              className="space-y-4 pt-2 border-t border-white/[0.06]"
            >
              <SizeSelector
                key={`${product.handle}-size`}
                sizes={product.sizes}
                onChange={setSelectedSize}
                headerExtras={
                  <button
                    type="button"
                    onClick={() => openSizeGuide(product.name)}
                    className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                    aria-label="Open size guide"
                  >
                    Size Guide
                  </button>
                }
              />

              <ColorSelector
                key={`${product.handle}-color`}
                colors={product.colors}
                onChange={setSelectedColor}
              />

              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={10}
              />
            </div>

            {/* Actions */}
            <div data-quickview-reveal>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <AddToCartButton
                      productName={product.name}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                  <WishlistButton
                    productHandle={product.handle}
                    productName={product.name}
                    size="xl"
                    className="shrink-0"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-accent transition-all hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Zap className="w-4 h-4" aria-hidden="true" />
                  Buy Now
                </button>
              </div>
            </div>

            <div data-quickview-reveal>
              <ShippingInfo />
            </div>

            <Link
              data-quickview-reveal
              href={product.href}
              onClick={closeQuickView}
              className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              View Full Details
              <ArrowRight
                className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        {/* ── Related preview ─────────────────────────────── */}
        <RelatedInQuickView currentHandle={product.handle} />
      </div>
    </Modal>
  );
}

interface RelatedInQuickViewProps {
  currentHandle: string;
}

/** Compact strip of related products that swap the Quick View target. */
function RelatedInQuickView({ currentHandle }: RelatedInQuickViewProps) {
  const { openQuickView } = useQuickView();

  const related = getAllProducts()
    .filter(p => p.handle !== currentHandle)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div
      data-quickview-reveal
      className="mt-8 pt-6 border-t border-white/[0.06]"
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">
        Complete the look
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {related.map(product => (
          <RelatedMiniCard
            key={product.handle}
            product={product}
            onSelect={openQuickView}
          />
        ))}
      </div>
    </div>
  );
}

interface RelatedMiniCardProps {
  product: Product;
  onSelect: (handle: string) => void;
}

function RelatedMiniCard({ product, onSelect }: RelatedMiniCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product.handle)}
      className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-left transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label={`Quick view ${product.name}`}
    >
      <span
        className={cn(
          'h-14 w-14 shrink-0 rounded-lg border border-white/[0.06]',
          product.gradient
        )}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-white">
          {product.name}
        </span>
        <span className="block text-xs font-bold text-accent">
          ${product.price.toFixed(2)}
        </span>
      </span>
      <ArrowRight
        className="h-3.5 w-3.5 shrink-0 text-zinc-500 transition-all group-hover:translate-x-0.5 group-hover:text-accent"
        aria-hidden="true"
      />
    </button>
  );
}
