'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import BorderGlow from '@/components/ui/BorderGlow';
import BlurText from '@/components/ui/BlurText';
import { BotanicalWatermark } from '@/components/ui/BotanicalWatermark';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful login / signup in mock mode
    try {
      localStorage.setItem('chhapa_user', 'true');
      if (formData.fullName) {
        localStorage.setItem('chhapa_user_name', formData.fullName);
      }
      if (formData.email) {
        localStorage.setItem('chhapa_user_email', formData.email);
      }
    } catch {
      // ignore in SSR or restricted storage
    }
    router.push('/account');
  };

  return (
    <div className="relative min-h-screen bg-[#FDF8F0] flex items-center justify-center pt-24 pb-20 px-4 sm:px-6 overflow-hidden">
      {/* Calm Botanical Line-Art Watermarks in opposing corners */}
      <BotanicalWatermark
        opacity={0.065}
        className="-top-24 -left-24 w-[520px] h-[520px] sm:w-[680px] sm:h-[680px]"
      />
      <BotanicalWatermark
        opacity={0.05}
        className="-bottom-32 -right-32 w-[600px] h-[600px] sm:w-[750px] sm:h-[750px] rotate-45"
      />

      {/* Subtle radial ambient glow behind card */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(238, 210, 197, 0.45) 0%, rgba(253, 248, 240, 0) 70%)',
        }}
      />

      {/* Centered Glass Card with BorderGlow */}
      <div className="relative z-10 w-full max-w-[440px]">
        <BorderGlow
          borderRadius={24}
          fillOpacity={0.3}
          backgroundColor="rgba(253, 248, 240, 0.65)"
          className="w-full shadow-glass"
        >
          <div
            className="p-8 sm:p-10 backdrop-blur-[20px] rounded-2xl"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.35)',
            }}
          >
            {/* Top Brand Wordmark / Emblem */}
            <div className="text-center mb-6">
              <Link
                href="/"
                className="inline-block font-serif text-3xl sm:text-4xl tracking-wider text-terracotta-dark font-semibold hover:opacity-90 transition-opacity"
              >
                chhapa
              </Link>
              <div className="flex items-center justify-center space-x-1.5 text-[10px] uppercase tracking-widest text-terracotta-600 mt-1">
                <Sparkles className="w-3 h-3 text-gold" />
                <span>Handcrafted Living Textiles</span>
                <Sparkles className="w-3 h-3 text-gold" />
              </div>
            </div>

            {/* Dynamic Animated Header & Subtext */}
            <div className="text-center min-h-[72px] flex flex-col items-center justify-center">
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
                      className="font-serif text-2xl sm:text-3xl text-center text-terracotta-dark font-medium justify-center"
                    />
                  </div>
                  <p className="text-xs text-terracotta-600 mt-1.5 font-light leading-relaxed">
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

              {/* Submit Button with press micro-interaction */}
              <div className="pt-2">
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full py-3.5 px-6 rounded-full bg-[#8B4520] hover:bg-[#703517] text-white font-medium text-sm tracking-wide transition-colors duration-200 shadow-md hover:shadow-lg shadow-terracotta/20 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>{isRegister ? 'Create Account' : 'Log In'}</span>
                  <ArrowRight className="w-4 h-4" />
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
