'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/data/products';
import { getSearchProductImage } from '@/features/search';

interface SearchResultProps {
  product: Product;
  index: number;
  isHighlighted?: boolean;
  onSelect?: () => void;
}

/**
 * Individual search result item with image, name, price, badge,
 * category, and hover animation.
 */
export function SearchResult({
  product,
  index,
  isHighlighted = false,
  onSelect,
}: SearchResultProps) {
  const imageUrl = getSearchProductImage(product);
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  return (
    <Link
      href={`/product/${product.handle}`}
      onClick={onSelect}
      className={`group flex items-start gap-4 px-4 py-3 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        isHighlighted
          ? 'bg-accent/10 -mx-1 px-5'
          : 'hover:bg-surface/60 -mx-1 px-5'
      }`}
      role="option"
      aria-selected={isHighlighted}
      aria-label={`${product.name} — ${formattedPrice}`}
    >
      {/* Product image */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-surface shrink-0 border border-border/50 group-hover:border-accent/30 transition-colors">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-accent text-white leading-none">
            {product.badge}
          </span>
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-semibold text-primary truncate group-hover:text-accent transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {product.category}
            </p>
          </div>
          <span className="text-sm font-semibold text-primary whitespace-nowrap tabular-nums">
            {formattedPrice}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1 leading-relaxed">
          {product.description}
        </p>
      </div>
    </Link>
  );
}
