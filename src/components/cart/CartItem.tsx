'use client';

import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { QuantitySelector } from '../product/QuantitySelector';
import { motion } from 'framer-motion';
import { useCart } from './CartContext';
import { formatPrice } from '@/lib/utils';

interface CartItemProps {
  item: {
    id: string;
    name: string;
    image: string;
    price: number;
    currencyCode?: string;
    size: string;
    quantity: number;
    collection?: string;
    color?: string;
    colorHex?: string;
  };
}

export const CartItem = ({ item }: CartItemProps) => {
  const { removeFromCart, updateQuantity } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.id, newQuantity, item.size, item.color);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-4 border-b border-border"
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Product Image — local-catalog (gradient) items have no image, so
            render a matching gradient placeholder rather than an invalid
            <Image> src. */}
        <div className="w-full md:w-48 shrink-0">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              width={300}
              height={300}
              sizes="(min-width: 768px) 12rem, 100vw"
              className="rounded-lg object-cover w-full h-auto"
            />
          ) : (
            <div
              role="img"
              aria-label={`${item.name} placeholder`}
              className="w-full aspect-square rounded-lg bg-gradient-to-br from-zinc-700 via-zinc-800 to-background flex items-center justify-center"
            >
              <ShoppingBag className="w-8 h-8 text-white/20" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">{item.name}</h3>
            <p className="text-zinc-400 text-sm">Size: {item.size}</p>
            {item.color && (
              <p className="text-zinc-400 text-sm flex items-center gap-2">
                Color:
                <span
                  className="w-4 h-4 rounded-full border border-white/10"
                  style={{ backgroundColor: item.colorHex }}
                  aria-hidden="true"
                />
                {item.color}
              </p>
            )}
            <p className="text-zinc-400 text-sm">
              {formatPrice(item.price, item.currencyCode)}
            </p>
          </div>

          {/* Quantity Selector */}
          <QuantitySelector
            value={item.quantity}
            min={1}
            max={10}
            onChange={handleQuantityChange}
          />

          {/* Remove Button */}
          <Magnetic>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeFromCart(item.id, item.size, item.color)}
              className="w-full"
            >
              Remove Item
            </Button>
          </Magnetic>
        </div>
      </div>
    </motion.div>
  );
};
