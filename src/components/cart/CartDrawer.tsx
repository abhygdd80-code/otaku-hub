'use client';

import { useCallback, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartDrawer } from './CartDrawerContext';
import { useCart } from './CartContext';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { EmptyCart } from './EmptyCart';
import { ShippingProgress } from './ShippingProgress';
import { cn } from '@/utils/cn';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Slide-in cart drawer with overlay backdrop.
 *
 * Accessible modal:
 * - `role="dialog"` + `aria-modal="true"` so screen readers treat it as modal
 * - Focus moves into the drawer on open and is restored to the trigger on close
 * - Tab focus is trapped inside the drawer while it is open
 * - Escape closes the drawer
 * - Body scroll is locked while the drawer is open
 */
export function CartDrawer() {
  const { isOpen, onClose } = useCartDrawer();
  const { cart } = useCart();

  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Move focus into the drawer on open; remember what was focused before.
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    panelRef.current
      ?.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
      )
      ?.focus();
  }, [isOpen]);

  // Restore focus to the trigger once the drawer closes.
  useEffect(() => {
    if (isOpen) return;
    previouslyFocusedRef.current?.focus();
    previouslyFocusedRef.current = null;
  }, [isOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Trap Tab focus within the drawer.
  const handlePanelKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter(el => el.getAttribute('aria-hidden') !== 'true');

    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      if (active === first || !panel.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last || !panel.contains(active)) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay backdrop — decorative, never focusable */}
          <motion.div
            key="cart-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer panel */}
          <motion.div
            key="cart-drawer-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            tabIndex={-1}
            onKeyDown={handlePanelKeyDown}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              'fixed right-0 top-0 bottom-0 z-50',
              'w-full max-w-[420px]',
              'bg-background/95 backdrop-blur-2xl',
              'border-l border-border/80',
              'flex flex-col',
              'shadow-[-8px_0_40px_rgba(0,0,0,0.5)]'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/60">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Shopping Cart
              </h2>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full',
                  'text-zinc-400 hover:text-white hover:bg-white/5',
                  'transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                )}
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {cart.length === 0 ? (
                <EmptyCart onContinue={onClose} />
              ) : (
                <div className="space-y-6">
                  <ShippingProgress />
                  <div className="space-y-4">
                    {cart.map(item => (
                      <CartItem
                        key={`${item.id}-${item.size}-${item.color ?? ''}`}
                        item={item}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer summary — only when cart has items */}
            {cart.length > 0 && (
              <div className="border-t border-border/60 px-6 py-6">
                <CartSummary />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
