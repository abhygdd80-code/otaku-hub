'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/animations/framer/variants';

interface CollectionBreadcrumbProps {
  categoryTitle: string;
}

export function CollectionBreadcrumb({
  categoryTitle,
}: CollectionBreadcrumbProps) {
  return (
    <motion.nav
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-xs sm:text-sm text-secondary-text mb-6"
    >
      <Link
        href="/"
        className="flex items-center gap-1.5 hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm px-1"
        aria-label="Home"
      >
        <Home className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Home</span>
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-muted" aria-hidden="true" />
      <Link
        href="/collections"
        className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm px-1"
      >
        Collections
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-muted" aria-hidden="true" />
      <span className="text-primary font-medium truncate max-w-[160px] sm:max-w-[240px]">
        {categoryTitle}
      </span>
    </motion.nav>
  );
}
