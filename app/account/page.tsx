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
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
    itemName: 'Hand-Painted Indigo Bloom Silk-Cotton Shirt',
    size: 'M',
    date: 'Sep 24, 2026',
    price: 3499,
    status: 'Processing',
  },
  {
    id: 'ord-2',
    orderNumber: 'CHP-719342',
    itemName: 'Hand-Painted Mineral Terracotta Kurta',
    size: 'S',
    date: 'Aug 18, 2026',
    price: 4199,
    status: 'Delivered',
  },
];

export default function AccountPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);

  const [userProfile, setUserProfile] = useState({
    fullName: '',
    email: '',
    phone: '+91 98765 43210',
    memberTier: 'Patron Member',
  });

  const [orders] = useState<MockAccountOrder[]>(initialOrders);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
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

  // Check Supabase session on mount
  useEffect(() => {
    let isSubscribed = true;

    async function checkAuthAndLoadData() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session || !session.user) {
          router.push('/login');
          return;
        }

        if (isSubscribed) {
          const user = session.user;
          setCurrentUser(user);

          const fullNameFromMeta =
            (user.user_metadata?.full_name as string) ||
            (user.email ? user.email.split('@')[0] : 'Patron');

          setUserProfile((prev) => ({
            ...prev,
            email: user.email || '',
            fullName: fullNameFromMeta,
          }));

          setIsMounted(true);
        }

        // Fetch addresses from customer_addresses table for this user
        if (session.user) {
          setIsLoadingAddresses(true);
          const { data: addrData, error: addrError } = await supabase
            .from('customer_addresses')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

          if (addrError) {
            console.warn('[Supabase Addresses] Fetch note:', addrError.message);
          } else if (addrData && isSubscribed) {
            const formatted: SavedAddress[] = addrData.map((row) => ({
              id: row.id,
              title: row.title || 'Home',
              isDefault: Boolean(row.is_default),
              recipientName: row.recipient_name || '',
              phone: row.phone || '',
              line1: row.address_line1 || '',
              line2: row.address_line2 || '',
              city: row.city || '',
              state: row.state || '',
              pincode: row.pincode || '',
            }));
            setAddresses(formatted);
          }
          setIsLoadingAddresses(false);
        }
      } catch (err) {
        console.error('[Account] Auth check exception:', err);
        router.push('/login');
      }
    }

    checkAuthAndLoadData();

    // Listen to real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && isSubscribed) {
        router.push('/login');
      }
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[Account] Signout error:', err);
    }
    router.push('/');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      if (currentUser) {
        await supabase.auth.updateUser({
          data: {
            full_name: userProfile.fullName,
          },
        });
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2400);
    } catch (err) {
      console.error('[Account] Profile update error:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.line1 || !newAddress.city) return;

    setIsSavingAddress(true);

    const isFirstAddress = addresses.length === 0;

    try {
      if (currentUser?.id) {
        const { data, error } = await supabase
          .from('customer_addresses')
          .insert({
            user_id: currentUser.id,
            title: newAddress.title || 'Home',
            recipient_name: newAddress.recipientName || userProfile.fullName,
            phone: newAddress.phone || userProfile.phone,
            address_line1: newAddress.line1,
            city: newAddress.city,
            state: newAddress.state,
            pincode: newAddress.pincode,
            is_default: isFirstAddress,
          })
          .select()
          .single();

        if (error) {
          console.warn('[Supabase Addresses] Insert note:', error.message);
          // Fallback to local state if table not created yet in user project
          const added: SavedAddress = {
            id: `addr-${Date.now()}`,
            title: newAddress.title || 'Other',
            isDefault: isFirstAddress,
            recipientName: newAddress.recipientName || userProfile.fullName,
            phone: newAddress.phone || userProfile.phone,
            line1: newAddress.line1,
            city: newAddress.city,
            state: newAddress.state,
            pincode: newAddress.pincode,
          };
          setAddresses((curr) => [added, ...curr]);
        } else if (data) {
          const added: SavedAddress = {
            id: data.id,
            title: data.title || 'Home',
            isDefault: Boolean(data.is_default),
            recipientName: data.recipient_name || '',
            phone: data.phone || '',
            line1: data.address_line1 || '',
            line2: data.address_line2 || '',
            city: data.city || '',
            state: data.state || '',
            pincode: data.pincode || '',
          };
          setAddresses((curr) => [added, ...curr]);
        }
      } else {
        const added: SavedAddress = {
          id: `addr-${Date.now()}`,
          title: newAddress.title || 'Other',
          isDefault: isFirstAddress,
          recipientName: newAddress.recipientName || userProfile.fullName,
          phone: newAddress.phone || userProfile.phone,
          line1: newAddress.line1,
          city: newAddress.city,
          state: newAddress.state,
          pincode: newAddress.pincode,
        };
        setAddresses((curr) => [added, ...curr]);
      }

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
    } catch (err) {
      console.error('[Account] Add address exception:', err);
    } finally {
      setIsSavingAddress(false);
    }
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
    <div className="relative min-h-screen bg-[#FDF8F0] pt-28 sm:pt-36 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Subtle Gradient Wash: warm cream fading softly to faint terracotta at the edges */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 80% at 50% 30%, #FDF8F0 30%, #FAF1E4 65%, #F4E4D0 100%)',
        }}
      />

      {/* Prominent Botanical watermark linework layered in top-right and bottom-left */}
      <BotanicalWatermark
        opacity={0.11}
        className="-top-24 -right-24 w-[620px] h-[620px] sm:w-[820px] sm:h-[820px] rotate-[-15deg]"
      />
      <BotanicalWatermark
        opacity={0.09}
        className="-bottom-32 -left-32 w-[680px] h-[680px] sm:w-[900px] sm:h-[900px] rotate-90"
      />

      {/* Primary Top Ambient Glow Wash */}
      <div
        className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 z-0 w-[700px] h-[450px] sm:w-[900px] sm:h-[550px] rounded-full blur-[100px] sm:blur-[130px]"
        style={{
          background:
            'radial-gradient(ellipse, rgba(206, 123, 85, 0.22) 0%, rgba(229, 178, 93, 0.14) 50%, rgba(253, 248, 240, 0) 75%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header Area with more generous breathing room */}
        <div className="mb-12 sm:mb-16 flex flex-col sm:flex-row sm:items-baseline justify-between gap-5 border-b border-terracotta/15 pb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-terracotta font-semibold">
              Artisan Patron Portal
            </span>
            <div className="flex items-baseline space-x-3 mt-2">
              <BlurText
                text={`Welcome back, ${userProfile.fullName.split(' ')[0]}`}
                direction="top"
                className="font-serif text-3xl sm:text-5xl lg:text-6xl text-terracotta-dark font-medium tracking-tight"
              />
            </div>
            <p className="text-xs sm:text-sm text-terracotta-600 mt-2 font-light max-w-xl leading-relaxed">
              Manage your handcrafted commissions, delivery locations, and slow-living textile preferences.
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

        {/* 3 Staggered Glass Section Cards with Individual Ambient Glows & Generous Spacing */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start"
        >
          {/* ========================================================== */}
          {/* SECTION 1: PROFILE DETAILS (4 cols on desktop) */}
          {/* ========================================================== */}
          <motion.div variants={cardVariants} className="lg:col-span-4 relative group">
            {/* Ambient Terracotta Glow behind Profile Card */}
            <div
              className="pointer-events-none absolute -inset-2 rounded-3xl blur-[40px] opacity-70 group-hover:opacity-100 transition-opacity duration-500 -z-10"
              style={{
                background:
                  'radial-gradient(circle at 50% 30%, rgba(206, 123, 85, 0.25) 0%, rgba(229, 178, 93, 0.15) 50%, transparent 75%)',
              }}
            />

            <div
              className="relative rounded-3xl p-7 sm:p-9 shadow-glass space-y-6 backdrop-blur-[24px] overflow-hidden"
              style={{
                background: 'rgba(253, 248, 240, 0.72)',
                border: '1px solid rgba(255, 255, 255, 0.55)',
                boxShadow:
                  'inset 0 1px 1px 0 rgba(255, 255, 255, 0.95), 0 16px 40px -10px rgba(61, 36, 24, 0.1)',
              }}
            >
              {/* Top glass inner edge highlight */}
              <div className="glass-inner-highlight" />

              <div className="flex items-center justify-between pb-4 border-b border-terracotta/15">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center shadow-inner">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="font-serif text-2xl text-terracotta-dark font-medium">
                    Profile
                  </h2>
                </div>
                <span className="text-[11px] px-3 py-1 rounded-full bg-gold/15 text-gold-dark border border-gold/30 font-medium tracking-wide">
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
            </div>
          </motion.div>

          {/* ========================================================== */}
          {/* SECTION 2 & 3 (8 cols on desktop) */}
          {/* ========================================================== */}
          <div className="lg:col-span-8 space-y-10">
            {/* ---------------- SECTION 2: ORDER HISTORY ---------------- */}
            <motion.div variants={cardVariants} className="relative group">
              {/* Ambient Glow behind Order History */}
              <div
                className="pointer-events-none absolute -inset-2 rounded-3xl blur-[40px] opacity-60 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                style={{
                  background:
                    'radial-gradient(ellipse at 70% 30%, rgba(206, 123, 85, 0.22) 0%, rgba(229, 178, 93, 0.12) 50%, transparent 75%)',
                }}
              />

              <div
                className="relative rounded-3xl p-7 sm:p-9 shadow-glass space-y-6 backdrop-blur-[24px] overflow-hidden"
                style={{
                  background: 'rgba(253, 248, 240, 0.72)',
                  border: '1px solid rgba(255, 255, 255, 0.55)',
                  boxShadow:
                    'inset 0 1px 1px 0 rgba(255, 255, 255, 0.95), 0 16px 40px -10px rgba(61, 36, 24, 0.1)',
                }}
              >
                {/* Top glass inner edge highlight */}
                <div className="glass-inner-highlight" />

                <div className="flex items-center justify-between pb-4 border-b border-terracotta/15">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center shadow-inner">
                      <Package className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h2 className="font-serif text-2xl text-terracotta-dark font-medium">
                        Order History
                      </h2>
                      <span className="text-xs text-terracotta-600 font-light">
                        Track handcrafted creations &amp; delivery milestones
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/shop"
                    className="text-xs text-terracotta hover:text-terracotta-dark font-medium inline-flex items-center space-x-1 transition-colors"
                  >
                    <span>Explore Shop</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
              </div>
            </motion.div>

            {/* ---------------- SECTION 3: SAVED ADDRESSES ---------------- */}
            <motion.div variants={cardVariants} className="relative group">
              {/* Ambient Glow behind Saved Addresses */}
              <div
                className="pointer-events-none absolute -inset-2 rounded-3xl blur-[40px] opacity-60 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                style={{
                  background:
                    'radial-gradient(ellipse at 30% 70%, rgba(206, 123, 85, 0.22) 0%, rgba(229, 178, 93, 0.12) 50%, transparent 75%)',
                }}
              />

              <div
                className="relative rounded-3xl p-7 sm:p-9 shadow-glass space-y-6 backdrop-blur-[24px] overflow-hidden"
                style={{
                  background: 'rgba(253, 248, 240, 0.72)',
                  border: '1px solid rgba(255, 255, 255, 0.55)',
                  boxShadow:
                    'inset 0 1px 1px 0 rgba(255, 255, 255, 0.95), 0 16px 40px -10px rgba(61, 36, 24, 0.1)',
                }}
              >
                {/* Top glass inner edge highlight */}
                <div className="glass-inner-highlight" />

                <div className="flex items-center justify-between pb-4 border-b border-terracotta/15">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center shadow-inner">
                      <MapPin className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h2 className="font-serif text-2xl text-terracotta-dark font-medium">
                        Saved Addresses
                      </h2>
                      <span className="text-xs text-terracotta-600 font-light">
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
                        disabled={isSavingAddress}
                        className="px-4 py-2 rounded-full bg-[#8B4520] hover:bg-[#703517] disabled:opacity-60 text-white text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5"
                      >
                        {isSavingAddress && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>{isSavingAddress ? 'Saving...' : 'Save Address'}</span>
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
              {isLoadingAddresses ? (
                <div className="text-center py-10 flex flex-col items-center justify-center space-y-2 text-terracotta-600 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-terracotta" />
                  <span>Loading saved addresses...</span>
                </div>
              ) : addresses.length === 0 ? (
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
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
