'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { CartItem } from '@/lib/types';
import { useCartStore } from '@/lib/store';
import { motion } from 'motion/react';

interface CartLineItemProps {
  item: CartItem;
  onRemove?: () => void;
}

export function CartLineItem({ item, onRemove }: CartLineItemProps) {
  const removeItem = useCartStore((state) => state.removeItem);

  const handleRemove = () => {
    removeItem(item.productId, item.size);
    if (onRemove) onRemove();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, height: 'auto' }}
      animate={{
        opacity: 1,
        x: 0,
        height: 'auto',
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
      }}
      exit={{
        opacity: 0,
        x: -40,
        height: 0,
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: 0,
        marginBottom: 0,
        overflow: 'hidden',
        transition: {
          opacity: { duration: 0.2, ease: 'easeOut' },
          x: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
          height: { duration: 0.35, delay: 0.1, ease: [0.16, 1, 0.3, 1] },
          paddingTop: { duration: 0.35, delay: 0.1 },
          paddingBottom: { duration: 0.35, delay: 0.1 },
        },
      }}
      className="flex items-center gap-4 py-4 px-3 sm:px-4 rounded-xl transition-colors duration-200 border border-transparent hover:border-terracotta/10 hover:bg-cream-100/40 overflow-hidden"
    >
      {/* Thumbnail Image */}
      <div className="w-16 sm:w-20 aspect-[3/4] relative rounded-xl overflow-hidden bg-terracotta-50 flex-shrink-0 border border-white/60 shadow-sm">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] sm:text-xs text-terracotta-400 font-serif">
            chhapa
          </div>
        )}
      </div>

      {/* Middle: Name + Size + Pill */}
      <div className="flex-1 min-w-0">
        <h4 className="font-serif text-base sm:text-lg font-medium text-terracotta-dark truncate hover:text-terracotta transition-colors">
          {item.name}
        </h4>
        <div className="flex items-center flex-wrap gap-2 mt-1">
          {item.size && (
            <span className="text-xs text-terracotta-600 bg-terracotta-50/70 border border-terracotta/10 px-2 py-0.5 rounded-md font-medium">
              Size: {item.size}
            </span>
          )}
          <span className="text-[11px] text-terracotta-500 font-light">
            One of one · Qty: 1
          </span>
        </div>

        {/* Small text link / icon remove button below item details on mobile */}
        <div className="mt-2 sm:hidden">
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-terracotta-600 hover:text-terracotta inline-flex items-center space-x-1 underline underline-offset-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Remove</span>
          </button>
        </div>
      </div>

      {/* Right Column: Price and Desktop Remove Action */}
      <div className="flex flex-col items-end justify-between self-stretch py-1">
        <span className="font-serif text-base sm:text-lg font-semibold text-terracotta">
          ₹{item.price.toLocaleString('en-IN')}
        </span>

        {/* Desktop Remove Button */}
        <button
          type="button"
          onClick={handleRemove}
          className="hidden sm:inline-flex items-center space-x-1 text-xs text-terracotta-500 hover:text-terracotta transition-colors group mt-auto pt-2 cursor-pointer"
          aria-label={`Remove ${item.name} from cart`}
        >
          <Trash2 className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
          <span className="underline underline-offset-2">Remove</span>
        </button>
      </div>
    </motion.div>
  );
}
