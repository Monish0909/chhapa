'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  CheckCircle2,
  ArrowLeft,
  QrCode,
  MessageCircle,
  ShoppingBag,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { motion, AnimatePresence } from 'motion/react';
import {
  SHIPPING_FEE,
  CHHAPA_UPI_ID,
  CHHAPA_WHATSAPP_NUMBER,
  CHHAPA_WHATSAPP_DISPLAY,
  INDIAN_STATES,
} from '@/lib/constants';

// Zod Validation Schema
const checkoutSchema = z.object({
  // Section 1: Your Details
  fullName: z.string().trim().min(2, 'Please enter your full name'),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  email: z.string().trim().email('Please enter a valid email address'),

  // Section 2: Shipping Address
  addressLine1: z.string().trim().min(5, 'Address Line 1 is required (at least 5 characters)'),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().min(1, 'Please select your state'),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Please enter a valid 6-digit PIN code'),

  // Section 3: Account preference
  saveInfo: z.boolean(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface SubmittedOrder {
  orderId: string;
  customer: CheckoutFormData;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    size: string;
    quantity: number;
    image: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
}

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrder | null>(null);

  const cartItems = useCartStore((state) => state.cartItems);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = getSubtotal();
  const shipping = cartItems.length > 0 ? SHIPPING_FEE : 0;
  const total = subtotal + shipping;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      saveInfo: false,
    },
  });

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(CHHAPA_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const onSubmit = (data: CheckoutFormData) => {
    const orderPayload: SubmittedOrder = {
      orderId: `CHP-${Date.now().toString().slice(-6)}`,
      customer: data,
      items: [...cartItems],
      subtotal,
      shipping,
      total,
      paymentMethod: 'Manual UPI (Scan & Pay)',
      createdAt: new Date().toISOString(),
    };

    console.log('=== CHHAPA NEW ORDER SUBMITTED ===', orderPayload);
    setSubmittedOrder(orderPayload);
    clearCart();
  };

  // WhatsApp pre-filled message generator
  const getWhatsAppUrl = (orderId?: string, orderTotal?: number) => {
    const activeTotal = orderTotal ?? total;
    const refText = orderId ? ` for Order ID: ${orderId}` : '';
    const message = `Hello Chhapa Team, I am sharing my UPI payment screenshot of ₹${activeTotal.toLocaleString(
      'en-IN'
    )}${refText}. Please confirm my order!`;
    return `https://wa.me/${CHHAPA_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  if (!mounted) {
    return (
      <div className="pt-32 pb-24 max-w-6xl mx-auto px-4 sm:px-6 min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-terracotta-600 font-serif text-lg animate-pulse">
          <RefreshCw className="w-5 h-5 animate-spin text-terracotta" />
          <span>Preparing secure checkout...</span>
        </div>
      </div>
    );
  }

  // Render Checkout Page with smooth crossfade between Form and Order Confirmation
  return (
    <div className="pt-28 sm:pt-32 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <AnimatePresence mode="wait">
        {submittedOrder ? (
          <motion.div
            key="order-confirmed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto"
          >
            <div
              className="rounded-3xl p-6 sm:p-12 text-center shadow-glass space-y-6"
              style={{
                background: 'rgba(253, 248, 240, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.45)',
              }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-terracotta" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-terracotta font-semibold">
                  Order Placed · ID #{submittedOrder.orderId}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl text-terracotta-dark font-medium mt-1">
                  Thank You! We&apos;ve Received Your Order Details.
                </h1>
              </div>

              <div className="max-w-xl mx-auto p-5 rounded-2xl bg-white/40 border border-terracotta/15 text-left text-sm text-terracotta-dark/85 space-y-3">
                <p className="leading-relaxed">
                  Thank you, <strong className="font-semibold text-terracotta-dark">{submittedOrder.customer.fullName}</strong>. Please complete payment via UPI and send your screenshot on WhatsApp to confirm your bespoke creation.
                </p>
                <div className="pt-2 border-t border-terracotta/10 flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-terracotta-600">Total Payable:</span>
                  <span className="font-serif text-lg font-bold text-terracotta">
                    ₹{submittedOrder.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Quick Manual UPI Reminder Card */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-terracotta-50/70 border border-terracotta/20 flex flex-col items-center space-y-3">
                <span className="text-xs font-semibold text-terracotta uppercase tracking-wider">
                  UPI ID for payment
                </span>
                <div className="flex items-center space-x-2 bg-white/70 px-4 py-2 rounded-lg border border-terracotta/15">
                  <span className="font-mono text-sm font-medium text-terracotta-dark">
                    {CHHAPA_UPI_ID}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="text-terracotta hover:text-terracotta-600 transition-colors p-1"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? (
                      <Check className="w-4 h-4 text-green-700" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {copiedUpi && <span className="text-[11px] text-green-700">Copied to clipboard!</span>}
              </div>

              {/* WhatsApp Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <a
                  href={getWhatsAppUrl(submittedOrder.orderId, submittedOrder.total)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-medium text-sm tracking-wide transition-all duration-200 shadow-md hover:shadow-lg shadow-green-600/20 active:scale-[0.99]"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  <span>Send Screenshot on WhatsApp</span>
                </a>

                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-cream-100 hover:bg-cream-200 text-terracotta-dark border border-terracotta/20 font-medium text-sm tracking-wide transition-all duration-200"
                >
                  <span>Return to Shop</span>
                </Link>
              </div>
            </div>
          </motion.div>
        ) : cartItems.length === 0 ? (
          <motion.div
            key="empty-cart"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl mx-auto text-center"
          >
            <div
              className="rounded-3xl p-8 sm:p-12 shadow-glass space-y-5"
              style={{
                background: 'rgba(253, 248, 240, 0.65)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              <div className="w-16 h-16 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl text-terracotta-dark font-medium">
                Your Cart is Empty
              </h2>
              <p className="text-xs sm:text-sm text-terracotta-600 font-light">
                You don&apos;t have any creations in your bag yet. Please add a piece from our shop to checkout.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#8B4520] hover:bg-[#703517] text-white text-sm font-medium transition-all shadow-md"
                >
                  <span>Explore Collection</span>
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="checkout-form-view"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
      {/* Breadcrumb / Back Link */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/cart"
          className="inline-flex items-center text-xs sm:text-sm text-terracotta-600 hover:text-terracotta transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Cart</span>
        </Link>
        <span className="text-xs text-terracotta-500 font-light">
          Step 2 of 2 · Secure Manual Checkout
        </span>
      </div>

      <div className="mb-8">
        <span className="text-xs uppercase tracking-widest text-terracotta font-semibold">
          Finalize Your Acquisition
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-terracotta-dark font-medium mt-1">
          Checkout
        </h1>
      </div>

      {/* Main Two-Column Layout (Order Summary shown first on mobile for context) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* ============================================================== */}
        {/* ORDER SUMMARY (Shown FIRST on mobile, RIGHT COLUMN on desktop) */}
        {/* ============================================================== */}
        <div className="order-1 lg:order-2 lg:col-span-5 xl:col-span-4">
          <div
            className="rounded-2xl p-6 sm:p-7 shadow-glass lg:sticky lg:top-28 space-y-5 transition-all"
            style={{
              background: 'rgba(253, 248, 240, 0.65)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
            }}
          >
            <div className="border-b border-terracotta/15 pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-terracotta font-semibold">
                  Summary
                </span>
                <h2 className="font-serif text-xl sm:text-2xl text-terracotta-dark font-medium">
                  Order Review
                </h2>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-terracotta/10 text-terracotta font-medium">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 divide-y divide-terracotta/10">
              {cartItems.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs sm:text-sm"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-12 rounded-lg overflow-hidden bg-terracotta-50 border border-white/60 flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-terracotta-400 font-serif">
                          ch
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif font-medium text-terracotta-dark truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-terracotta-600">
                        Size: {item.size} · Qty: 1
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-terracotta font-serif flex-shrink-0">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 pt-3 border-t border-terracotta/15 text-xs sm:text-sm text-terracotta-dark/85">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center">
                  Shipping <span className="text-[11px] text-terracotta-500 ml-1">(Flat rate)</span>
                </span>
                <span>₹{shipping.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-terracotta/15 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="font-serif text-base sm:text-lg font-semibold text-terracotta-dark">
                    Total Amount
                  </span>
                  <span className="block text-[10px] text-terracotta-600 font-light">
                    Inclusive of GST
                  </span>
                </div>
                <span className="font-serif text-2xl font-bold text-terracotta">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-terracotta-600 space-y-1">
              <p className="flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-terracotta" />
                <span>Zero synthetic chemicals · Hand-block guaranteed</span>
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CHECKOUT FORM & PAYMENT (LEFT COLUMN on desktop, 2nd on mobile) */}
        {/* ============================================================== */}
        <div className="order-2 lg:order-1 lg:col-span-7 xl:col-span-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* ---------------- SECTION 1: YOUR DETAILS ---------------- */}
            <div
              className="rounded-2xl p-6 sm:p-8 shadow-glass space-y-5"
              style={{
                background: 'rgba(253, 248, 240, 0.6)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <div className="border-b border-terracotta/15 pb-3">
                <span className="text-xs uppercase tracking-widest text-terracotta font-semibold">
                  Step 1
                </span>
                <h2 className="font-serif text-2xl text-terracotta-dark font-medium mt-0.5">
                  Your Details
                </h2>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-semibold uppercase tracking-wider text-terracotta-dark mb-1.5"
                  >
                    Full Name <span className="text-terracotta">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    {...register('fullName')}
                    placeholder="e.g. Radhika Apte"
                    className={`w-full rounded-lg text-sm text-terracotta-dark placeholder:text-terracotta-400/70 focus:outline-none transition-all duration-200 ${
                      errors.fullName
                        ? 'border-red-400 focus:ring-2 focus:ring-red-400/30'
                        : 'focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:shadow-[0_0_12px_rgba(139,69,32,0.15)]'
                    }`}
                    style={{
                      background: 'rgba(253, 248, 240, 0.5)',
                      border: '1px solid rgba(139, 69, 32, 0.2)',
                      padding: '12px',
                    }}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-semibold uppercase tracking-wider text-terracotta-dark mb-1.5"
                    >
                      Phone Number (10 digits) <span className="text-terracotta">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      maxLength={10}
                      {...register('phone')}
                      placeholder="e.g. 9876543210"
                      className={`w-full rounded-lg text-sm text-terracotta-dark placeholder:text-terracotta-400/70 focus:outline-none transition-all duration-200 ${
                        errors.phone
                          ? 'border-red-400 focus:ring-2 focus:ring-red-400/30'
                          : 'focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:shadow-[0_0_12px_rgba(139,69,32,0.15)]'
                      }`}
                      style={{
                        background: 'rgba(253, 248, 240, 0.5)',
                        border: '1px solid rgba(139, 69, 32, 0.2)',
                        padding: '12px',
                      }}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold uppercase tracking-wider text-terracotta-dark mb-1.5"
                    >
                      Email Address <span className="text-terracotta">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="radhika@example.com"
                      className={`w-full rounded-lg text-sm text-terracotta-dark placeholder:text-terracotta-400/70 focus:outline-none transition-all duration-200 ${
                        errors.email
                          ? 'border-red-400 focus:ring-2 focus:ring-red-400/30'
                          : 'focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:shadow-[0_0_12px_rgba(139,69,32,0.15)]'
                      }`}
                      style={{
                        background: 'rgba(253, 248, 240, 0.5)',
                        border: '1px solid rgba(139, 69, 32, 0.2)',
                        padding: '12px',
                      }}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------- SECTION 2: SHIPPING ADDRESS ---------------- */}
            <div
              className="rounded-2xl p-6 sm:p-8 shadow-glass space-y-5"
              style={{
                background: 'rgba(253, 248, 240, 0.6)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <div className="border-b border-terracotta/15 pb-3">
                <span className="text-xs uppercase tracking-widest text-terracotta font-semibold">
                  Step 2
                </span>
                <h2 className="font-serif text-2xl text-terracotta-dark font-medium mt-0.5">
                  Shipping Address
                </h2>
              </div>

              <div className="space-y-4">
                {/* Address Line 1 */}
                <div>
                  <label
                    htmlFor="addressLine1"
                    className="block text-xs font-semibold uppercase tracking-wider text-terracotta-dark mb-1.5"
                  >
                    Address Line 1 <span className="text-terracotta">*</span>
                  </label>
                  <input
                    id="addressLine1"
                    type="text"
                    {...register('addressLine1')}
                    placeholder="Flat / House No., Apartment, Street"
                    className={`w-full rounded-lg text-sm text-terracotta-dark placeholder:text-terracotta-400/70 focus:outline-none transition-all duration-200 ${
                      errors.addressLine1
                        ? 'border-red-400 focus:ring-2 focus:ring-red-400/30'
                        : 'focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:shadow-[0_0_12px_rgba(139,69,32,0.15)]'
                    }`}
                    style={{
                      background: 'rgba(253, 248, 240, 0.5)',
                      border: '1px solid rgba(139, 69, 32, 0.2)',
                      padding: '12px',
                    }}
                  />
                  {errors.addressLine1 && (
                    <p className="text-xs text-red-600 mt-1">{errors.addressLine1.message}</p>
                  )}
                </div>

                {/* Address Line 2 */}
                <div>
                  <label
                    htmlFor="addressLine2"
                    className="block text-xs font-semibold uppercase tracking-wider text-terracotta-dark mb-1.5"
                  >
                    Address Line 2 <span className="text-xs font-light text-terracotta-500">(Optional)</span>
                  </label>
                  <input
                    id="addressLine2"
                    type="text"
                    {...register('addressLine2')}
                    placeholder="Landmark, Area, Colony"
                    className="w-full rounded-lg text-sm text-terracotta-dark placeholder:text-terracotta-400/70 focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:shadow-[0_0_12px_rgba(139,69,32,0.15)] transition-all duration-200"
                    style={{
                      background: 'rgba(253, 248, 240, 0.5)',
                      border: '1px solid rgba(139, 69, 32, 0.2)',
                      padding: '12px',
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* City */}
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-xs font-semibold uppercase tracking-wider text-terracotta-dark mb-1.5"
                    >
                      City <span className="text-terracotta">*</span>
                    </label>
                    <input
                      id="city"
                      type="text"
                      {...register('city')}
                      placeholder="e.g. Jaipur"
                      className={`w-full rounded-lg text-sm text-terracotta-dark placeholder:text-terracotta-400/70 focus:outline-none transition-all duration-200 ${
                        errors.city
                          ? 'border-red-400 focus:ring-2 focus:ring-red-400/30'
                          : 'focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:shadow-[0_0_12px_rgba(139,69,32,0.15)]'
                      }`}
                      style={{
                        background: 'rgba(253, 248, 240, 0.5)',
                        border: '1px solid rgba(139, 69, 32, 0.2)',
                        padding: '12px',
                      }}
                    />
                    {errors.city && (
                      <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-xs font-semibold uppercase tracking-wider text-terracotta-dark mb-1.5"
                    >
                      State <span className="text-terracotta">*</span>
                    </label>
                    <select
                      id="state"
                      {...register('state')}
                      className={`w-full rounded-lg text-sm text-terracotta-dark focus:outline-none transition-all duration-200 cursor-pointer ${
                        errors.state
                          ? 'border-red-400 focus:ring-2 focus:ring-red-400/30'
                          : 'focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:shadow-[0_0_12px_rgba(139,69,32,0.15)]'
                      }`}
                      style={{
                        background: 'rgba(253, 248, 240, 0.5)',
                        border: '1px solid rgba(139, 69, 32, 0.2)',
                        padding: '12px',
                      }}
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="text-xs text-red-600 mt-1">{errors.state.message}</p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label
                      htmlFor="pincode"
                      className="block text-xs font-semibold uppercase tracking-wider text-terracotta-dark mb-1.5"
                    >
                      PIN Code <span className="text-terracotta">*</span>
                    </label>
                    <input
                      id="pincode"
                      type="text"
                      maxLength={6}
                      {...register('pincode')}
                      placeholder="e.g. 302001"
                      className={`w-full rounded-lg text-sm text-terracotta-dark placeholder:text-terracotta-400/70 focus:outline-none transition-all duration-200 ${
                        errors.pincode
                          ? 'border-red-400 focus:ring-2 focus:ring-red-400/30'
                          : 'focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:shadow-[0_0_12px_rgba(139,69,32,0.15)]'
                      }`}
                      style={{
                        background: 'rgba(253, 248, 240, 0.5)',
                        border: '1px solid rgba(139, 69, 32, 0.2)',
                        padding: '12px',
                      }}
                    />
                    {errors.pincode && (
                      <p className="text-xs text-red-600 mt-1">{errors.pincode.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------- SECTION 3: ACCOUNT OPT-IN ---------------- */}
            <div
              className="rounded-2xl p-5 sm:p-6 shadow-glass"
              style={{
                background: 'rgba(253, 248, 240, 0.5)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              <label className="flex items-start space-x-3 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  {...register('saveInfo')}
                  className="mt-0.5 w-4 h-4 rounded border-terracotta/30 text-terracotta focus:ring-terracotta accent-[#8B4520]"
                />
                <div className="text-xs sm:text-sm text-terracotta-dark leading-relaxed">
                  <span className="font-medium group-hover:text-terracotta transition-colors">
                    Save my info &amp; create an account for faster checkout next time
                  </span>
                  <p className="text-[11px] text-terracotta-600 mt-0.5">
                    Your artisanal sizing preferences and addresses will be safely remembered for future orders.
                  </p>
                </div>
              </label>
            </div>

            {/* ---------------- SECTION 4: PAYMENT (MANUAL UPI) ---------------- */}
            <div
              className="rounded-2xl p-6 sm:p-8 shadow-glass space-y-6"
              style={{
                background: 'rgba(253, 248, 240, 0.65)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
              }}
            >
              <div className="border-b border-terracotta/15 pb-3">
                <span className="text-xs uppercase tracking-widest text-terracotta font-semibold">
                  Step 3
                </span>
                <h2 className="font-serif text-2xl text-terracotta-dark font-medium mt-0.5">
                  Payment
                </h2>
              </div>

              {/* QR Code and UPI ID */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 sm:p-6 rounded-2xl bg-white/45 border border-terracotta/15">
                {/* QR Container */}
                <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-2xl overflow-hidden bg-white p-3 border border-terracotta/20 shadow-md flex-shrink-0 flex flex-col items-center justify-center">
                  <img
                    src="/upi-qr-placeholder.png"
                    alt="Scan to pay via UPI"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* QR Text & Copyable UPI */}
                <div className="flex-1 text-center sm:text-left space-y-2.5">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-terracotta-50 text-[11px] font-semibold text-terracotta border border-terracotta/20">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Instant Direct UPI</span>
                  </div>

                  <h3 className="font-serif text-lg font-medium text-terracotta-dark">
                    Scan to pay via UPI
                  </h3>

                  <p className="text-xs text-terracotta-dark/80 font-light">
                    Scan this QR using any UPI app (Google Pay, PhonePe, Paytm, BHIM) to transfer the order total:
                  </p>

                  {/* UPI ID box with copy button */}
                  <div className="pt-1">
                    <div className="inline-flex items-center space-x-3 px-3.5 py-2 rounded-xl bg-white/70 border border-terracotta/20 shadow-sm">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-terracotta-500 font-semibold block">
                          UPI ID
                        </span>
                        <span className="font-mono text-sm font-semibold text-terracotta-dark">
                          {CHHAPA_UPI_ID}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="p-1.5 rounded-lg hover:bg-terracotta/10 text-terracotta transition-colors"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? (
                          <Check className="w-4 h-4 text-green-700" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {copiedUpi && (
                      <span className="block text-[11px] text-green-700 mt-1">
                        Copied UPI ID to clipboard!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Instructions Text */}
              <div className="p-4 rounded-xl bg-terracotta/5 border border-terracotta/10 text-xs text-terracotta-dark/85 leading-relaxed space-y-1">
                <p className="font-medium text-terracotta">Payment Verification:</p>
                <p>
                  After completing payment, please send a screenshot of your payment confirmation to our WhatsApp number{' '}
                  <strong className="font-semibold text-terracotta-dark">{CHHAPA_WHATSAPP_DISPLAY}</strong>{' '}
                  along with your order details. Your order will be confirmed once payment is verified.
                </p>
              </div>

              {/* WhatsApp Us Button */}
              <div>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center py-3 px-5 rounded-xl bg-white/70 hover:bg-white text-emerald-800 border border-emerald-300 font-medium text-xs sm:text-sm tracking-wide transition-all shadow-sm hover:shadow"
                >
                  <MessageCircle className="w-4 h-4 mr-2 text-emerald-600" />
                  <span>WhatsApp Us (Pre-fill order message of ₹{total.toLocaleString('en-IN')})</span>
                </a>
              </div>

              {/* Final Place Order Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-full bg-[#8B4520] hover:bg-[#703517] text-white font-medium text-base tracking-wide transition-all duration-200 shadow-md hover:shadow-lg shadow-terracotta/25 hover:scale-[1.005] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Place Order (₹{total.toLocaleString('en-IN')})</span>
                </button>
                <p className="text-center text-[11px] text-terracotta-600 mt-2 font-light">
                  ✦ Clicking Place Order logs your details and provides your order confirmation receipt.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
