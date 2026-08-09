'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { ProductCardProps } from '@/components/product/ProductCard';
import { ProductCard } from '@/components/product/ProductCard';
import { getReviewSummary } from '@/data/reviews';
import { fadeInUp, staggerContainer } from '@/animations/framer/variants';

interface WishlistGridProps {
  products: ProductCardProps[];
}

/**
 * Responsive product grid for the wishlist page.
 *
 * - 4 columns on desktop, 2 on tablet, 1 on mobile
 * - Framer Motion stagger reveal animation
 * - Reuses the existing ProductCard component
 */
export function WishlistGrid({ products }: WishlistGridProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
    >
      {products.map((product, index) => (
        <motion.div key={product.id} variants={fadeInUp} custom={index}>
          <ProductCard
            id={product.id}
            image={product.image}
            name={product.name}
            collection={product.collection}
            price={product.price}
            badge={product.badge}
            rating={product.id ? getReviewSummary(product.id) : null}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
