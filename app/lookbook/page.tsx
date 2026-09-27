'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useCartStore } from '@/lib/store';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import BlurText from '@/components/ui/BlurText';
import { useAuth } from '@/lib/useAuth';

// Register GSAP ScrollTrigger plugin on client
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Masonry gallery items showing women and children wearing the handcrafted pieces
const galleryItems = [
  {
    id: 1,
    title: 'The Mustard Co-ord Set',
    category: "Women's Edit",
    aspect: 'aspect-[3/4]',
    tag: 'Handspun Cotton',
    caption: 'Sun-drenched mustard crop and relaxed trousers with freehand-painted flora.',
    accentBg: 'from-[#E5B25D]/40 to-[#DEA68D]/40',
  },
  {
    id: 2,
    title: 'Little Chhapa Flora Frock',
    category: "Kids' Craft",
    aspect: 'aspect-[4/5]',
    tag: 'Mineral Terracotta',
    caption: 'Soft river-washed hand-painted frock tailored for gentle toddler skin.',
    accentBg: 'from-[#F4C2C2]/40 to-[#FDF8F0]/40',
  },
  {
    id: 3,
    title: 'Indigo Overlay Jacket & Tunic',
    category: "Women's Edit",
    aspect: 'aspect-[2/3]',
    tag: 'Living Indigo',
    caption: 'Deep botanical indigo overlay jacket paired with ivory organic linen.',
    accentBg: 'from-[#8B4520]/30 to-[#3d2418]/30',
  },
  {
    id: 4,
    title: 'Junior Quilted Nehru Vest',
    category: "Kids' Craft",
    aspect: 'aspect-[3/4]',
    tag: '100% Natural Dye',
    caption: 'Quilted hand-painted vest with wooden coconut shell buttons.',
    accentBg: 'from-[#E5B25D]/30 to-[#8B4520]/30',
  },
  {
    id: 5,
    title: 'Botanical Floral Tiered Maxi',
    category: "Women's Edit",
    aspect: 'aspect-[4/5]',
    tag: 'Artisan Brushwork',
    caption: 'Flowing multi-tiered silhouette hand-painted with red alum and harda.',
    accentBg: 'from-[#DEA68D]/40 to-[#FDF8F0]/40',
  },
  {
    id: 6,
    title: 'Sibling Harmony Sets',
    category: 'Family Edit',
    aspect: 'aspect-[1/1]',
    tag: 'Handcrafted Together',
    caption: 'Matching slow-fashion silhouettes crafted for warm festive afternoons.',
    accentBg: 'from-[#F4C2C2]/30 to-[#E5B25D]/30',
  },
];

// Additional editorial garment spotlight sections (all referencing the single fixed video canvas)
const garmentSections = [
  {
    id: 'section-mustard',
    chipText: 'The Mustard Two-Piece — Look 01',
    subtitle: 'Organic Handspun Linen',
  },
  {
    id: 'section-indigo',
    chipText: 'Botanical Indigo Flow Dress — Look 02',
    subtitle: 'Subterranean Vat Fermentation',
  },
  {
    id: 'section-terracotta',
    chipText: 'Mineral Terracotta Kurta & Stole — Look 03',
    subtitle: 'River-Washed Mineral Craft',
  },
];

export default function LookbookPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const captionChipRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const toggleCart = useCartStore((state) => state.toggleCart);

  const { isAuthenticated } = useAuth();

  const lookbookNavLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'Craft', href: '/craft' },
    { name: 'Lookbook', href: '/lookbook' },
    isAuthenticated
      ? { name: 'Account', href: '/account' }
      : { name: 'Login', href: '/login' },
  ];

  const framePath = '/frames/lookbook';
  const frameCount = 192;

  useEffect(() => {
    const canvas = canvasRef.current;
    const contentWrapper = contentWrapperRef.current;
    const captionChip = captionChipRef.current;
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

    // Helper: Draw current frame on canvas with object-fit: cover (True-color clean)
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

        // True-color clean rendering (no tinting or filter applied)
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      } else {
        // True-color warm daylight studio backdrop while sequence frames load
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#E5B25D'); // Warm mustard gold
        gradient.addColorStop(0.5, '#F5D491'); // Soft sand gold
        gradient.addColorStop(1, '#DEA68D'); // Terracotta blush

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Subtle geometric editorial layout borders
        const progress = safeIndex / Math.max(frameCount - 1, 1);
        ctx.save();
        ctx.strokeStyle = 'rgba(61, 36, 24, 0.12)';
        ctx.lineWidth = 1.5;
        const margin = 40 + progress * 20;
        ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
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
            const currentFrame = isMobile ? Math.floor(rawFrame / 2) * 2 : rawFrame;
            renderFrame(currentFrame);
          },
        },
      });

      // First viewport caption chip pops in with slight bounce and stays visible
      if (captionChip) {
        gsap.fromTo(
          captionChip,
          {
            opacity: 0,
            scale: 0.9,
          },
          {
            opacity: 1,
            scale: 1,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: contentWrapper,
              start: 'top 60%',
              end: 'top 20%',
              scrub: true,
            },
          }
        );
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
      {/* 1. FIXED PERSISTENT CANVAS BACKGROUND (z-0, true-color, no overlay) */}
      {/* ------------------------------------------------------------------ */}
      <canvas
        id="lookbook-bg-canvas"
        ref={canvasRef}
        className="fixed top-0 left-0 w-screen h-screen z-0 pointer-events-none block"
      />

      {/* ------------------------------------------------------------------ */}
      {/* 2. FLOATING GLASS NAVIGATION (z-20, fixed top, desktop only) */}
      {/* ------------------------------------------------------------------ */}
      <header className="hidden md:block fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-20 w-[min(94vw,1100px)] pointer-events-none">
        <nav
          ref={navRef}
          id="lookbook-glass-nav"
          className="pointer-events-auto w-full px-5 sm:px-8 py-3 sm:py-4 rounded-full flex items-center justify-between transition-all duration-300"
          style={{
            background: 'rgba(253,248,240,0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <Link
            href="/"
            className="font-serif text-2xl sm:text-3xl tracking-wider text-terracotta-dark font-semibold hover:opacity-90 transition-opacity min-h-[44px] flex items-center"
          >
            chhapa
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-8">
            <div className="hidden md:flex items-center space-x-7 text-sm font-medium text-terracotta-dark">
              {lookbookNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors py-2 ${
                    link.href === '/lookbook'
                      ? 'text-terracotta font-semibold'
                      : 'hover:text-terracotta'
                  }`}
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
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-terracotta text-cream text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* 3. NORMAL-FLOW SCROLLING CONTENT CONTAINER (z-10, transparent) */}
      {/* ------------------------------------------------------------------ */}
      <div
        id="lookbook-page-content"
        ref={contentWrapperRef}
        className="relative z-10 bg-transparent flex flex-col space-y-28 pb-28"
      >
        {/* ================================================================ */}
        {/* SECTION A: FIRST VIEWPORT CAPTION CHIP (Bottom-Right Floating Chip) */}
        {/* ================================================================ */}
        <section className="min-h-screen relative pointer-events-none">
          <div
            ref={captionChipRef}
            className="pointer-events-auto absolute"
            style={{
              bottom: '6vh',
              right: '6vw',
              padding: '10px 20px',
              borderRadius: '999px',
              background: 'rgba(253,248,240,0.7)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          >
            <span
              className="font-medium tracking-wide"
              style={{
                fontSize: '0.85rem',
                color: '#3d2418',
                letterSpacing: '0.03em',
              }}
            >
              The Mustard Two-Piece
            </span>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION B: EDITORIAL GARMENT SPOTLIGHT CHIPS (Single Canvas Sync) */}
        {/* ================================================================ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {garmentSections.map((sec) => (
              <div
                key={sec.id}
                className="px-5 py-2.5 rounded-full border border-white/50 bg-cream/60 backdrop-blur-md shadow-glass text-xs font-medium text-terracotta-dark hover:bg-cream/80 transition-colors cursor-pointer flex items-center space-x-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                <span>{sec.chipText}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION C: MASONRY-STYLE GALLERY GRID (Offset Glass-Bordered Frames) */}
        {/* ================================================================ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-terracotta font-semibold block">
              Editorial Gallery
            </span>
            <div className="flex justify-center mt-1">
              <BlurText
                text="Worn by Women, Cherished by Children"
                direction="top"
                className="font-serif text-3xl sm:text-4xl text-terracotta-dark font-medium justify-center text-center"
              />
            </div>
            <p className="text-xs sm:text-sm text-terracotta-dark/80 max-w-md mx-auto mt-2 font-light">
              Slow living captured in sunlight, showcasing breathable botanical textiles in everyday movement.
            </p>
          </div>

          {/* Staggered Offset Masonry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            {galleryItems.map((item, idx) => (
              <div
                key={item.id}
                className={`flex flex-col group ${
                  idx % 2 === 1 ? 'md:translate-y-8 lg:translate-y-12' : ''
                }`}
              >
                {/* Image Card Frame with Thin 1px Whisper Border & Hover Blur */}
                <div
                  className={`w-full ${item.aspect} rounded-3xl overflow-hidden relative border border-white/40 shadow-2xl transition-all duration-500 group-hover:shadow-glass-hover group-hover:backdrop-blur-sm bg-gradient-to-br ${item.accentBg} p-6 flex flex-col justify-between`}
                >
                  <div className="flex justify-between items-start z-10">
                    <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-white/70 backdrop-blur-md text-terracotta-dark border border-white/60">
                      {item.tag}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-terracotta-dark/60">
                      {item.category}
                    </span>
                  </div>

                  {/* Artwork Placeholder Silhouette Illustration */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:scale-105 transition-transform duration-700 pointer-events-none">
                    <div className="w-28 h-28 rounded-full border-2 border-dashed border-terracotta/40 flex items-center justify-center font-serif text-terracotta-dark text-base">
                      chhapa edit
                    </div>
                  </div>

                  {/* Caption Details */}
                  <div className="z-10 bg-cream/80 backdrop-blur-md p-4 rounded-2xl border border-white/60 transition-all duration-300 group-hover:bg-cream/95">
                    <h3 className="font-serif text-base font-semibold text-terracotta-dark">
                      {item.title}
                    </h3>
                    <p className="text-xs text-terracotta-dark/80 mt-1 font-light leading-relaxed">
                      {item.caption}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION D: CLOSING CTA CARD */}
        {/* ================================================================ */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 w-full">
          <GlassPanel
            className="p-8 sm:p-14 text-center shadow-2xl border-white/50 space-y-4"
            style={{
              background: 'rgba(253,248,240,0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <span className="text-xs uppercase tracking-widest text-gold font-bold">
              Autumn / Winter 2026
            </span>
            <div className="flex justify-center">
              <BlurText
                text="Bring Botanical Heritage Into Your Wardrobe"
                direction="top"
                className="font-serif text-3xl sm:text-4xl text-terracotta-dark font-medium max-w-xl mx-auto justify-center text-center"
              />
            </div>
            <p className="text-sm sm:text-base text-terracotta-dark/80 max-w-md mx-auto leading-relaxed font-light">
              Explore the complete collection of freehand hand-painted garments created with botanical natural dyes.
            </p>
            <div className="pt-4 flex justify-center">
              <Link href="/shop">
                <GlassButton variant="solid" size="lg">
                  Shop Lookbook Outfits <ArrowRight className="w-4 h-4 ml-2 inline" />
                </GlassButton>
              </Link>
            </div>
          </GlassPanel>
        </section>
      </div>
    </div>
  );
}
