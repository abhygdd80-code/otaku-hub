'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CollectionBreadcrumb } from './CollectionBreadcrumb';
import { fadeInUp, staggerContainer } from '@/animations/framer/variants';

interface CollectionHeaderProps {
  title: string;
  description: string;
  productCount: number;
}

export function CollectionHeader({
  title,
  description,
  productCount,
}: CollectionHeaderProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mb-12"
    >
      <CollectionBreadcrumb categoryTitle={title} />

      <motion.div variants={fadeInUp} className="border-b border-border pb-8">
        <span className="text-xs font-bold text-accent tracking-[0.25em] uppercase block mb-3">
          COLLECTION ARCHIVE
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display">
          {title} <span className="text-accent">SERIES</span>
        </h1>
        <p className="mt-4 text-secondary-text text-sm sm:text-base max-w-xl leading-relaxed">
          {description}
        </p>
        <div className="mt-5 flex items-center gap-4">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-surface border border-border rounded-full px-4 py-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent"
              aria-hidden="true"
            />
            {productCount} {productCount === 1 ? 'Product' : 'Products'}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
