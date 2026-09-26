/**
 * chhapa — Full-Screen Scroll-Scrubbed Video Hero Section
 * Using Vanilla JavaScript with GSAP, ScrollTrigger, and Lenis.
 */

// =========================================================================
// 1. REGISTER GSAP PLUGINS
// =========================================================================
gsap.registerPlugin(ScrollTrigger);

// Configuration
const CONFIG = {
  frameCount: 192,
  framePath: '/frames/home/frame_',
  scrubSpeed: 2,
};

// DOM References
const heroScrollWrap = document.getElementById('hero-scroll-wrap');
const heroCanvas = document.getElementById('hero-canvas');
const heroText = document.getElementById('hero-text');
const glassNav = document.getElementById('glass-nav');
const ctx = heroCanvas.getContext('2d');

// State
const playhead = { frame: 0 };
const frames = [];
let firstFrameRendered = false;

// =========================================================================
// 2. LENIS SMOOTH SCROLL SETUP
// =========================================================================
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 1.5,
});

// Synchronize Lenis scroll position with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

// Drive Lenis RequestAnimationFrame through GSAP Ticker for lock-step precision
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Disable GSAP lag smoothing to ensure smooth scrubbing without jerks
gsap.ticker.lagSmoothing(0);

// =========================================================================
// 3. CANVAS SIZING & COVER-FIT LOGIC (WITH DEVICE PIXEL RATIO)
// =========================================================================
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  heroCanvas.width = width * dpr;
  heroCanvas.height = height * dpr;
  heroCanvas.style.width = `${width}px`;
  heroCanvas.style.height = `${height}px`;

  // Scale drawing context to match device pixel ratio
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  // Redraw current frame with new dimensions
  renderCurrentFrame();
}

/**
 * Draw frame to canvas using "cover" fit (scale to fill, crop overflow, centered).
 */
function drawCoverFit(img) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  ctx.clearRect(0, 0, width, height);

  if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = width / height;

    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      // Screen is wider than image aspect ratio
      drawWidth = width;
      drawHeight = width / imgRatio;
      offsetY = (height - drawHeight) / 2;
    } else {
      // Screen is taller than image aspect ratio
      drawHeight = height;
      drawWidth = height * imgRatio;
      offsetX = (width - drawWidth) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }
}

function renderCurrentFrame() {
  const frameIndex = Math.min(Math.max(Math.round(playhead.frame), 0), CONFIG.frameCount - 1);
  const currentImg = frames[frameIndex];

  if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
    drawCoverFit(currentImg);
  }
}

// Initial canvas sizing
resizeCanvas();

// Handle window resize
window.addEventListener('resize', () => {
  resizeCanvas();
  ScrollTrigger.refresh();
});

// =========================================================================
// 4. FRAME SEQUENCE PRELOADING
// =========================================================================
for (let i = 1; i <= CONFIG.frameCount; i++) {
  const img = new Image();
  const paddedIndex = String(i).padStart(4, '0');
  img.src = `${CONFIG.framePath}${paddedIndex}.jpg`;

  img.onload = () => {
    // Render first frame immediately once loaded
    if (i === 1 && !firstFrameRendered) {
      firstFrameRendered = true;
      drawCoverFit(img);
    }
  };

  frames.push(img);
}

// =========================================================================
// 5. GSAP SCROLLTRIGGER ANIMATIONS
// =========================================================================

// A. Video Frame Scrubbing across the 400vh wrapper
gsap.to(playhead, {
  frame: CONFIG.frameCount - 1,
  snap: 'frame',
  ease: 'none',
  scrollTrigger: {
    trigger: heroScrollWrap,
    start: 'top top',
    end: 'bottom bottom',
    scrub: CONFIG.scrubSpeed,
    onUpdate: () => {
      renderCurrentFrame();
    },
  },
});

// B. Text Fade & Upward Motion
// Fade out over the first 30% of scroll
gsap.to(heroText, {
  opacity: 0,
  y: -40,
  ease: 'power1.out',
  scrollTrigger: {
    trigger: heroScrollWrap,
    start: 'top top',
    end: '30% top',
    scrub: true,
  },
});

// C. Nav Bar Transition past the Hero Section
// Once scrolled past hero-scroll-wrap, transition background & blur for legibility
ScrollTrigger.create({
  trigger: heroScrollWrap,
  start: 'bottom top',
  onEnter: () => {
    gsap.to(glassNav, {
      backgroundColor: 'rgba(253, 248, 240, 0.9)',
      backdropFilter: 'blur(10px)',
      webkitBackdropFilter: 'blur(10px)',
      duration: 0.35,
      ease: 'power2.out',
    });
  },
  onLeaveBack: () => {
    gsap.to(glassNav, {
      backgroundColor: 'rgba(253, 248, 240, 0.65)',
      backdropFilter: 'blur(16px)',
      webkitBackdropFilter: 'blur(16px)',
      duration: 0.35,
      ease: 'power2.out',
    });
  },
});
