'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface SizeGuideContextValue {
  /** Whether the Size Guide modal is open */
  isOpen: boolean;
  /** Optional product name shown in the dialog header */
  productName: string | null;
  openSizeGuide: (productName?: string) => void;
  closeSizeGuide: () => void;
}

const SizeGuideContext = createContext<SizeGuideContextValue | undefined>(
  undefined
);

/**
 * Global Size Guide modal state.
 *
 * Mirrors the CartDrawerContext pattern — simple React context, no
 * persistence. The modal is rendered once in AppProviders.
 */
export function SizeGuideProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [productName, setProductName] = useState<string | null>(null);

  const openSizeGuide = useCallback((name?: string) => {
    setProductName(name ?? null);
    setIsOpen(true);
  }, []);

  const closeSizeGuide = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, productName, openSizeGuide, closeSizeGuide }),
    [isOpen, productName, openSizeGuide, closeSizeGuide]
  );

  return (
    <SizeGuideContext.Provider value={value}>
      {children}
    </SizeGuideContext.Provider>
  );
}

export function useSizeGuide(): SizeGuideContextValue {
  const context = useContext(SizeGuideContext);
  if (!context) {
    throw new Error('useSizeGuide must be used within a SizeGuideProvider');
  }
  return context;
}
