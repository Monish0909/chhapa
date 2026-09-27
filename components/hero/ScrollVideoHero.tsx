'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useCartStore } from '@/lib/store';

// Register GSAP ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollVideoHeroProps {
  framePath?: string;
  frameCount?: number;
  title?: string;
  subtitle?: string;
  overlayStyle?: 'dark' | 'light' | 'gradient';
  ctaText?: string;
  ctaHref?: string;
}

export function ScrollVideoHero({
  framePath = '/frames/home',
  frameCount = 96,
  title = 'Painted by hand, worn with story.',
}: ScrollVideoHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollWrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const toggleCart = useCartStore((state) => state.toggleCart);

  useEffect(() => {
    setIsMounted(true);
    const canvas = canvasRef.current;
    const scrollWrap = scrollWrapRef.current;
    const heroText = textRef.current;
    const glassNav = navRef.current;

    if (!canvas || !scrollWrap || !heroText) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ----------------------------------------------------
    // 1. LENIS SMOOTH SCROLL SETUP
    // ----------------------------------------------------
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Synchronize Lenis scroll position with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis RAF loop through GSAP ticker for synchronous scroll scrub precision
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // ----------------------------------------------------
    // 2. CANVAS SIZING & COVER-FIT LOGIC
    // ----------------------------------------------------
    const setCanvasDimensions = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform before scaling
      ctx.scale(dpr, dpr);
    };

    setCanvasDimensions();

    // Plain object containing frame index for GSAP to animate
    const playhead = { frame: 0 };
    const images: HTMLImageElement[] = [];

    // Helper to render frame on canvas with object-fit: cover
    const renderFrame = (index: number) => {
      const img = images[index];
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
          // Canvas is wider than image aspect ratio
          drawWidth = width;
          drawHeight = width / imgRatio;
          offsetY = (height - drawHeight) / 2;
        } else {
          // Canvas is taller than image aspect ratio
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

        // Subtle hand-painted botanical textile radial motif that pulses subtly with scroll playhead
        const progress = index / Math.max(frameCount - 1, 1);
        ctx.save();
        ctx.strokeStyle = 'rgba(244, 194, 194, 0.09)';
        ctx.lineWidth = 1.5;
        const baseRadius = 80 + progress * 120;
        for (let r = 0; r < 5; r++) {
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, baseRadius + r * 50, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    };

    // ----------------------------------------------------
    // 3. PRELOAD IMAGE SEQUENCE
    // ----------------------------------------------------
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

    // ----------------------------------------------------
    // 4. GSAP SCROLLTRIGGER ANIMATIONS
    // ----------------------------------------------------
    const ctxCleanup = gsap.context(() => {
      // Scrub through the video frames
      gsap.to(playhead, {
        frame: frameCount - 1,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
          trigger: scrollWrap,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2,
          onUpdate: () => {
            const currentFrame = Math.round(playhead.frame);
            renderFrame(currentFrame);
          },
        },
      });

      // Text fade on initial scroll
      gsap.to(heroText, {
        opacity: 0,
        y: -40,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: scrollWrap,
          start: 'top top',
          end: '30% top',
          scrub: true,
        },
      });

      // Glass navigation background & blur transition past the hero section
      if (glassNav) {
        ScrollTrigger.create({
          trigger: scrollWrap,
          start: 'bottom top',
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

    // ----------------------------------------------------
    // 5. WINDOW RESIZE HANDLING
    // ----------------------------------------------------
    const handleResize = () => {
      setCanvasDimensions();
      renderFrame(Math.round(playhead.frame));
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    // ----------------------------------------------------
    // 6. CLEANUP
    // ----------------------------------------------------
    return () => {
      window.removeEventListener('resize', handleResize);
      ctxCleanup.revert();
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [frameCount, framePath]);

  return (
    <div id="hero-scroll-wrap" ref={scrollWrapRef} className="relative w-full h-[400vh]">
      {/* Sticky Fullscreen Container */}
      <div className="sticky top-0 left-0 w-screen h-screen overflow-hidden">
        {/* Fullscreen Canvas for Scroll-Scrubbed Video Frame Sequence */}
        <canvas id="hero-canvas" ref={canvasRef} className="w-full h-full block" />

        {/* Soft dark gradient overlay for text legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(20,10,5,0.15), rgba(20,10,5,0.05) 40%, rgba(20,10,5,0.3))',
          }}
        />

        {/* Floating Glass Navigation Bar */}
        <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[min(90vw,1100px)] pointer-events-none">
          <nav
            ref={navRef}
            id="hero-nav"
            className="pointer-events-auto w-full px-8 py-4 rounded-full flex items-center justify-between transition-all duration-300"
            style={{
              background: 'rgba(253,248,240,0.65)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            }}
          >
            {/* Logo Left */}
            <Link
              href="/"
              className="font-serif text-2xl sm:text-3xl tracking-wider text-terracotta-dark font-semibold hover:opacity-90 transition-opacity"
            >
              chhapa
            </Link>

            {/* Nav Links (Shop, Craft, Lookbook, Login) + Cart Icon Right */}
            <div className="flex items-center space-x-6 sm:space-x-8">
              <div className="hidden md:flex items-center space-x-7 text-sm font-medium text-terracotta-dark">
                <Link href="/shop" className="hover:text-terracotta transition-colors">
                  Shop
                </Link>
                <Link href="/craft" className="hover:text-terracotta transition-colors">
                  Craft
                </Link>
                <Link href="/lookbook" className="hover:text-terracotta transition-colors">
                  Lookbook
                </Link>
                <Link href="/login" className="hover:text-terracotta transition-colors">
                  Login
                </Link>
              </div>

              {/* Cart Trigger */}
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-full hover:bg-white/40 text-terracotta-dark transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {isMounted && totalItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-terracotta text-cream text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </nav>
        </header>

        {/* Centered Hero Text */}
        <div
          id="hero-text"
          ref={textRef}
          className="absolute inset-0 flex items-center justify-center px-6 text-center pointer-events-none z-20"
        >
          <h1
            className="font-serif font-normal max-w-5xl leading-tight"
            style={{
              color: '#FDF8F0',
              fontSize: 'clamp(2rem, 5vw, 4.5rem)',
              letterSpacing: '0.02em',
              textShadow: '0 2px 24px rgba(0,0,0,0.25)',
            }}
          >
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
}
