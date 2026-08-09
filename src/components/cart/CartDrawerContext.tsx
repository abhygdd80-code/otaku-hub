'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CartDrawerContextType {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  toggle: () => void;
}

const CartDrawerContext = createContext<CartDrawerContextType | undefined>(
  undefined
);

export const CartDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return (
    <CartDrawerContext.Provider value={{ isOpen, onOpen, onClose, toggle }}>
      {children}
    </CartDrawerContext.Provider>
  );
};

export const useCartDrawer = () => {
  const context = useContext(CartDrawerContext);
  if (!context) {
    throw new Error('useCartDrawer must be used within a CartDrawerProvider');
  }
  return context;
};
