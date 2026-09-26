'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Register GSAP ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface CraftHeroProps {
  framePath?: string;
  frameCount?: number;
  eyebrow?: string;
  title?: string;
}

export function CraftHero({
  framePath = '/frames/craft',
  frameCount = 96,
  eyebrow = 'OUR CRAFT',
  title = 'Every stroke, done by hand.',
}: CraftHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollWrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scrollWrap = scrollWrapRef.current;
    const craftText = textRef.current;

    if (!canvas || !scrollWrap || !craftText) return;

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

    // Synchronize Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis RAF loop via GSAP ticker for synchronous scroll scrub precision
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
        // Aesthetic craft vat background while sequence frames load
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

        // Meditative woodblock carving radial motifs pulsing with scrub playhead
        const progress = index / Math.max(frameCount - 1, 1);
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
      // Frame sequence scrub animation
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

      // Text panel slide-in and settle early (stays visible, no fade out)
      gsap.fromTo(
        craftText,
        {
          opacity: 0,
          x: -20,
        },
        {
          opacity: 1,
          x: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: scrollWrap,
            start: 'top 80%',
            end: 'top 40%',
            scrub: true,
          },
        }
      );
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
    <div id="craft-scroll-wrap" ref={scrollWrapRef} className="relative w-full h-[400vh]">
      {/* Sticky Fullscreen Container */}
      <div className="sticky top-0 left-0 w-screen h-screen overflow-hidden">
        {/* Fullscreen Video Canvas */}
        <canvas id="craft-canvas" ref={canvasRef} className="w-full h-full block" />

        {/* Subtle neutral vignette overlay (darkens edges only, no color tint) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(20,10,5,0.35) 100%)',
          }}
        />

        {/* Glass Text Panel */}
        <div
          id="craft-text"
          ref={textRef}
          className="absolute z-20 pointer-events-none"
          style={{
            bottom: '8vh',
            left: '6vw',
            maxWidth: '480px',
            padding: '24px 32px',
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
              opacity: 0.85,
              marginBottom: '8px',
            }}
          >
            {eyebrow}
          </span>
          <h2
            className="font-serif font-medium leading-tight"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              color: '#3d2418',
            }}
          >
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
}
