'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Register GSAP ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface LookbookHeroProps {
  id?: string;
  framePath?: string;
  frameCount?: number;
  captionText?: string;
}

export function LookbookHero({
  id = 'lookbook-scroll-wrap',
  framePath = '/frames/lookbook',
  frameCount = 96,
  captionText = 'The Mustard Two-Piece',
}: LookbookHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollWrapRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scrollWrap = scrollWrapRef.current;
    const captionChip = chipRef.current;

    if (!canvas || !scrollWrap || !captionChip) return;

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

        // Render true-color, un-tinted clean footage
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      } else {
        // True-color clean artisanal studio backdrop while sequence frames load
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#E5B25D'); // Warm mustard gold
        gradient.addColorStop(0.5, '#F5D491'); // Soft sand gold
        gradient.addColorStop(1, '#DEA68D'); // Terracotta blush

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Elegant geometric framing accents reflecting lookbook editorial grid
        const progress = index / Math.max(frameCount - 1, 1);
        ctx.save();
        ctx.strokeStyle = 'rgba(61, 36, 24, 0.12)';
        ctx.lineWidth = 1.5;
        const margin = 40 + progress * 20;
        ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
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
      // Frame sequence scrub animation across full 400vh
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

      // Caption chip pops in with slight bounce & stays visible throughout
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
            trigger: scrollWrap,
            start: 'top 60%',
            end: 'top 20%',
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
    <div id={id} ref={scrollWrapRef} className="relative w-full h-[400vh]">
      {/* Sticky Fullscreen Container */}
      <div className="sticky top-0 left-0 w-screen h-screen overflow-hidden">
        {/* Fullscreen Video Canvas — No overlay, no vignette (true-color clean presentation) */}
        <canvas id={`${id}-canvas`} ref={canvasRef} className="w-full h-full block" />

        {/* Floating Glass Caption Chip */}
        <div
          ref={chipRef}
          className="absolute z-20 pointer-events-none"
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
            {captionText}
          </span>
        </div>
      </div>
    </div>
  );
}
