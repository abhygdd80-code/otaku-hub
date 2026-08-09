'use client';

import React from 'react';
import { Toaster } from 'sonner';
import { MotionConfig } from 'framer-motion';
import { LenisProvider } from '@/components/providers/LenisProvider';
import { CartProvider } from '@/context/CartContext';
import { CartDrawerProvider } from '@/components/cart/CartDrawerContext';
import { QuickViewProvider } from '@/components/quickview';
import { SizeGuideProvider } from '@/components/sizeguide';
import { CompareButton } from '@/components/compare';
import { Overlays } from '@/components/providers/Overlays';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <LenisProvider>
      <MotionConfig reducedMotion="user">
        <CartProvider>
          <CartDrawerProvider>
            <QuickViewProvider>
              <SizeGuideProvider>
                {children}
                {/* Overlays are lazy-loaded via `next/dynamic` so the
                    drawer/modal shells don't ship in the initial bundle. */}
                <Overlays />
                <CompareButton />
                <Toaster position="top-right" theme="dark" richColors />
              </SizeGuideProvider>
            </QuickViewProvider>
          </CartDrawerProvider>
        </CartProvider>
      </MotionConfig>
    </LenisProvider>
  );
}

export default AppProviders;
