'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import BorderGlow from '@/components/ui/BorderGlow';
import BlurText from '@/components/ui/BlurText';
import { BotanicalWatermark } from '@/components/ui/BotanicalWatermark';
import { Sparkles, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailTrimmed = formData.email.trim();
    const password = formData.password;

    try {
      if (isRegister) {
        // Sign Up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: emailTrimmed,
          password,
          options: {
            data: {
              full_name: formData.fullName.trim() || undefined,
            },
          },
        });

        if (error) {
          setErrorMessage(error.message);
          setIsSubmitting(false);
          return;
        }

        // If email confirmation is enabled on Supabase project, session may be null
        if (data?.user && !data?.session) {
          setSuccessMessage(
            'Account created! Please check your email inbox to verify your account before logging in.'
          );
          setIsSubmitting(false);
          return;
        }

        // Successful registration with active session
        router.push('/account');
      } else {
        // Sign In with Supabase Auth
        const { error } = await supabase.auth.signInWithPassword({
          email: emailTrimmed,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          setIsSubmitting(false);
          return;
        }

        // Successful login
        router.push('/account');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FDF8F0] flex items-center justify-center pt-28 pb-24 px-4 sm:px-6 overflow-hidden">
      {/* Background Subtle Gradient Wash: warm cream fading softly to faint terracotta at the edges */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 45%, #FDF8F0 25%, #FAF1E4 65%, #F5E5D3 100%)',
        }}
      />

      {/* Prominent Botanical Line-Art Watermarks in opposing corners */}
      <BotanicalWatermark
        opacity={0.11}
        className="-top-20 -left-20 w-[580px] h-[580px] sm:w-[760px] sm:h-[760px] rotate-[-12deg]"
      />
      <BotanicalWatermark
        opacity={0.09}
        className="-bottom-28 -right-28 w-[640px] h-[640px] sm:w-[840px] sm:h-[840px] rotate-45"
      />

      {/* Large Blurred Ambient Glow Behind Card (Terracotta/Gold depth bleeding into page) */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-[520px] h-[520px] sm:w-[680px] sm:h-[680px] rounded-full blur-[80px] sm:blur-[110px]"
        style={{
          background:
            'radial-gradient(circle, rgba(206, 123, 85, 0.28) 0%, rgba(229, 178, 93, 0.18) 45%, rgba(253, 248, 240, 0) 75%)',
        }}
      />

      {/* Centered Glass Card with BorderGlow */}
      <div className="relative z-10 w-full max-w-[460px]">
        <BorderGlow
          borderRadius={28}
          fillOpacity={0.25}
          backgroundColor="rgba(253, 248, 240, 0.7)"
          className="w-full shadow-glass hover:shadow-glass-hover transition-all duration-300"
        >
          <div
            className="relative p-9 sm:p-12 backdrop-blur-[24px] rounded-[28px] overflow-hidden"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.55)',
              boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.95), 0 16px 40px -10px rgba(61, 36, 24, 0.12)',
            }}
          >
            {/* Subtle Inner Highlight Catching Light at the Top Edge of Glass Card */}
            <div className="glass-inner-highlight" />

            {/* Top Brand Wordmark / Emblem */}
            <div className="text-center mb-7">
              <Link
                href="/"
                className="inline-block font-serif text-3xl sm:text-4xl tracking-wider text-terracotta-dark font-semibold hover:opacity-90 transition-opacity"
              >
                chhapa
              </Link>
              <div className="flex items-center justify-center space-x-2 text-[10px] uppercase tracking-widest text-terracotta-600 mt-1.5 font-medium">
                <Sparkles className="w-3 h-3 text-gold" />
                <span>Handcrafted Slow Living</span>
                <Sparkles className="w-3 h-3 text-gold" />
              </div>
            </div>

            {/* Dynamic Animated Header & Subtext */}
            <div className="text-center min-h-[76px] flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isRegister ? 'signup-title' : 'login-title'}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  <div className="flex justify-center">
                    <BlurText
                      text={isRegister ? 'Create Account' : 'Log In'}
                      direction="top"
                      className="font-serif text-3xl sm:text-4xl text-center text-terracotta-dark font-medium justify-center tracking-tight"
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-terracotta-600 mt-2 font-light leading-relaxed">
                    {isRegister
                      ? 'Join Chhapa to save your favorites, custom sizes, and track orders.'
                      : 'Welcome back to Chhapa — continue your artisanal journey.'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Crossfading Form Fields */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isRegister ? 'register-fields' : 'login-fields'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4"
                >
                  {isRegister && (
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-xs font-semibold uppercase tracking-wider text-terracotta-dark mb-1.5"
                      >
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="e.g. Radhika Apte"
                        className="w-full rounded-lg text-sm text-terracotta-dark placeholder:text-terracotta-400/70 focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:shadow-[0_0_12px_rgba(139,69,32,0.15)] transition-all duration-200"
                        style={{
                          background: 'rgba(253, 248, 240, 0.5)',
                          border: '1px solid rgba(139, 69, 32, 0.2)',
                          padding: '12px',
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold uppercase tracking-wider text-terracotta-dark mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="you@example.com"
                      className="w-full rounded-lg text-sm text-terracotta-dark placeholder:text-terracotta-400/70 focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:shadow-[0_0_12px_rgba(139,69,32,0.15)] transition-all duration-200"
                      style={{
                        background: 'rgba(253, 248, 240, 0.5)',
                        border: '1px solid rgba(139, 69, 32, 0.2)',
                        padding: '12px',
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="password"
                        className="block text-xs font-semibold uppercase tracking-wider text-terracotta-dark"
                      >
                        Password
                      </label>
                      {!isRegister && (
                        <button
                          type="button"
                          onClick={() => alert('Password reset link will be sent to your email')}
                          className="text-[11px] text-terracotta-500 hover:text-terracotta transition-colors"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="••••••••••••"
                      className="w-full rounded-lg text-sm text-terracotta-dark placeholder:text-terracotta-400/70 focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:shadow-[0_0_12px_rgba(139,69,32,0.15)] transition-all duration-200"
                      style={{
                        background: 'rgba(253, 248, 240, 0.5)',
                        border: '1px solid rgba(139, 69, 32, 0.2)',
                        padding: '12px',
                      }}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-50/90 border border-red-200/80 text-red-900 text-xs flex items-start space-x-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Success Message Alert */}
            {successMessage && (
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-900 text-xs flex items-start space-x-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{successMessage}</div>
              </div>
            )}

            {/* Submit Button with press micro-interaction */}
            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={isSubmitting ? {} : { scale: 0.97 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="w-full py-3.5 px-6 rounded-full bg-[#8B4520] hover:bg-[#703517] disabled:opacity-60 text-white font-medium text-sm tracking-wide transition-colors duration-200 shadow-md hover:shadow-lg shadow-terracotta/20 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isRegister ? 'Creating Account...' : 'Signing In...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isRegister ? 'Create Account' : 'Log In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
            </form>

            {/* Toggle Between Login & Signup */}
            <div className="mt-6 pt-5 border-t border-terracotta/15 text-center space-y-3">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs text-terracotta hover:text-terracotta-dark font-medium transition-colors cursor-pointer"
              >
                {isRegister
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Create one"}
              </button>

              {/* Continue as Guest Link */}
              <div>
                <Link
                  href="/shop"
                  className="inline-block text-xs text-terracotta-600/80 hover:text-terracotta underline underline-offset-4 transition-colors font-light"
                >
                  Continue as Guest →
                </Link>
              </div>
            </div>

            {/* Reassurance Guarantee Footer */}
            <div className="mt-6 pt-4 border-t border-terracotta/10 flex items-center justify-center space-x-1.5 text-[11px] text-terracotta-500 font-light">
              <ShieldCheck className="w-3.5 h-3.5 text-terracotta" />
              <span>Slow fashion community · Privacy guaranteed</span>
            </div>
          </div>
        </BorderGlow>
      </div>
    </div>
  );
}
