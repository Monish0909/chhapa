'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/store';

export function GlassNav() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const totalItems = useCartStore((state) => state.getTotalItems());
  const toggleCart = useCartStore((state) => state.toggleCart);
  const cartPulseTick = useCartStore((state) => state.cartPulseTick);
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  useEffect(() => {
    if (cartPulseTick > 0) {
      setIsCartBouncing(true);
      const timer = setTimeout(() => setIsCartBouncing(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartPulseTick]);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Hide nav on admin routes and homepage (homepage hero has its own integrated header)
  if (pathname?.startsWith('/admin') || pathname === '/') {
    return null;
  }

  const navLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'Craft', href: '/craft' },
    { name: 'Lookbook', href: '/lookbook' },
    { name: 'Login', href: '/login' },
    { name: 'Account', href: '/account' },
  ];

  return (
    <>
      <header className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[min(94vw,1100px)] pointer-events-none">
        <nav
          className={`pointer-events-auto w-full px-5 sm:px-8 py-3 sm:py-4 rounded-full flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'glass-nav-scrolled' : 'glass-effect'
          }`}
          style={{
            background: isScrolled ? 'rgba(253,248,240,0.92)' : 'rgba(253,248,240,0.72)',
            backdropFilter: isScrolled ? 'blur(10px)' : 'blur(12px)',
            WebkitBackdropFilter: isScrolled ? 'blur(10px)' : 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.35)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          {/* Brand / Logo */}
          <Link
            href="/"
            className="font-serif text-2xl sm:text-3xl tracking-wider text-terracotta-dark font-semibold hover:opacity-90 transition-opacity min-h-[44px] flex items-center"
          >
            chhapa
          </Link>

          {/* Desktop Links (Hidden below 768px) */}
          <div className="hidden md:flex items-center space-x-7 text-sm font-medium text-terracotta-dark">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors duration-200 hover:text-terracotta py-2 ${
                  pathname === link.href ? 'text-terracotta font-semibold' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions & Mobile Hamburger */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={toggleCart}
              className={`relative p-2.5 rounded-full hover:bg-white/40 text-terracotta-dark transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                isCartBouncing ? 'scale-125 text-terracotta' : 'scale-100'
              }`}
              aria-label="Open cart"
            >
              <ShoppingBag
                className={`w-5 h-5 transition-transform duration-300 ease-out ${
                  isCartBouncing ? '-rotate-12 scale-110 text-terracotta' : 'rotate-0'
                }`}
              />
              {isMounted && totalItems > 0 && (
                <span
                  className={`absolute top-1 right-1 bg-terracotta text-cream text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center transition-transform duration-300 ${
                    isCartBouncing ? 'scale-125 bg-terracotta-dark' : 'scale-100'
                  }`}
                >
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full hover:bg-white/40 text-terracotta-dark transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Full-Screen Glass Overlay Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#FDF8F0]/90 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-10 md:hidden animate-fadeIn">
          {/* Top Bar with Logo and Close X */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="font-serif text-3xl tracking-wider text-terracotta-dark font-semibold"
            >
              chhapa
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-full bg-white/50 text-terracotta-dark border border-white/60 min-w-[44px] min-h-[44px] flex items-center justify-center shadow-sm"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Centered Vertically Stacked Links */}
          <div className="flex flex-col space-y-6 my-auto text-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-serif text-3xl transition-colors py-2 min-h-[44px] flex items-center justify-center ${
                  pathname === link.href
                    ? 'text-terracotta font-semibold'
                    : 'text-terracotta-dark hover:text-terracotta'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Bottom Branding / Social Note */}
          <div className="text-center pt-4 border-t border-terracotta/10 text-xs text-terracotta-600">
            <p>Handcrafted block prints &amp; living dyes</p>
            <p className="mt-1 font-light opacity-80">Jaipur • Kutch • Ahmedabad</p>
          </div>
        </div>
      )}
    </>
  );
}
