'use client';

import React from 'react';
import Link from 'next/link';
import { X, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { CartLineItem } from './CartLineItem';
import { GlassButton } from '../ui/GlassButton';

export function CartDrawer() {
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const cartItems = useCartStore((state) => state.cartItems);
  const getSubtotal = useCartStore((state) => state.getSubtotal);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-terracotta-dark/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-cream/95 backdrop-blur-2xl border-l border-white/40 shadow-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-terracotta/10">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-terracotta" />
                <h3 className="font-serif text-xl font-semibold text-terracotta-dark">Your Bag</h3>
                <span className="text-xs text-terracotta-600">({cartItems.length} items)</span>
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 rounded-full hover:bg-terracotta-50 text-terracotta-dark transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1">
              {cartItems.length === 0 ? (
                <div className="text-center py-16 text-terracotta-600">
                  <p className="font-serif text-lg">Your bag is empty</p>
                  <p className="text-xs mt-2">Explore our artisanal hand-crafted collection</p>
                  <Link href="/shop" onClick={closeCart}>
                    <GlassButton className="mt-6" size="sm">
                      Explore Shop
                    </GlassButton>
                  </Link>
                </div>
              ) : (
                cartItems.map((item) => (
                  <CartLineItem
                    key={`${item.productId}-${item.size}`}
                    item={item}
                  />
                ))
              )}
            </div>
          </div>

          {cartItems.length > 0 && (
            <div className="pt-6 border-t border-terracotta/10 space-y-4">
              <div className="flex justify-between text-base font-medium text-terracotta-dark">
                <span>Subtotal</span>
                <span className="font-semibold text-terracotta font-serif">
                  ₹{getSubtotal().toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-xs text-terracotta-600">
                Taxes and shipping calculated at checkout
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/cart" onClick={closeCart} className="w-full">
                  <GlassButton variant="outline" className="w-full">
                    View Cart
                  </GlassButton>
                </Link>
                <Link href="/checkout" onClick={closeCart} className="w-full">
                  <GlassButton variant="solid" className="w-full">
                    Checkout
                  </GlassButton>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
