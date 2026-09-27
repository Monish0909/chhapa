'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useCartStore } from '@/lib/store';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';
import BorderGlow from '@/components/ui/BorderGlow';
import BlurText from '@/components/ui/BlurText';
import GlowCursor from '@/components/ui/GlowCursor';
import { getProducts, MockProduct } from '@/lib/products';
import { useAuth } from '@/lib/useAuth';
import StaggeredMenu from '@/components/ui/StaggeredMenu';

// Register GSAP ScrollTrigger plugin on client
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Curated sample products fallback for the featured collection section
const initialFeaturedProducts: MockProduct[] = [
  {
    id: '1',
    slug: 'indigo-bloom-silk-cotton-shirt',
    name: 'Hand-Painted Indigo Bloom Silk-Cotton Shirt',
    tagline: 'Freehand brush-painted on handspun organic cotton with natural indigo',
    price: 3499,
    originalPrice: 4200,
    category: 'women',
    images: ['/frames/home/frame_0001.jpg'],
    sizes: ['S', 'M', 'L'],
    shipsInDays: '7-10 days',
    sold: false,
    fabricCare: 'Gentle handwash with natural detergent',
    details: '100% natural organic cotton hand-painted freehand with botanical indigo.',
    shippingReturns: 'Free insured shipping across India.',
    sizeChart: [],
    createdAt: '2026-09-24T00:00:00.000Z',
  },
  {
    id: '2',
    slug: 'terracotta-brush-kurta',
    name: 'Hand-Painted Mineral Terracotta Kurta',
    tagline: 'Freehand brush stroke motifs rendered in mineral terracotta dye & harda',
    price: 4199,
    originalPrice: 4800,
    category: 'women',
    images: ['/frames/home/frame_0015.jpg'],
    sizes: ['S', 'M', 'L'],
    shipsInDays: '7-10 days',
    sold: false,
    fabricCare: 'Gentle handwash with natural detergent',
    details: '100% natural organic cotton painted with earth mineral pigments.',
    shippingReturns: 'Free insured shipping across India.',
    sizeChart: [],
    createdAt: '2026-09-23T00:00:00.000Z',
  },
  {
    id: '3',
    slug: 'kalamkari-silk-stole',
    name: 'Kalamkari Botanical Silk Stole',
    tagline: 'Pen and brush drawn natural dyed mulberry silk',
    price: 2899,
    originalPrice: 3500,
    category: 'accessories',
    images: ['/frames/home/frame_0035.jpg'],
    sizes: ['One Size'],
    shipsInDays: '7-10 days',
    sold: false,
    fabricCare: 'Dry clean only',
    details: 'Hand-drawn Kalamkari motifs with soft brush detailing.',
    shippingReturns: 'Free insured shipping across India.',
    sizeChart: [],
    createdAt: '2026-09-21T00:00:00.000Z',
  },
  {
    id: '4',
    slug: 'botanical-linen-dress',
    name: 'Hand-Painted Botanical Linen Dress',
    tagline: 'Pure breathable linen with delicate hand-painted floral motifs',
    price: 5299,
    originalPrice: 5999,
    category: 'women',
    images: ['/frames/home/frame_0055.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    shipsInDays: '7-10 days',
    sold: false,
    fabricCare: 'Gentle handwash with natural detergent',
    details: 'Breathable linen handcrafted silhouette with freehand brush art.',
    shippingReturns: 'Free insured shipping across India.',
    sizeChart: [],
    createdAt: '2026-09-18T00:00:00.000Z',
  },
];

export default function HomePage() {
  const [productsList, setProductsList] = React.useState<MockProduct[]>(initialFeaturedProducts);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const [isMounted, setIsMounted] = React.useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const toggleCart = useCartStore((state) => state.toggleCart);
  const addItem = useCartStore((state) => state.addItem);

  const { isAuthenticated } = useAuth();

  const homeNavLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'Craft', href: '/craft' },
    { name: 'Lookbook', href: '/lookbook' },
    isAuthenticated
      ? { name: 'Account', href: '/account' }
      : { name: 'Login', href: '/login' },
  ];

  const framePath = '/frames/home';
  const frameCount = 192;

  useEffect(() => {
    setIsMounted(true);

    const isActive = true;
    getProducts()
      .then((items) => {
        if (isActive && items && items.length > 0) {
          setProductsList(items.slice(0, 4));
        }
      })
      .catch((err) => console.warn('Supabase home products load:', err));

    const canvas = canvasRef.current;
    const contentWrapper = contentWrapperRef.current;
    const heroText = heroTextRef.current;
    const glassNav = navRef.current;

    if (!canvas || !contentWrapper) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ====================================================
    // 1. LENIS SMOOTH SCROLL SETUP
    // ====================================================
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Synchronize Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Expose lenis globally for overlay lock coordination
    if (typeof window !== 'undefined') {
      window.__lenis = lenis;
    }

    // Drive Lenis RAF through GSAP ticker for synchronous scroll scrub precision
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // ====================================================
    // 2. CANVAS SIZING & COVER-FIT LOGIC (DPR SUPPORT)
    // ====================================================
    const setCanvasDimensions = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform matrix
      ctx.scale(dpr, dpr);
    };

    setCanvasDimensions();

    // Plain object containing frame index for GSAP to animate
    const playhead = { frame: 0 };
    const images: HTMLImageElement[] = [];

    // Helper: Draw current frame on canvas with object-fit: cover
    const renderFrame = (index: number) => {
      // Clamp frame index strictly to bounds so it holds on last frame
      const safeIndex = Math.min(Math.max(index, 0), frameCount - 1);
      const img = images[safeIndex];
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      if (img && img.complete && img.naturalWidth > 1 && img.naturalHeight > 1) {
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = width / height;

        let drawWidth = width;
        let drawHeight = height;
        let offsetX = 0;
        let offsetY = 0;

        if (canvasRatio > imgRatio) {
          // Canvas is wider than image
          drawWidth = width;
          drawHeight = width / imgRatio;
          offsetY = (height - drawHeight) / 2;
        } else {
          // Canvas is taller than image
          drawHeight = height;
          drawWidth = height * imgRatio;
          offsetX = (width - drawWidth) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      } else {
        // Aesthetic earthy canvas background while sequence frames load
        const gradient = ctx.createRadialGradient(
          width / 2,
          height / 2,
          50,
          width / 2,
          height / 2,
          Math.max(width, height) / 1.1
        );
        gradient.addColorStop(0, '#5C2D16');
        gradient.addColorStop(0.4, '#3D2418');
        gradient.addColorStop(0.8, '#22110B');
        gradient.addColorStop(1, '#140A05');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Subtle hand-painted botanical heritage radial motif that pulses with scroll playhead
        const progress = safeIndex / Math.max(frameCount - 1, 1);
        ctx.save();
        ctx.strokeStyle = 'rgba(244, 194, 194, 0.08)';
        ctx.lineWidth = 1.5;
        const baseRadius = 80 + progress * 130;
        for (let r = 0; r < 5; r++) {
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, baseRadius + r * 50, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    };

    // ====================================================
    // 3. PRELOAD IMAGE SEQUENCE
    // ====================================================
    let firstFrameLoaded = false;
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(4, '0');
      img.src = `${framePath}/frame_${paddedIndex}.jpg`;

      img.onload = () => {
        if (!firstFrameLoaded && i === 1) {
          firstFrameLoaded = true;
          renderFrame(0);
        }
      };
      images.push(img);
    }

    // Immediate initial draw
    renderFrame(0);

    // ====================================================
    // 4. GSAP SCROLLTRIGGER ANIMATIONS (FULL PAGE SCROLL)
    // ====================================================
    const ctxCleanup = gsap.context(() => {
      // Scrub through video frames across the entire page's scrollable height
      gsap.to(playhead, {
        frame: frameCount - 1,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
          trigger: contentWrapper,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2,
          onUpdate: () => {
            const rawFrame = Math.round(playhead.frame);
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            // On mobile, snap to nearest even frame to halve render overhead
            const currentFrame = isMobile ? Math.floor(rawFrame / 2) * 2 : rawFrame;
            renderFrame(currentFrame);
          },
        },
      });

      // Hero text fades out as user scrolls past first ~50vh
      if (heroText) {
        gsap.to(heroText, {
          opacity: 0,
          y: -40,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: contentWrapper,
            start: 'top top',
            end: '50% top',
            scrub: true,
          },
        });
      }

      // Nav bar transitions to denser glass once scrolled past first viewport
      if (glassNav) {
        ScrollTrigger.create({
          trigger: contentWrapper,
          start: '80vh top',
          onEnter: () => {
            gsap.to(glassNav, {
              backgroundColor: 'rgba(253, 248, 240, 0.90)',
              backdropFilter: 'blur(12px)',
              duration: 0.3,
            });
          },
          onLeaveBack: () => {
            gsap.to(glassNav, {
              backgroundColor: 'rgba(253, 248, 240, 0.65)',
              backdropFilter: 'blur(16px)',
              duration: 0.3,
            });
          },
        });
      }
    });

    // ====================================================
    // 5. WINDOW RESIZE HANDLING
    // ====================================================
    const handleResize = () => {
      setCanvasDimensions();
      renderFrame(Math.round(playhead.frame));
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    // ====================================================
    // 6. CLEANUP
    // ====================================================
    return () => {
      window.removeEventListener('resize', handleResize);
      ctxCleanup.revert();
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-transparent selection:bg-terracotta-200">
      {/* ------------------------------------------------------------------ */}
      {/* 1. FIXED PERSISTENT CANVAS BACKGROUND (z-0, stays pinned, never scrolls) */}
      {/* ------------------------------------------------------------------ */}
      <canvas
        id="bg-canvas"
        ref={canvasRef}
        className="fixed top-0 left-0 w-screen h-screen z-0 pointer-events-none block"
      />

      {/* ------------------------------------------------------------------ */}
      {/* 2. FIXED SOFT DARK GRADIENT OVERLAY (z-1, text legibility) */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(20,10,5,0.1) 0%, rgba(20,10,5,0.05) 30%, rgba(20,10,5,0.25) 100%)',
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* 3. FLOATING GLASS NAVIGATION (z-20, fixed top, desktop only) */}
      {/* ------------------------------------------------------------------ */}
      <header className="hidden md:block fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-20 w-[min(94vw,1100px)] pointer-events-none">
        <nav
          ref={navRef}
          id="global-glass-nav"
          className="pointer-events-auto w-full px-5 sm:px-8 py-3 sm:py-4 rounded-full flex items-center justify-between transition-all duration-300"
          style={{
            background: 'rgba(253,248,240,0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.3)',
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

          <div className="flex items-center space-x-2 sm:space-x-8">
            <div className="hidden md:flex items-center space-x-7 text-sm font-medium text-terracotta-dark">
              {homeNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-terracotta transition-colors py-2"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <button
              onClick={toggleCart}
              className="relative p-2.5 rounded-full hover:bg-white/40 text-terracotta-dark transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {isMounted && totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-terracotta text-cream text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

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
          items={[
            { label: 'Shop', link: '/shop', ariaLabel: 'Shop Handcrafted Silhouettes' },
            { label: 'Our Craft', link: '/craft', ariaLabel: 'Our Craft Story' },
            { label: 'Lookbook', link: '/lookbook', ariaLabel: 'Lookbook' },
            {
              label: 'Cart',
              link: '/cart',
              ariaLabel: `Shopping Cart, ${totalItems} item${totalItems === 1 ? '' : 's'}`,
              badge: isMounted && totalItems > 0 ? totalItems : null,
            },
            isAuthenticated
              ? { label: 'Account', link: '/account', ariaLabel: 'Patron Account' }
              : { label: 'Login', link: '/login', ariaLabel: 'Customer Login' },
          ]}
          socialItems={[{ label: 'Instagram', link: 'https://instagram.com' }]}
          displaySocials={true}
          onMenuOpen={() => {
            document.body.style.overflow = 'hidden';
            if (typeof window !== 'undefined' && window.__lenis?.stop) {
              window.__lenis.stop();
            }
          }}
          onMenuClose={() => {
            document.body.style.overflow = '';
            if (typeof window !== 'undefined' && window.__lenis?.start) {
              window.__lenis.start();
            }
          }}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. NORMAL-FLOW SCROLLING CONTENT CONTAINER (z-10, transparent) */}
      {/* ------------------------------------------------------------------ */}
      <div
        id="page-content"
        ref={contentWrapperRef}
        className="relative z-10 bg-transparent flex flex-col space-y-28 pb-20"
      >
        {/* ================================================================ */}
        {/* SECTION A: FIRST VIEWPORT HERO TEXT (Centered Tagline) */}
        {/* ================================================================ */}
        <section className="min-h-screen relative w-full">
          <GlowCursor
            opacity={0.6}
            glowIntensity={1.2}
            className="min-h-screen flex items-center justify-center px-4 sm:px-6"
          >
            <div ref={heroTextRef} className="max-w-3xl w-full text-center mx-auto">
              <GlassPanel
                className="p-8 sm:p-12 shadow-2xl border-white/50"
                style={{
                  background: 'rgba(253,248,240,0.7)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                <div className="inline-flex items-center space-x-2 mb-3">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span className="text-xs uppercase tracking-widest text-terracotta font-semibold">
                    Handcrafted Heritage Textiles
                  </span>
                </div>

                <div className="flex justify-center">
                  <BlurText
                    text="Painted by hand, worn with story."
                    direction="top"
                    className="font-serif text-3xl sm:text-5xl lg:text-6xl text-terracotta-dark font-medium leading-tight justify-center text-center"
                  />
                </div>

                <p className="mt-4 text-sm sm:text-base text-terracotta-dark/80 max-w-lg mx-auto font-light leading-relaxed">
                  Slow-crafted botanical hand-painted textiles and timeless silhouettes designed for mindful living.
                </p>

                <div className="mt-8 flex justify-center gap-4">
                  <Link href="/shop">
                    <GlassButton variant="solid" size="lg">
                      Shop Collection
                    </GlassButton>
                  </Link>
                  <Link href="/craft">
                    <GlassButton variant="glass" size="lg">
                      Our Craft Story
                    </GlassButton>
                  </Link>
                </div>
              </GlassPanel>
            </div>
          </GlowCursor>
        </section>

        
        {/* ================================================================ */}
        {/* SECTION A.5: SHOP WOMEN & SHOP KIDS ENTRY CARDS */}
        {/* ================================================================ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Shop Women Card */}
            <BorderGlow
              borderRadius={28}
              fillOpacity={0.4}
              backgroundColor="rgba(253, 248, 240, 0.7)"
              className="w-full"
            >
              <div className="p-8 sm:p-10 flex flex-col justify-between h-full min-h-[300px]">
                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-widest text-terracotta font-semibold">
                    Handcrafted Apparel
                  </span>
                  <h3 className="font-serif text-3xl sm:text-4xl text-terracotta-dark font-medium">
                    Shop Women
                  </h3>
                  <p className="text-sm text-terracotta-dark/80 max-w-sm leading-relaxed font-light">
                    Flowing silhouettes, handspun cotton kurtas, mineral-washed tiered dresses, and artisanal silk stoles.
                  </p>
                </div>
                <div className="pt-6">
                  <Link href="/shop?category=women">
                    <GlassButton variant="solid" size="md">
                      Explore Women&apos;s Edit <ArrowRight className="w-4 h-4 ml-2 inline" />
                    </GlassButton>
                  </Link>
                </div>
              </div>
            </BorderGlow>

            {/* Shop Kids Card */}
            <BorderGlow
              borderRadius={28}
              fillOpacity={0.4}
              backgroundColor="rgba(253, 248, 240, 0.7)"
              className="w-full"
            >
              <div className="p-8 sm:p-10 flex flex-col justify-between h-full min-h-[300px]">
                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-widest text-terracotta font-semibold">
                    Little Chhapa Edit
                  </span>
                  <h3 className="font-serif text-3xl sm:text-4xl text-terracotta-dark font-medium">
                    Shop Kids
                  </h3>
                  <p className="text-sm text-terracotta-dark/80 max-w-sm leading-relaxed font-light">
                    Gentle organic cotton frocks, natural indigo play sets, and hand-painted quilted Nehru vests for tender skin.
                  </p>
                </div>
                <div className="pt-6">
                  <Link href="/shop?category=kids">
                    <GlassButton variant="solid" size="md">
                      Explore Kids&apos; Craft <ArrowRight className="w-4 h-4 ml-2 inline" />
                    </GlassButton>
                  </Link>
                </div>
              </div>
            </BorderGlow>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION B: FEATURED PRODUCTS IN GLASS PANEL CONTAINER */}
        {/* ================================================================ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <GlassPanel
            className="p-8 sm:p-12 shadow-2xl border-white/40"
            style={{
              background: 'rgba(253,248,240,0.7)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-terracotta/10">
              <div>
                <span className="text-xs uppercase tracking-widest text-terracotta font-semibold">
                  Curated Edit
                </span>
                <BlurText
                  text="Featured Silhouettes"
                  direction="top"
                  className="font-serif text-3xl sm:text-4xl text-terracotta-dark font-medium mt-1"
                />
              </div>
              <Link href="/shop" className="mt-4 md:mt-0 flex items-center text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors">
                View All Silhouettes <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {productsList.map((product) => (
                <BorderGlow
                  key={product.id}
                  borderRadius={16}
                  fillOpacity={0.4}
                  backgroundColor="rgba(255, 255, 255, 0.55)"
                  className="h-full"
                >
                  <div className="p-4 flex flex-col justify-between h-full group">
                    <div>
                      <div className="aspect-[3/4] rounded-xl bg-terracotta-50 overflow-hidden relative flex items-center justify-center font-serif text-terracotta-400">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <span className="text-xs uppercase tracking-wider">chhapa silhouette</span>
                        )}
                        <div className="absolute top-2.5 left-2.5">
                          <Badge variant="terracotta">{product.category}</Badge>
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="text-[11px] uppercase tracking-wider text-terracotta-600 font-semibold">
                          {product.category}
                        </span>
                        <Link href={`/shop/${product.slug}`}>
                          <h3 className="font-serif text-base font-medium text-terracotta-dark mt-0.5 group-hover:text-terracotta transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-terracotta-dark/70 mt-1 line-clamp-2">
                          {product.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-terracotta/10 flex items-center justify-between">
                      <div>
                        <span className="text-base font-semibold text-terracotta">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs line-through text-terracotta-400 ml-1.5">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          addItem({
                            productId: product.id,
                            name: product.name,
                            price: product.price,
                            size: 'M',
                            quantity: 1,
                            image: '',
                          })
                        }
                        className="p-2 rounded-full bg-terracotta/10 hover:bg-terracotta hover:text-cream text-terracotta transition-colors"
                        title="Add to Bag"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </BorderGlow>
              ))}
            </div>
          </GlassPanel>
        </section>

        {/* ================================================================ */}
        {/* SECTION C: CRAFT TEASER CARD IN GLASS PANEL */}
        {/* ================================================================ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 w-full">
          <BorderGlow
            borderRadius={28}
            fillOpacity={0.4}
            backgroundColor="rgba(253, 248, 240, 0.75)"
            className="w-full"
          >
            <div className="p-8 sm:p-14 text-center space-y-4">
              <span className="text-xs uppercase tracking-widest text-gold font-bold">
                The Artisan Philosophy
              </span>
              <div className="flex justify-center">
                <BlurText
                  text="Freehand Brushwork & Botanical Indigo Vats"
                  direction="top"
                  className="font-serif text-3xl sm:text-4xl text-terracotta-dark max-w-2xl mx-auto font-medium justify-center text-center"
                />
              </div>
              <p className="text-sm sm:text-base text-terracotta-dark/80 max-w-xl mx-auto leading-relaxed">
                Every garment begins with unbleached organic fibers laid over low drafting frames, brought to life through intuitive freehand brush strokes and living fermented plant dyes.
              </p>
              <div className="pt-4">
                <Link href="/craft">
                  <GlassButton variant="solid" size="md">
                    Discover Our Craft Process
                  </GlassButton>
                </Link>
              </div>
            </div>
          </BorderGlow>
        </section>

        {/* ================================================================ */}
        {/* SECTION D: LOOKBOOK PREVIEW STRIP IN GLASS PANEL */}
        {/* ================================================================ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <GlassPanel
            className="p-8 sm:p-12 shadow-2xl border-white/40"
            style={{
              background: 'rgba(253,248,240,0.7)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-terracotta/10">
              <div>
                <span className="text-xs uppercase tracking-widest text-terracotta font-semibold">
                  Visual Editorial
                </span>
                <BlurText
                  text="Autumn Lookbook Stories"
                  direction="top"
                  className="font-serif text-3xl sm:text-4xl text-terracotta-dark font-medium mt-1"
                />
              </div>
              <Link href="/lookbook" className="mt-4 md:mt-0 flex items-center text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors">
                View Full Lookbook <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <BorderGlow
                borderRadius={16}
                fillOpacity={0.4}
                backgroundColor="rgba(255, 255, 255, 0.45)"
                className="w-full"
              >
                <div className="p-5 space-y-3">
                  <div className="aspect-[4/5] rounded-xl bg-terracotta-100/60 flex items-center justify-center font-serif text-terracotta-dark/60 text-sm">
                    The Indigo Flow Edit
                  </div>
                  <h4 className="font-serif text-lg font-medium text-terracotta-dark">Fluid Silhouettes</h4>
                  <p className="text-xs text-terracotta-600">Pure organic cotton layered with indigo jackets.</p>
                </div>
              </BorderGlow>

              <BorderGlow
                borderRadius={16}
                fillOpacity={0.4}
                backgroundColor="rgba(255, 255, 255, 0.45)"
                className="w-full"
              >
                <div className="p-5 space-y-3">
                  <div className="aspect-[4/5] rounded-xl bg-gold-light/40 flex items-center justify-center font-serif text-terracotta-dark/60 text-sm">
                    The Mustard Two-Piece
                  </div>
                  <h4 className="font-serif text-lg font-medium text-terracotta-dark">Mineral Warmth</h4>
                  <p className="text-xs text-terracotta-600">Turmeric and madder root hand-painted brush textures.</p>
                </div>
              </BorderGlow>

              <BorderGlow
                borderRadius={16}
                fillOpacity={0.4}
                backgroundColor="rgba(255, 255, 255, 0.45)"
                className="w-full"
              >
                <div className="p-5 space-y-3">
                  <div className="aspect-[4/5] rounded-xl bg-blush-light/50 flex items-center justify-center font-serif text-terracotta-dark/60 text-sm">
                    Botanical Silk Stoles
                  </div>
                  <h4 className="font-serif text-lg font-medium text-terracotta-dark">River Washed Silk</h4>
                  <p className="text-xs text-terracotta-600">Soft drape painted freehand with pure plant extracts.</p>
                </div>
              </BorderGlow>
            </div>
          </GlassPanel>
        </section>

        {/* ================================================================ */}
        {/* SECTION E: FOOTER IN GLASS PANEL */}
        {/* ================================================================ */}
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <GlassPanel
            className="p-8 sm:p-12 shadow-2xl border-white/40"
            style={{
              background: 'rgba(253,248,240,0.8)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-terracotta/10">
              <div className="space-y-3 md:col-span-2">
                <Link href="/" className="inline-flex items-center space-x-3 group" aria-label="chhapa - Return to Home">
                  <img
                    src="/logo.png"
                    alt="chhapa"
                    className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="font-serif text-2xl tracking-wider text-terracotta-dark font-bold">
                    chhapa
                  </span>
                </Link>
                <p className="text-xs text-terracotta-dark/80 max-w-sm leading-relaxed">
                  Honoring the age-old heritage of Indian freehand hand-painting with natural dyes and slow ethical craftsmanship.
                </p>
              </div>

              <div>
                <h5 className="text-xs font-semibold uppercase tracking-wider text-terracotta-dark mb-3">
                  Explore
                </h5>
                <ul className="space-y-2 text-xs text-terracotta-dark/80">
                  <li><Link href="/shop" className="hover:text-terracotta">Shop Catalog</Link></li>
                  <li><Link href="/craft" className="hover:text-terracotta">Our Craft Story</Link></li>
                  <li><Link href="/lookbook" className="hover:text-terracotta">Lookbook</Link></li>
                  <li><Link href="/account" className="hover:text-terracotta">My Account</Link></li>
                </ul>
              </div>

              <div>
                <h5 className="text-xs font-semibold uppercase tracking-wider text-terracotta-dark mb-3">
                  Customer Care
                </h5>
                <ul className="space-y-2 text-xs text-terracotta-dark/80">
                  <li><Link href="/checkout" className="hover:text-terracotta">Guest Checkout</Link></li>
                  <li><Link href="/shop" className="hover:text-terracotta">Size & Fit Guide</Link></li>
                  <li><Link href="/craft" className="hover:text-terracotta">Sustainability</Link></li>
                </ul>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-terracotta-600">
              <p>© {new Date().getFullYear()} Chhapa Handcrafts. All rights reserved.</p>
              <p className="mt-2 sm:mt-0 flex items-center">
                Made with <Heart className="w-3.5 h-3.5 mx-1 text-terracotta fill-terracotta" /> for slow living
              </p>
            </div>
          </GlassPanel>
        </footer>
      </div>
    </div>
  );
}
