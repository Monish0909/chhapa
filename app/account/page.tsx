'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import BlurText from '@/components/ui/BlurText';
import { BotanicalWatermark } from '@/components/ui/BotanicalWatermark';
import {
  Package,
  MapPin,
  User,
  Check,
  Plus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  LogOut,
  Clock,
} from 'lucide-react';

interface MockAccountOrder {
  id: string;
  orderNumber: string;
  itemName: string;
  size: string;
  date: string;
  price: number;
  status: 'Delivered' | 'Processing';
  image?: string;
}

interface SavedAddress {
  id: string;
  title: string;
  isDefault: boolean;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

const initialOrders: MockAccountOrder[] = [
  {
    id: 'ord-1',
    orderNumber: 'CHP-829140',
    itemName: 'Ajrakh Natural Indigo Shirt',
    size: 'M',
    date: 'Sep 24, 2026',
    price: 3499,
    status: 'Processing',
  },
  {
    id: 'ord-2',
    orderNumber: 'CHP-719342',
    itemName: 'Bagru Mud-Resist Mineral Kurta',
    size: 'S',
    date: 'Aug 18, 2026',
    price: 4199,
    status: 'Delivered',
  },
];

export default function AccountPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [userProfile, setUserProfile] = useState({
    fullName: 'Monish Sharma',
    email: 'monish@example.com',
    phone: '+91 98765 43210',
    memberTier: 'Patron Member',
  });

  const [orders] = useState<MockAccountOrder[]>(initialOrders);
  const [addresses, setAddresses] = useState<SavedAddress[]>([
    {
      id: 'addr-1',
      title: 'Home',
      isDefault: true,
      recipientName: 'Monish Sharma',
      phone: '+91 98765 43210',
      line1: '102 Heritage Enclave, Civil Lines',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302006',
    },
  ]);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: 'Studio',
    recipientName: '',
    phone: '',
    line1: '',
    city: '',
    state: 'Rajasthan',
    pincode: '',
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedName = localStorage.getItem('chhapa_user_name');
      const storedEmail = localStorage.getItem('chhapa_user_email');
      if (storedName || storedEmail) {
        setUserProfile((prev) => ({
          ...prev,
          fullName: storedName || prev.fullName,
          email: storedEmail || prev.email,
        }));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.setItem('chhapa_user', 'false');
    } catch {
      // ignore
    }
    router.push('/login');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      setProfileSaved(true);
      try {
        localStorage.setItem('chhapa_user_name', userProfile.fullName);
        localStorage.setItem('chhapa_user_email', userProfile.email);
      } catch {
        // ignore
      }
      setTimeout(() => setProfileSaved(false), 2400);
    }, 400);
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.line1 || !newAddress.city) return;
    const added: SavedAddress = {
      id: `addr-${Date.now()}`,
      title: newAddress.title || 'Other',
      isDefault: addresses.length === 0,
      recipientName: newAddress.recipientName || userProfile.fullName,
      phone: newAddress.phone || userProfile.phone,
      line1: newAddress.line1,
      city: newAddress.city,
      state: newAddress.state,
      pincode: newAddress.pincode,
    };
    setAddresses((curr) => [...curr, added]);
    setIsAddingAddress(false);
    setNewAddress({
      title: 'Studio',
      recipientName: '',
      phone: '',
      line1: '',
      city: '',
      state: 'Rajasthan',
      pincode: '',
    });
  };

  if (!isMounted) {
    return (
      <div className="pt-32 pb-24 max-w-5xl mx-auto px-4 min-h-[60vh] flex items-center justify-center">
        <div className="text-center font-serif text-terracotta-600 animate-pulse text-sm">
          Loading your sanctuary...
        </div>
      </div>
    );
  }

  // Animation variants for container stagger
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <div className="relative min-h-screen bg-[#FDF8F0] pt-28 sm:pt-32 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Botanical watermark linework layered in top-right and bottom-left */}
      <BotanicalWatermark
        opacity={0.06}
        className="-top-28 -right-28 w-[580px] h-[580px] sm:w-[720px] sm:h-[720px]"
      />
      <BotanicalWatermark
        opacity={0.05}
        className="-bottom-36 -left-36 w-[640px] h-[640px] sm:w-[800px] sm:h-[800px] rotate-90"
      />

      {/* Subtle radial ambient background wash */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse at 70% 20%, rgba(238, 210, 197, 0.35) 0%, rgba(253, 248, 240, 0) 65%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header Area */}
        <div className="mb-10 sm:mb-12 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-terracotta/15 pb-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-terracotta font-semibold">
              Artisan Patron Portal
            </span>
            <div className="flex items-baseline space-x-3 mt-1">
              <BlurText
                text={`Welcome back, ${userProfile.fullName.split(' ')[0]}`}
                direction="top"
                className="font-serif text-3xl sm:text-4xl lg:text-5xl text-terracotta-dark font-medium"
              />
            </div>
            <p className="text-xs sm:text-sm text-terracotta-600 mt-1 font-light">
              Manage your handcrafted commissions, delivery locations, and textile preferences.
            </p>
          </div>

          {/* Subtle Log Out text link */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center text-xs text-terracotta-600 hover:text-terracotta underline underline-offset-4 transition-colors font-medium group cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* 3 Staggered Glass Section Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* ========================================================== */}
          {/* SECTION 1: PROFILE DETAILS (4 cols on desktop) */}
          {/* ========================================================== */}
          <motion.div
            variants={cardVariants}
            className="lg:col-span-4 rounded-2xl p-6 sm:p-8 shadow-glass space-y-6"
            style={{
              background: 'rgba(253, 248, 240, 0.65)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-terracotta/15">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h2 className="font-serif text-xl text-terracotta-dark font-medium">
                  Profile
                </h2>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-gold/15 text-gold-dark border border-gold/30 font-medium">
                {userProfile.memberTier}
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-terracotta-dark mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userProfile.fullName}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, fullName: e.target.value })
                  }
                  className="w-full rounded-lg text-sm text-terracotta-dark focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 transition-all duration-200"
                  style={{
                    background: 'rgba(253, 248, 240, 0.55)',
                    border: '1px solid rgba(139, 69, 32, 0.2)',
                    padding: '10px 12px',
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-terracotta-dark mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={userProfile.email}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, email: e.target.value })
                  }
                  className="w-full rounded-lg text-sm text-terracotta-dark focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 transition-all duration-200"
                  style={{
                    background: 'rgba(253, 248, 240, 0.55)',
                    border: '1px solid rgba(139, 69, 32, 0.2)',
                    padding: '10px 12px',
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-terracotta-dark mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={userProfile.phone}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, phone: e.target.value })
                  }
                  className="w-full rounded-lg text-sm text-terracotta-dark focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 transition-all duration-200"
                  style={{
                    background: 'rgba(253, 248, 240, 0.55)',
                    border: '1px solid rgba(139, 69, 32, 0.2)',
                    padding: '10px 12px',
                  }}
                />
              </div>

              {/* Save Changes button with confirmation checkmark */}
              <div className="pt-2">
                <motion.button
                  type="submit"
                  disabled={isSavingProfile}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className={`w-full py-2.5 px-4 rounded-full font-medium text-xs tracking-wide transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-sm ${
                    profileSaved
                      ? 'bg-emerald-700 text-white shadow-emerald-700/20'
                      : 'bg-[#8B4520] hover:bg-[#703517] text-white shadow-terracotta/20'
                  }`}
                >
                  {profileSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 animate-bounce" />
                      <span>Changes Saved</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </motion.button>
              </div>
            </form>

            <div className="pt-4 border-t border-terracotta/10 space-y-1.5 text-[11px] text-terracotta-600 font-light">
              <p className="flex items-center space-x-1.5">
                <Sparkles className="w-3 h-3 text-gold" />
                <span>One-of-one silhouettes crafted per order</span>
              </p>
              <p className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3 h-3 text-terracotta" />
                <span>Member priority queue for custom botanical dyeings</span>
              </p>
            </div>
          </motion.div>

          {/* ========================================================== */}
          {/* SECTION 2 & 3 (8 cols on desktop) */}
          {/* ========================================================== */}
          <div className="lg:col-span-8 space-y-8">
            {/* ---------------- SECTION 2: ORDER HISTORY ---------------- */}
            <motion.div
              variants={cardVariants}
              className="rounded-2xl p-6 sm:p-8 shadow-glass space-y-5"
              style={{
                background: 'rgba(253, 248, 240, 0.65)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
              }}
            >
              <div className="flex items-center justify-between pb-4 border-b border-terracotta/15">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl text-terracotta-dark font-medium">
                      Order History
                    </h2>
                    <span className="text-[11px] text-terracotta-600 font-light">
                      Track handcrafted creations &amp; delivery status
                    </span>
                  </div>
                </div>
                <Link
                  href="/shop"
                  className="text-xs text-terracotta hover:text-terracotta-dark font-medium inline-flex items-center space-x-1"
                >
                  <span>Explore Shop</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-xl bg-white/30 border border-terracotta/10 text-terracotta-600 text-xs">
                  You have not placed any orders yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => {
                    const isDelivered = ord.status === 'Delivered';
                    return (
                      <div
                        key={ord.id}
                        className="p-4 sm:p-4.5 rounded-xl bg-white/45 hover:bg-white/75 border border-terracotta/15 hover:border-terracotta/30 transition-all duration-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-semibold text-terracotta">
                              {ord.orderNumber}
                            </span>
                            <span className="text-terracotta-300">•</span>
                            <span className="text-xs text-terracotta-500 font-light flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {ord.date}
                            </span>
                          </div>
                          <h4 className="font-serif text-base font-medium text-terracotta-dark group-hover:text-terracotta transition-colors">
                            {ord.itemName}
                          </h4>
                          <p className="text-[11px] text-terracotta-600">
                            Size: {ord.size} · One-of-one handcrafted edition
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-terracotta/10">
                          {/* Tinted Pill Badges */}
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide border shadow-2xs ${
                              isDelivered
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                isDelivered ? 'bg-emerald-600' : 'bg-amber-600 animate-pulse'
                              }`}
                            />
                            {ord.status}
                          </span>

                          <span className="font-serif text-base font-semibold text-terracotta mt-1">
                            ₹{ord.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* ---------------- SECTION 3: SAVED ADDRESSES ---------------- */}
            <motion.div
              variants={cardVariants}
              className="rounded-2xl p-6 sm:p-8 shadow-glass space-y-5"
              style={{
                background: 'rgba(253, 248, 240, 0.65)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
              }}
            >
              <div className="flex items-center justify-between pb-4 border-b border-terracotta/15">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl text-terracotta-dark font-medium">
                      Saved Addresses
                    </h2>
                    <span className="text-[11px] text-terracotta-600 font-light">
                      Manage shipping destinations for future checkouts
                    </span>
                  </div>
                </div>

                {!isAddingAddress && (
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(true)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#8B4520] hover:bg-[#703517] text-white text-xs font-medium tracking-wide transition-colors cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Add Address Form Accordion */}
              <AnimatePresence>
                {isAddingAddress && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    onSubmit={handleAddAddressSubmit}
                    className="p-5 rounded-xl bg-white/60 border border-terracotta/20 space-y-3 overflow-hidden shadow-sm"
                  >
                    <h3 className="font-serif text-sm font-semibold text-terracotta-dark">
                      New Shipping Address
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-terracotta-dark mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          value={newAddress.title}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, title: e.target.value })
                          }
                          placeholder="e.g. Home, Studio, Atelier"
                          className="w-full rounded-lg bg-white/80 border border-terracotta/20 p-2 text-xs text-terracotta-dark focus:outline-none focus:border-terracotta"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-terracotta-dark mb-1">
                          Recipient Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.recipientName}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              recipientName: e.target.value,
                            })
                          }
                          placeholder="Recipient full name"
                          className="w-full rounded-lg bg-white/80 border border-terracotta/20 p-2 text-xs text-terracotta-dark focus:outline-none focus:border-terracotta"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] uppercase font-semibold text-terracotta-dark mb-1">
                          Address Line 1
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.line1}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, line1: e.target.value })
                          }
                          placeholder="Flat, House No., Street, Locality"
                          className="w-full rounded-lg bg-white/80 border border-terracotta/20 p-2 text-xs text-terracotta-dark focus:outline-none focus:border-terracotta"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-terracotta-dark mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.city}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, city: e.target.value })
                          }
                          placeholder="City"
                          className="w-full rounded-lg bg-white/80 border border-terracotta/20 p-2 text-xs text-terracotta-dark focus:outline-none focus:border-terracotta"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-terracotta-dark mb-1">
                          PIN Code
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={newAddress.pincode}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, pincode: e.target.value })
                          }
                          placeholder="6-digit PIN"
                          className="w-full rounded-lg bg-white/80 border border-terracotta/20 p-2 text-xs text-terracotta-dark focus:outline-none focus:border-terracotta"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-full bg-[#8B4520] hover:bg-[#703517] text-white text-xs font-medium transition-colors cursor-pointer"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-4 py-2 rounded-full bg-cream-100 hover:bg-cream-200 text-terracotta-dark border border-terracotta/20 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Address List or Empty State */}
              {addresses.length === 0 ? (
                <div className="text-center py-10 px-6 rounded-2xl bg-white/35 border border-dashed border-terracotta/25 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto">
                    <MapPin className="w-5 h-5 text-terracotta" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-medium text-terracotta-dark">
                      No saved addresses yet
                    </h3>
                    <p className="text-xs text-terracotta-600 mt-1 max-w-sm mx-auto font-light">
                      Add a shipping address to enjoy seamless express checkout for one-of-one releases.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(true)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#8B4520] hover:bg-[#703517] text-white text-xs font-medium shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-5 rounded-xl bg-white/45 border border-terracotta/15 hover:border-terracotta/30 transition-all duration-300 shadow-sm space-y-2 text-xs relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-sm font-semibold text-terracotta-dark">
                          {addr.title}
                        </span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-terracotta/10 text-terracotta border border-terracotta/20">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-terracotta-dark">
                        {addr.recipientName}
                      </p>
                      <p className="text-terracotta-600 leading-relaxed">
                        {addr.line1}
                        {addr.line2 ? `, ${addr.line2}` : ''}
                        <br />
                        {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                      <p className="text-terracotta-500 font-mono text-[11px] pt-1">
                        {addr.phone}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
