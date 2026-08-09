'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/cart/CartContext';
import { useCartDrawer } from '@/components/cart/CartDrawerContext';
import { cn } from '@/utils/cn';

interface CartButtonProps {
  className?: string;
}

/**
 * Shopping cart icon with an animated item-count badge.
 *
 * - Opens the cart drawer via `useCartDrawer().onOpen`
 * - The badge spring-bounces on count change via Framer Motion
 * - Clamps displayed count at "99+"
 * - Renders no badge when the cart is empty
 */
export function CartButton({ className }: CartButtonProps) {
  const { cartCount } = useCart();
  const { onOpen } = useCartDrawer();

  const displayCount = cartCount > 99 ? '99+' : String(cartCount);

  const label =
    cartCount > 0
      ? `Shopping cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`
      : 'Shopping cart (empty)';

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'relative flex items-center justify-center w-10 h-10 rounded-full',
        'text-zinc-400 hover:text-white hover:bg-white/5',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      aria-label={label}
    >
      <ShoppingBag className="w-[18px] h-[18px]" />
      <AnimatePresence mode="popLayout">
        {cartCount > 0 && (
          <motion.span
            key={displayCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 20,
              mass: 0.5,
            }}
            className="absolute -top-1 -right-1 flex h-4 w-4 min-w-[16px] items-center justify-center rounded-full bg-accent text-[10px] font-bold leading-none text-white border-2 border-background select-none pointer-events-none"
            aria-hidden="true"
          >
            {displayCount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
