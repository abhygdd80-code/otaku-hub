'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import dynamic from 'next/dynamic';
import type { ProductCardProps } from '@/components/product/ProductCard';
import { getReviewSummary } from '@/data/reviews';
import { staggerContainer } from '@/animations/framer/variants';

// Dynamically import ProductCard for code splitting
const ProductCard = dynamic(() => import('@/components/product/ProductCard'), {
  ssr: true,
});

interface CollectionGridProps {
  products: ProductCardProps[];
}

/**
 * Responsive product grid with stagger reveal animation.
 * 4 columns desktop, 2 tablet, 1 mobile.
 */
export function CollectionGrid({ products }: CollectionGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gridRef, { once: true, margin: '-50px' });

  if (products.length === 0) return null;

  return (
    <motion.div
      ref={gridRef}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
      role="list"
      aria-label="Products grid"
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
              },
            },
          }}
          role="listitem"
        >
          <ProductCard
            id={product.id}
            image={product.image}
            name={product.name}
            collection={product.collection}
            price={product.price}
            currencyCode={product.currencyCode}
            href={product.id ? `/product/${product.id}` : undefined}
            badge={product.badge}
            rating={product.id ? getReviewSummary(product.id) : null}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
