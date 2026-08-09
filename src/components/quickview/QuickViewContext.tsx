'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface QuickViewContextValue {
  /** Currently quick-viewed product handle, or `null` when closed */
  handle: string | null;
  openQuickView: (handle: string) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextValue | undefined>(
  undefined
);

/**
 * Global Quick View state.
 *
 * Mirrors the CartDrawerContext pattern — plain React context, no
 * persistence needed. The modal itself is rendered once in AppProviders.
 */
export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [handle, setHandle] = useState<string | null>(null);

  const openQuickView = useCallback((next: string) => setHandle(next), []);
  const closeQuickView = useCallback(() => setHandle(null), []);

  const value = useMemo(
    () => ({ handle, openQuickView, closeQuickView }),
    [handle, openQuickView, closeQuickView]
  );

  return (
    <QuickViewContext.Provider value={value}>
      {children}
    </QuickViewContext.Provider>
  );
}

export function useQuickView(): QuickViewContextValue {
  const context = useContext(QuickViewContext);
  if (!context) {
    throw new Error('useQuickView must be used within a QuickViewProvider');
  }
  return context;
}
