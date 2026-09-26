'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { SHIPPING_FEE } from '@/lib/constants';
import { AnimatePresence } from 'motion/react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((state) => state.cartItems);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch while Zustand loads from localStorage
  if (!mounted) {
    return (
      <div className="pt-32 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-terracotta-600 font-serif text-lg animate-pulse">
          <RefreshCw className="w-5 h-5 animate-spin text-terracotta" />
          <span>Loading your bag...</span>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const shipping = cartItems.length > 0 ? SHIPPING_FEE : 0;
  const total = subtotal + shipping;

  return (
    <div className="pt-28 sm:pt-32 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[75vh]">
      {/* Page Heading */}
      <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-terracotta/10 pb-5">
        <div>
          <span className="text-xs uppercase tracking-widest text-terracotta font-semibold">
            Review Your Order
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-terracotta-dark font-medium mt-1">
            Your Cart
          </h1>
        </div>
        {cartItems.length > 0 && (
          <div className="flex items-center space-x-4">
            <span className="text-xs text-terracotta-600">
              {cartItems.length} {cartItems.length === 1 ? 'creation' : 'creations'}
            </span>
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-terracotta-500 hover:text-terracotta underline transition-colors"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>

      {/* Cart Content: Empty State vs Two-Column Layout */}
      {cartItems.length === 0 ? (
        /* Empty State */
        <div
          className="text-center py-20 px-6 sm:px-12 rounded-3xl max-w-2xl mx-auto shadow-glass animate-fadeIn"
          style={{
            background: 'rgba(253, 248, 240, 0.65)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
          }}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-terracotta/10 flex items-center justify-center mx-auto mb-6 text-terracotta shadow-inner">
            <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5]" />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-terracotta-dark font-medium">
            Your cart is empty
          </h2>

          <p className="text-sm text-terracotta-dark/75 mt-3 max-w-md mx-auto font-light leading-relaxed">
            Our one-of-one handcrafted silhouettes and artisanal textiles are waiting to become part of your story.
          </p>

          <div className="mt-8">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#8B4520] hover:bg-[#703517] text-white font-medium text-sm tracking-wide transition-all duration-200 shadow-md hover:shadow-lg shadow-terracotta/20 hover:scale-[1.02] active:scale-[0.99]"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      ) : (
        /* Two-Column Layout (line items on left/top, order summary on right/bottom) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left / Top: Line Items List (7 cols on desktop) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <div
              className="rounded-2xl p-5 sm:p-7 shadow-glass transition-all duration-300"
              style={{
                background: 'rgba(253, 248, 240, 0.6)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <div className="flex items-center justify-between pb-4 border-b border-terracotta/15 mb-2">
                <span className="text-xs uppercase tracking-wider text-terracotta font-semibold">
                  Handcrafted Piece
                </span>
                <span className="text-xs uppercase tracking-wider text-terracotta font-semibold">
                  Price
                </span>
              </div>

              {/* Items Container with subtle divide lines & AnimatePresence for smooth removal */}
              <div className="divide-y divide-terracotta/10">
                <AnimatePresence initial={true}>
                  {cartItems.map((item) => (
                    <CartLineItem
                      key={`${item.productId}-${item.size}`}
                      item={item}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Reassurance note */}
            <div className="p-4 rounded-xl bg-white/30 border border-terracotta/10 flex items-center justify-between flex-wrap gap-3 text-xs text-terracotta-600">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-gold" />
                <span>Each item is reserved as an artisanal one-of-one creation</span>
              </div>
              <Link
                href="/shop"
                className="text-terracotta font-medium hover:underline inline-flex items-center"
              >
                <span>Add more pieces</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* Right / Bottom: Order Summary (5 cols on desktop, sticky on scroll) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div
              className="rounded-2xl p-6 sm:p-8 shadow-glass lg:sticky lg:top-28 space-y-5 transition-all duration-300"
              style={{
                background: 'rgba(253, 248, 240, 0.65)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
              }}
            >
              <div className="border-b border-terracotta/15 pb-4">
                <span className="text-xs uppercase tracking-widest text-terracotta font-semibold">
                  Price Breakdown
                </span>
                <h2 className="font-serif text-2xl text-terracotta-dark font-medium mt-0.5">
                  Order Summary
                </h2>
              </div>

              {/* Pricing Rows with Animated Numbers */}
              <div className="space-y-3 text-sm text-terracotta-dark/85">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <AnimatedCounter
                    value={subtotal}
                    className="font-medium text-terracotta-dark"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1.5">
                    <span>Shipping</span>
                    <span className="text-[11px] text-terracotta-500">(Flat rate)</span>
                  </div>
                  <AnimatedCounter
                    value={shipping}
                    className="font-medium text-terracotta-dark"
                  />
                </div>

                <div className="border-t border-terracotta/15 pt-4 flex justify-between items-baseline">
                  <div>
                    <span className="font-serif text-lg font-semibold text-terracotta-dark">
                      Total
                    </span>
                    <span className="block text-[11px] text-terracotta-600 font-light">
                      Including all Indian taxes
                    </span>
                  </div>
                  <AnimatedCounter
                    value={total}
                    duration={0.45}
                    className="font-serif text-2xl font-bold text-terracotta"
                  />
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <div className="pt-2">
                <Link
                  href="/checkout"
                  className="w-full inline-flex items-center justify-center py-4 px-6 rounded-full bg-[#8B4520] hover:bg-[#703517] text-white font-medium text-sm sm:text-base tracking-wide transition-all duration-200 shadow-md hover:shadow-lg shadow-terracotta/25 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-terracotta/10 space-y-2 text-[11px] text-terracotta-600">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-terracotta" />
                  <span>Secure SSL 256-bit encrypted checkout</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>Ships in biodegradable zero-plastic packaging</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
