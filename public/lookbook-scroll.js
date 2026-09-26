/**
 * chhapa — Lookbook Page Scroll-Scrubbed Fixed Video Background
 * Implemented using Vanilla JavaScript with GSAP, ScrollTrigger, and Lenis.
 */

// =========================================================================
// 1. REGISTER GSAP PLUGINS
// =========================================================================
gsap.registerPlugin(ScrollTrigger);

// Configuration
const CONFIG = {
  frameCount: 192,
  framePath: '/frames/lookbook/frame_',
  scrubSpeed: 2,
};

// DOM References
const lookbookCanvas = document.getElementById('lookbook-bg-canvas');
const lookbookPageContent = document.getElementById('lookbook-page-content');
const captionChip = document.getElementById('caption-chip');
const glassNav = document.getElementById('glass-nav');
const ctx = lookbookCanvas.getContext('2d');

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

// Connect Lenis scroll event to ScrollTrigger.update
lenis.on('scroll', ScrollTrigger.update);

// Drive Lenis RequestAnimationFrame through GSAP Ticker for lock-step precision
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Disable GSAP lag smoothing to ensure responsive scrubbing without lag
gsap.ticker.lagSmoothing(0);

// =========================================================================
// 3. CANVAS SIZING & COVER-FIT LOGIC (DPR SUPPORT, TRUE-COLOR CLEAN)
// =========================================================================
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  lookbookCanvas.width = width * dpr;
  lookbookCanvas.height = height * dpr;
  lookbookCanvas.style.width = `${width}px`;
  lookbookCanvas.style.height = `${height}px`;

  // Scale drawing context to match DPR
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  // Redraw current frame
  renderCurrentFrame();
}

/**
 * Draw frame to canvas using cover-fit (scale to fill, crop overflow, centered).
 * NO overlay, NO vignette, true-color and clean.
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
  // Clamp frame value strictly between 0 and (frameCount - 1) so it holds on last frame
  const frameIndex = Math.min(Math.max(Math.round(playhead.frame), 0), CONFIG.frameCount - 1);
  const currentImg = frames[frameIndex];

  if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
    drawCoverFit(currentImg);
  }
}

// Initial canvas sizing
resizeCanvas();

// Handle window resize: recalculate canvas dimensions, redraw, and refresh ScrollTrigger
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

// A. Video Frame Scrubbing tied to the full page's scrollable content
// start: "top top", end: "bottom bottom", scrub: 2
// Animate plain object 'frame' property 0 to (frameCount - 1), snap: "frame", ease: "none"
gsap.to(playhead, {
  frame: CONFIG.frameCount - 1,
  snap: 'frame',
  ease: 'none',
  scrollTrigger: {
    trigger: lookbookPageContent,
    start: 'top top',
    end: 'bottom bottom',
    scrub: CONFIG.scrubSpeed,
    onUpdate: () => {
      renderCurrentFrame();
    },
  },
});

// B. First Viewport Caption Chip Animation
// Animate opacity 0 to 1, scale 0.9 to 1, ease "back.out(1.4)"
// ScrollTrigger: start "top 60%", end "top 20%", scrub: true — pops in with a slight bounce, stays visible
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
        trigger: lookbookPageContent,
        start: 'top 60%',
        end: 'top 20%',
        scrub: true,
      },
    }
  );
}

// C. Nav Bar Transition past the first viewport
ScrollTrigger.create({
  trigger: lookbookPageContent,
  start: '80vh top',
  onEnter: () => {
    gsap.to(glassNav, {
      backgroundColor: 'rgba(253, 248, 240, 0.90)',
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
