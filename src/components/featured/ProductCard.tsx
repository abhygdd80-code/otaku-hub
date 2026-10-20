'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingBag, Eye } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useCart } from '@/context/CartContext';
import { useCartDrawer } from '@/components/cart/CartDrawerContext';
import { useQuickView } from '@/components/quickview/QuickViewContext';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { CompareToggle } from '@/components/compare/CompareToggle';
import { formatPrice } from '@/lib/utils';

export interface ProductCardProps {
  name: string;
  category: string;
  price: number;
  currencyCode?: string;
  badge?: string;
  gradient: string;
  href: string;
  featured?: boolean;
  className?: string;
}

/**
 * Gradient-placeholder product card used by both FeaturedCollection
 * and BestSellers (formerly two near-identical components).
 *
 * ── Layout ─────────────────────────────────────────────
 * • `featured` → 4:3 landscape aspect ratio
 * • Default → square
 *
 * ── Interactions ──────────────────────────────────────
 * • 3D tilt driven by mouse position.
 * • Gradient scales 110% on hover.
 * • Quick-action overlay (add to cart / quick view / wishlist /
 *   compare) appears on hover and on keyboard focus-within.
 * • Stretched-link pattern: transparent <Link> covers the card,
 *   action buttons sit above at a higher z-index.
 * • No copyrighted imagery — gradient placeholders only.
 */
export function ProductCard({
  name,
  category,
  price,
  currencyCode = 'INR',
  badge,
  gradient,
  href,
  featured = false,
  className,
}: ProductCardProps) {
  const { openQuickView } = useQuickView();
  const { addToCart } = useCart();
  const { onOpen: openCartDrawer } = useCartDrawer();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const formattedPrice = formatPrice(price, currencyCode);

  // Gradient cards are local-catalog only (no Shopify variant) and carry no
  // image, so add with a placeholder id derived from the href.
  const productHandle = href.split('/').pop() ?? '';

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width - 0.5) * 2;
    const y = ((e.clientY - box.top) / box.height - 0.5) * 2;
    setTilt({ x: y * -6, y: x * 6 });
  }, []);

  const handleMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  const handleAddToCart = useCallback(() => {
    addToCart({
      id: productHandle,
      name,
      price,
      image: '',
      size: 'One Size',
      collection: category,
    });
    openCartDrawer();
  }, [addToCart, openCartDrawer, productHandle, name, price, category]);

  const handleQuickView = useCallback(() => {
    if (productHandle) openQuickView(productHandle);
  }, [openQuickView, productHandle]);

  return (
    <div
      className={cn(
        'group relative block',
        featured ? 'aspect-[4/3]' : 'aspect-square',
        'rounded-2xl overflow-hidden',
        'bg-surface border border-white/[0.06] hover:border-accent/40',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(0,0,0,0.6)]',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Stretched product link ──────────────────────────── */}
      <Link
        href={href}
        className="absolute inset-0 z-20 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`${name} — ${formattedPrice}`}
      >
        <span className="sr-only">View {name}</span>
      </Link>

      {/* ── Tilt layer (visuals only — never interactive) ──── */}
      <div
        className="absolute inset-0"
        style={{
          transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* ── Gradient placeholder ──────────────────────────── */}
        <div
          className={cn(
            'absolute inset-0 transition-transform duration-700 ease-out',
            'group-hover:scale-110',
            gradient
          )}
        />

        {/* ── Noise texture ─────────────────────────────────── */}
        <div className="absolute inset-0 texture-noise opacity-[0.04] mix-blend-overlay pointer-events-none" />

        {/* ── Vignette ──────────────────────────────────────── */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        {/* ── Badge ─────────────────────────────────────────── */}
        {badge && (
          <div className="absolute top-3 left-3">
            <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-accent/90 backdrop-blur-md rounded-md">
              {badge}
            </span>
          </div>
        )}

        {/* ── Bottom content (decorative) ───────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/60 to-transparent">
          <p className="text-[11px] font-semibold text-accent uppercase tracking-widest mb-1">
            {category}
          </p>
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-accent transition-colors duration-300 leading-tight">
            {name}
          </h3>
          <span className="mt-2 block text-base sm:text-lg font-extrabold text-white">
            {formattedPrice}
          </span>
        </div>

        {/* ── Glass edge ring ────────────────────────────────── */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.04] pointer-events-none" />
      </div>

      {/* ── Quick actions overlay ──────────────────────────── */}
      <div className="absolute inset-0 z-30 flex items-center justify-center gap-3 bg-black/40 opacity-0 group-hover:opacity-100 focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto focus-within:pointer-events-auto transition-opacity duration-300">
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-10 h-10 rounded-full bg-accent hover:bg-accent/90 text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Add to cart"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleQuickView}
          className="w-10 h-10 rounded-full bg-surface/80 hover:bg-surface text-primary flex items-center justify-center shadow-lg border border-white/10 transform hover:scale-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Quick view"
        >
          <Eye className="w-4 h-4" />
        </button>
        <WishlistButton
          productHandle={productHandle}
          productName={name}
          size="sm"
        />
        <CompareToggle
          productHandle={productHandle}
          productName={name}
          size="sm"
        />
      </div>

      {/* ── Add-to-cart shortcut in the footer row ────────── */}
      <button
        type="button"
        onClick={handleAddToCart}
        className="absolute right-4 bottom-4 z-30 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        Add +
      </button>
    </div>
  );
}

export default ProductCard;
