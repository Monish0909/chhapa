'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useAuth } from '@/lib/useAuth';
import StaggeredMenu from '@/components/ui/StaggeredMenu';

export function GlassNav() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const { isAuthenticated } = useAuth();
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



  // Hide nav on admin routes and homepage (homepage hero has its own integrated header)
  if (pathname?.startsWith('/admin') || pathname === '/') {
    return null;
  }

  // Reactive Navigation Links: Show "Account" when logged in, "Login" when logged out
  const navLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'Craft', href: '/craft' },
    { name: 'Lookbook', href: '/lookbook' },
    isAuthenticated
      ? { name: 'Account', href: '/account' }
      : { name: 'Login', href: '/login' },
  ];

  // Mobile Nav items with reactive auth state and live cart count
  const mobileNavItems = [
    { label: 'Shop', link: '/shop', ariaLabel: 'Shop Handcrafted Silhouettes' },
    { label: 'Our Craft', link: '/craft', ariaLabel: 'Our Botanical Craft Heritage' },
    { label: 'Lookbook', link: '/lookbook', ariaLabel: 'Editorial Lookbook' },
    {
      label: 'Cart',
      link: '/cart',
      ariaLabel: `Shopping Cart, ${totalItems} item${totalItems === 1 ? '' : 's'}`,
      badge: isMounted && totalItems > 0 ? totalItems : null,
    },
    isAuthenticated
      ? { label: 'Account', link: '/account', ariaLabel: 'Patron Account' }
      : { label: 'Login', link: '/login', ariaLabel: 'Customer Login' },
  ];

  const socialLinks = [
    { label: 'Instagram', link: 'https://instagram.com' },
  ];

  const handleMenuOpen = () => {
    document.body.style.overflow = 'hidden';
    if (typeof window !== 'undefined' && window.__lenis?.stop) {
      window.__lenis.stop();
    }
  };

  const handleMenuClose = () => {
    document.body.style.overflow = '';
    if (typeof window !== 'undefined' && window.__lenis?.start) {
      window.__lenis.start();
    }
  };

  return (
    <>
      {/* Mobile Staggered Menu (< 768px) */}
      <div className="md:hidden">
        <StaggeredMenu
          position="right"
          colors={['rgba(253,248,240,0.95)', 'rgba(240,214,168,0.4)']}
          accentColor="#8B4520"
          menuButtonColor="#3d2418"
          openMenuButtonColor="#3d2418"
          displayItemNumbering={true}
          closeOnClickAway={true}
          logoUrl="/logo.png"
          isFixed={true}
          items={mobileNavItems}
          socialItems={socialLinks}
          displaySocials={true}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
        />
      </div>

      {/* Desktop Floating Glass Navigation Bar (>= 768px only) */}
      <header className="hidden md:block fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-30 w-[min(94vw,1100px)] pointer-events-none">
        <nav
          className={`pointer-events-auto w-full px-5 sm:px-8 py-2.5 sm:py-3 rounded-full flex items-center justify-between transition-all duration-300 ${
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
            className="hover:opacity-90 transition-opacity min-h-[44px] flex items-center group py-0.5"
            aria-label="chhapa - Return to Home"
          >
            <img
              src="/logo.png"
              alt="chhapa"
              className="h-9 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Links (Hidden below 768px, desktop floating glass nav bar remains unchanged) */}
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

          {/* Actions: Shopping Bag (desktop & mobile) */}
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
          </div>
        </nav>
      </header>
    </>
  );
}
