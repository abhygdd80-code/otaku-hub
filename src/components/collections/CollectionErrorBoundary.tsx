'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { fadeInUp } from '@/animations/framer/variants';

interface CollectionErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

/**
 * Premium error UI for the collection page with retry button.
 * Used as a fallback when the collection page component throws.
 */
export function CollectionErrorBoundary({
  error,
  reset,
}: CollectionErrorBoundaryProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-24 px-4 text-center"
      role="alert"
    >
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <AlertTriangle
            className="w-10 h-10 text-destructive/60"
            aria-hidden="true"
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-primary font-display mb-3">
        SOMETHING WENT WRONG
      </h2>
      <p className="text-secondary-text text-sm max-w-md leading-relaxed mb-2">
        We encountered an unexpected error while loading this collection. Please
        try again.
      </p>
      {process.env.NODE_ENV === 'development' && (
        <p className="text-xs text-muted-foreground max-w-md mb-6 font-mono bg-surface border border-border rounded-lg p-3 truncate">
          {error.message}
        </p>
      )}
      <div className="mt-6">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-sm tracking-wider uppercase transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Retry loading the collection"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Try Again
        </button>
      </div>
    </motion.div>
  );
}
