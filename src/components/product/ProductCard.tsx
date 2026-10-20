'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/components/cart/CartContext';
import { useCartDrawer } from '@/components/cart/CartDrawerContext';
import { useQuickView } from '@/components/quickview/QuickViewContext';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { CompareToggle } from '@/components/compare/CompareToggle';
import { RatingStars } from '@/components/reviews/RatingStars';

export type ProductCardProps = {
  id?: string;
  image: string;
  name: string;
  collection: string;
  price: number;
  currencyCode?: string;
  /** Optional product detail route. Collection cards provide this link. */
  href?: string;
  badge?: string;
  /** Aggregate review summary — renders star rating + count when present. */
  rating?: { average: number; total: number } | null;
};

export const ProductCard: React.FC<ProductCardProps> = ({
  id = '1',
  image,
  name,
  collection,
  price,
  currencyCode = 'INR',
  href,
  badge = 'Limited Drop',
  rating = null,
}) => {
  const { addToCart } = useCart();
  const { onOpen: openCartDrawer } = useCartDrawer();
  const { openQuickView } = useQuickView();
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleQuickView = () => {
    openQuickView(id || '1');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    const rotateX = (y - centerY) / 12;
    const rotateY = (centerX - x) / 12;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id,
      name,
      image,
      price,
      currencyCode,
      size: 'L',
      color: 'Black',
    });
    openCartDrawer();
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-2xl bg-surface border border-border/80 p-3 overflow-hidden transition-all duration-300 transform-gpu hover:border-accent/60 hover:shadow-[0_15px_35px_rgba(229,9,20,0.15)] flex flex-col justify-between"
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
      }}
    >
      {href && (
        <Link
          href={href}
          className="absolute inset-0 z-20 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={`View ${name} product details`}
        >
          <span className="sr-only">View {name} product details</span>
        </Link>
      )}

      {/* Image Container with Zoom */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-background">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
        />

        {/* Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-accent/90 backdrop-blur-md rounded-md">
            {badge}
          </span>
        </div>

        {/* Hover Quick Action Buttons Overlay — also revealed when any
            button receives keyboard focus so controls are never hidden. */}
        <div className="absolute inset-0 z-30 bg-background/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
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
            className="w-10 h-10 rounded-full bg-surface hover:bg-surface/80 text-primary flex items-center justify-center shadow-lg border border-border transform hover:scale-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Quick view product"
          >
            <Eye className="w-4 h-4" />
          </button>
          <WishlistButton
            productHandle={id || '1'}
            size="sm"
            productName={name}
          />
          <CompareToggle
            productHandle={id || '1'}
            productName={name}
            size="sm"
          />
        </div>
      </div>

      {/* Product Content Details */}
      <div className="pt-4 pb-2 px-1 flex flex-col justify-between flex-1">
        <div>
          <span className="text-[11px] font-semibold text-accent uppercase tracking-widest block mb-1">
            {collection}
          </span>
          <h3 className="text-base font-bold text-primary line-clamp-1 group-hover:text-accent transition-colors">
            {name}
          </h3>
          {rating && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <RatingStars rating={rating.average} size="xs" />
              <span className="text-xs font-medium text-zinc-500 tabular-nums">
                {rating.average.toFixed(1)} ({rating.total})
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-extrabold text-white">
            {formatPrice(price, currencyCode)}
          </span>
          <button
            type="button"
            onClick={handleAddToCart}
            className="relative z-30 text-xs font-semibold uppercase tracking-wider text-secondary-text hover:text-accent transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
          >
            Add +
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
