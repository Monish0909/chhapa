'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, Sparkles, Feather, Sun, Droplets, ArrowRight } from 'lucide-react';
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

// Craft process stages for the alternating content rows
const craftStages = [
  {
    step: 'Stage 01',
    title: 'Freehand Brushcraft & Motif Conception',
    subtitle: 'The Intuition of Master Brushwork',
    icon: Feather,
    description:
      'Every collection begins directly on unbleached organic textile in the artisan studios of Jaipur and Kutch. Master artists sketch and paint freehand using fine squirrel-hair and slender bamboo brushes, holding the fabric taut over low wooden drafting frames. Without stencils or mechanical repeats, every leaf, petal, and border motif emerges organically with fluid painterly freedom.',
    details: [
      'Pure freehand brushwork with no mechanical guides',
      'Artisanal line variation giving each piece its own heartbeat',
      'Intricate botanical detailing painted directly onto the weave',
    ],
    imageLabel: 'Freehand brush painting on organic cotton',
  },
  {
    step: 'Stage 02',
    title: 'Botanical Fermentation & Living Indigo Vats',
    subtitle: 'Extracting Color from Earth and Flora',
    icon: Droplets,
    description:
      'We reject petrochemical dyes in favor of living, organic fermentation. Indigo leaves ferment for weeks in earthen subterranean vats with jaggery, lime, and natural enzymes. Harda (myrobalan seed powder) prepares raw cotton fibers, while pomegranate rinds, madder roots, and crushed turmeric yield rich terracotta, golden mustard, and blush tones.',
    details: [
      'Zero synthetic fixatives or caustic soda',
      'Living bio-fermented natural indigo vats',
      'Pomegranate rind, madder root & mineral rust dyes',
    ],
    imageLabel: 'Subterranean botanical indigo vat',
  },
  {
    step: 'Stage 03',
    title: 'Layered Pigment Glazing & Brush Wash Application',
    subtitle: 'Patience, Gradation, and Natural Saturation',
    icon: Droplets,
    description:
      'Colors are built up in gentle, translucent glazes directly onto the cloth. The artisan blends plant-based pigments with tree gums to control viscosity, dipping soft round brushes to achieve delicate tonal fades and deep saturated accents. Each color layer requires deliberate sun-drying intervals to let natural binders bond deeply with the fiber.',
    details: [
      'Multi-pass translucent color layering with natural binders',
      'Organic mineral gradations and painterly shading',
      'Subtle variations in pigment depth proving authentic handcraft',
    ],
    imageLabel: 'Applying botanical brush glazes on fabric',
  },
  {
    step: 'Stage 04',
    title: 'River Washing & Open-Sky Sunlight Curing',
    subtitle: 'Set by the Sun, Cleansed by Flowing Waters',
    icon: Sun,
    description:
      'Once painting and curing are complete, fabrics are gently rinsed in running natural streams to cleanse loose surface minerals while preserving fiber integrity. They are then spread across vast open-air grounds under direct sunlight, where atmospheric heat and UV rays react with botanical mordants to permanently fix the colors.',
    details: [
      'Natural sun oxidation developing rich indigo depth',
      'Gentle river current washing preserving textile hand-feel',
      'Recycled water irrigation nourishing nearby vegetation',
    ],
    imageLabel: 'Riverbank sun curing in Rajasthan',
  },
];

export default function CraftPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const firstViewportPanelRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const toggleCart = useCartStore((state) => state.toggleCart);

  const { isAuthenticated } = useAuth();

  const craftNavLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'Craft', href: '/craft' },
    { name: 'Lookbook', href: '/lookbook' },
    isAuthenticated
      ? { name: 'Account', href: '/account' }
      : { name: 'Login', href: '/login' },
  ];

  const framePath = '/frames/craft';
  const frameCount = 192;

  useEffect(() => {
    const canvas = canvasRef.current;
    const contentWrapper = contentWrapperRef.current;
    const firstPanel = firstViewportPanelRef.current;
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
        // Aesthetic craft workshop background while sequence frames load
        const gradient = ctx.createRadialGradient(
          width / 2,
          height / 2,
          40,
          width / 2,
          height / 2,
          Math.max(width, height) / 1.1
        );
        gradient.addColorStop(0, '#6E3719');
        gradient.addColorStop(0.35, '#4A2715');
        gradient.addColorStop(0.75, '#2B150C');
        gradient.addColorStop(1, '#140A05');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Meditative freehand brushwork radial motifs pulsing with scrub playhead
        const progress = safeIndex / Math.max(frameCount - 1, 1);
        ctx.save();
        ctx.strokeStyle = 'rgba(244, 194, 194, 0.08)';
        ctx.lineWidth = 1.2;
        const baseRadius = 70 + progress * 130;
        for (let r = 0; r < 6; r++) {
          ctx.beginPath();
          ctx.arc(width * 0.45, height * 0.5, baseRadius + r * 45, 0, Math.PI * 2);
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
            const currentFrame = isMobile ? Math.floor(rawFrame / 2) * 2 : rawFrame;
            renderFrame(currentFrame);
          },
        },
      });

      // First viewport text panel slide-in and settle early (stays visible, no fade-out)
      if (firstPanel) {
        gsap.fromTo(
          firstPanel,
          {
            opacity: 0,
            x: -20,
          },
          {
            opacity: 1,
            x: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: contentWrapper,
              start: 'top 80%',
              end: 'top 40%',
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
      {/* 1. FIXED PERSISTENT CANVAS BACKGROUND (z-0, stays pinned, never scrolls) */}
      {/* ------------------------------------------------------------------ */}
      <canvas
        id="craft-bg-canvas"
        ref={canvasRef}
        className="fixed top-0 left-0 w-screen h-screen z-0 pointer-events-none block"
      />

      {/* ------------------------------------------------------------------ */}
      {/* 2. FIXED NEUTRAL VIGNETTE OVERLAY (z-1, darkens edges only, no color tint) */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(20,10,5,0.35) 100%)',
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* 3. FLOATING GLASS NAVIGATION (z-20, fixed top, desktop only) */}
      {/* ------------------------------------------------------------------ */}
      <header className="hidden md:block fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-20 w-[min(94vw,1100px)] pointer-events-none">
        <nav
          ref={navRef}
          id="craft-glass-nav"
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
              {craftNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors py-2 ${
                    link.href === '/craft'
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
      {/* 4. NORMAL-FLOW SCROLLING CONTENT CONTAINER (z-10, transparent) */}
      {/* ------------------------------------------------------------------ */}
      <div
        id="craft-page-content"
        ref={contentWrapperRef}
        className="relative z-10 bg-transparent flex flex-col space-y-32 pb-24"
      >
        {/* ================================================================ */}
        {/* SECTION A: FIRST VIEWPORT HERO PANEL (Bottom-Left Glass Card) */}
        {/* ================================================================ */}
        <section className="min-h-screen relative pointer-events-none">
          <div
            ref={firstViewportPanelRef}
            className="pointer-events-auto absolute max-w-[480px] w-[calc(100%-12vw)] sm:w-full"
            style={{
              bottom: '8vh',
              left: '6vw',
              padding: '28px 36px',
              borderRadius: '20px',
              background: 'rgba(253,248,240,0.6)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.25)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <span
              className="block uppercase font-sans font-medium"
              style={{
                letterSpacing: '0.15em',
                fontSize: '0.85rem',
                color: '#8B4520',
                opacity: 0.9,
                marginBottom: '8px',
              }}
            >
              OUR CRAFT
            </span>
            <BlurText
              text="Every stroke, done by hand."
              direction="top"
              className="font-serif font-medium leading-tight text-[#3d2418] text-[clamp(1.75rem,4vw,3rem)]"
            />
            <p className="mt-3 text-xs sm:text-sm text-terracotta-dark/80 font-light leading-relaxed">
              Centuries-old botanical vat fermentation and freehand brush painting passed down through generational artisan guilds.
            </p>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION B: ALTERNATING IMAGE & TEXT GLASS-PANEL ROWS */}
        {/* ================================================================ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-24">
          {craftStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isEven = idx % 2 === 1;

            return (
              <div
                key={stage.step}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                  isEven ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Text Content in Glass Card */}
                <div className={`lg:col-span-7 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <GlassPanel
                    className="p-8 sm:p-12 shadow-2xl border-white/50 space-y-5"
                    style={{
                      background: 'rgba(253,248,240,0.72)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-terracotta/10 text-terracotta">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-widest text-terracotta font-semibold block">
                          {stage.step}
                        </span>
                        <span className="text-xs text-terracotta-600 font-medium">
                          {stage.subtitle}
                        </span>
                      </div>
                    </div>

                    <BlurText
                      text={stage.title}
                      className="font-serif text-2xl sm:text-3xl text-terracotta-dark font-medium leading-snug"
                    />

                    <p className="text-sm sm:text-base text-terracotta-dark/80 leading-relaxed font-light">
                      {stage.description}
                    </p>

                    <div className="pt-2 border-t border-terracotta/10 space-y-2">
                      {stage.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex items-start space-x-2 text-xs sm:text-sm text-terracotta-dark/90">
                          <Sparkles className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </GlassPanel>
                </div>

                {/* Normal Photography Alongside Glass Card (Not Glass) */}
                <div className={`lg:col-span-5 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] bg-gradient-to-br from-terracotta-800 to-terracotta-900 border border-white/40 relative flex flex-col justify-end p-6 group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
                    
                    {/* Placeholder Artistic Graphic representation */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:scale-105 transition-transform duration-700">
                      <div className="w-32 h-32 rounded-full border-2 border-dashed border-cream/40 flex items-center justify-center font-serif text-cream text-lg">
                        chhapa
                      </div>
                    </div>

                    <div className="relative z-20">
                      <span className="text-[11px] uppercase tracking-widest text-gold-light font-semibold block">
                        Master Artisan Workshop
                      </span>
                      <p className="font-serif text-lg text-cream font-medium mt-1">
                        {stage.imageLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* ================================================================ */}
        {/* SECTION C: CLOSING PHILOSOPHY & COLLECTION CTA */}
        {/* ================================================================ */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 w-full">
          <GlassPanel
            className="p-8 sm:p-14 text-center shadow-2xl border-white/50 space-y-5"
            style={{
              background: 'rgba(253,248,240,0.78)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <span className="text-xs uppercase tracking-widest text-gold font-bold">
              Ethical Heritage
            </span>
            <div className="flex justify-center">
              <BlurText
                text="Preserving Living Indian Artistry for Future Generations"
                direction="top"
                className="font-serif text-3xl sm:text-4xl text-terracotta-dark font-medium max-w-xl mx-auto justify-center text-center"
              />
            </div>
            <p className="text-sm sm:text-base text-terracotta-dark/80 max-w-lg mx-auto leading-relaxed font-light">
              By choosing slow freehand hand-painted textiles, you directly support multi-generational artisan families and keep ancient sustainable dyeing traditions thriving.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/shop">
                <GlassButton variant="solid" size="lg">
                  Shop Handcrafted Pieces <ArrowRight className="w-4 h-4 ml-2 inline" />
                </GlassButton>
              </Link>
              <Link href="/lookbook">
                <GlassButton variant="glass" size="lg">
                  View Lookbook
                </GlassButton>
              </Link>
            </div>
          </GlassPanel>
        </section>
      </div>
    </div>
  );
}
