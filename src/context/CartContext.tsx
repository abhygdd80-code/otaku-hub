'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import { toast } from 'sonner';
import { isShopifyConfigured } from '@/lib/shopify/config';
import {
  trackAddToCart,
  trackRemoveFromCart,
  type AnalyticsProduct,
} from '@/lib/analytics';
import {
  addShopifyCartLines,
  updateShopifyCartLines,
  removeShopifyCartLines,
  clearCartId,
} from '@/lib/shopify/cart';
import type { ShopifyCartLineInput } from '@/lib/shopify/types';

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
  collection?: string;
  color?: string;
  colorHex?: string;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  addToCart: (
    item: Omit<CartItem, 'quantity'> & {
      quantity?: number;
      color?: string;
      colorHex?: string;
      shopifyVariantId?: string;
    }
  ) => void;
  removeFromCart: (id: string, size?: string, color?: string) => void;
  updateQuantity: (
    id: string,
    quantity: number,
    size?: string,
    color?: string
  ) => void;
  clearCart: () => void;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Derive a stable line key from cart item properties.
 * Used to match local items when syncing with Shopify.
 */
function lineKey(item: { id: string; size?: string; color?: string }): string {
  return [item.id, item.size ?? '', item.color ?? ''].join('::');
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const shopifyEnabled = useRef(isShopifyConfigured());
  // Track pending Shopify operations for optimistic UI
  const pendingOps = useRef(0);

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('otaku-cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('otaku-cart', JSON.stringify(cart));
    } catch (error) {
      console.warn('Failed to save cart to localStorage:', error);
    }
  }, [cart]);

  // Cross-tab sync: when another tab writes to the cart localStorage
  // entry, adopt it so both tabs stay converged (matches the wishlist
  // store's pattern). The `storage` event only fires in the *other* tab,
  // so this never echoes back into the tab that made the change.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'otaku-cart') return;
      try {
        const parsed = JSON.parse(event.newValue ?? '');
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      } catch {
        // Malformed localStorage — ignore; the next write corrects it.
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ── Shopify Cart Sync Helpers ──────────────────────────────

  /**
   * Fire-and-forget Shopify cart mutation.
   * Errors are caught and logged; the local cart remains authoritative.
   */
  const syncShopifyCart = useCallback(
    async (operation: () => Promise<unknown>, fallback?: () => void) => {
      if (!shopifyEnabled.current) return;

      try {
        pendingOps.current++;
        await operation();
      } catch (error) {
        console.warn('[CartContext] Shopify sync failed:', error);
        fallback?.();
      } finally {
        pendingOps.current--;
      }
    },
    []
  );

  // ── Cart Actions ──────────────────────────────────────────────

  const addToCart = useCallback(
    (
      item: Omit<CartItem, 'quantity'> & {
        quantity?: number;
        color?: string;
        colorHex?: string;
        shopifyVariantId?: string;
      }
    ) => {
      const quantity = item.quantity || 1;

      // ── Analytics: fire add_to_cart ─────────────────────────
      trackAddToCart(
        {
          item_id: item.id,
          item_name: item.name,
          item_category: item.collection,
          price: item.price,
          quantity,
        },
        item.price * quantity
      );

      const existingIndex = cart.findIndex(
        i => i.id === item.id && i.size === item.size && i.color === item.color
      );

      if (existingIndex >= 0) {
        const updatedCart = [...cart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + quantity,
        };

        setCart(updatedCart);

        toast.success(`Added ${quantity}x ${item.name} to cart`, {
          description: `Total in cart: ${updatedCart[existingIndex].quantity}`,
        });

        // Sync to Shopify
        if (item.shopifyVariantId) {
          syncShopifyCart(() =>
            updateShopifyCartLines([
              {
                id: `gid://shopify/CartLine/${item.id}`,
                quantity: updatedCart[existingIndex].quantity,
              },
            ])
          );
        }
      } else {
        const newItem = {
          ...item,
          quantity,
          colorHex: item.colorHex || undefined,
        } as CartItem;

        setCart([...cart, newItem]);

        toast.success(`${quantity}x ${item.name} added to cart`);

        // Sync to Shopify
        if (item.shopifyVariantId) {
          const lines: ShopifyCartLineInput[] = [
            {
              merchandiseId: item.shopifyVariantId,
              quantity,
            },
          ];
          syncShopifyCart(() => addShopifyCartLines(lines));
        }
      }
    },
    [cart, syncShopifyCart]
  );

  const removeFromCart = useCallback(
    (id: string, size?: string, color?: string) => {
      // Locate the item for analytics before it's filtered out.
      const removedItem = cart.find(item => {
        if (size !== undefined && color !== undefined)
          return item.id === id && item.size === size && item.color === color;
        if (size !== undefined) return item.id === id && item.size === size;
        return item.id === id;
      });

      const filtered = cart.filter(item => {
        if (size !== undefined && color !== undefined) {
          return !(
            item.id === id &&
            item.size === size &&
            item.color === color
          );
        }
        if (size !== undefined) {
          return !(item.id === id && item.size === size);
        }
        return item.id !== id;
      });

      setCart(filtered);

      if (filtered.length < cart.length) {
        toast.success('Item removed from cart');

        // ── Analytics: fire remove_from_cart ────────────────
        if (removedItem) {
          trackRemoveFromCart({
            item_id: removedItem.id,
            item_name: removedItem.name,
            item_category: removedItem.collection,
            price: removedItem.price,
            quantity: removedItem.quantity,
          });
        }

        // Sync to Shopify
        syncShopifyCart(() =>
          removeShopifyCartLines([`gid://shopify/CartLine/${id}`])
        );
      }
    },
    [cart, syncShopifyCart]
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number, size?: string, color?: string) => {
      if (quantity <= 0) {
        removeFromCart(id, size, color);
        return;
      }

      setCart(prev =>
        prev.map(item => {
          const matchesId = item.id === id;
          const matchesSize = size === undefined || item.size === size;
          const matchesColor = color === undefined || item.color === color;

          if (matchesId && matchesSize && matchesColor) {
            return { ...item, quantity };
          }
          return item;
        })
      );

      // Sync to Shopify
      syncShopifyCart(() =>
        updateShopifyCartLines([
          {
            id: `gid://shopify/CartLine/${id}`,
            quantity,
          },
        ])
      );
    },
    [removeFromCart, syncShopifyCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    toast.success('Cart cleared');

    // Clear Shopify cart
    if (shopifyEnabled.current) {
      syncShopifyCart(() => {
        clearCartId();
        return Promise.resolve();
      });
    }
  }, [syncShopifyCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
