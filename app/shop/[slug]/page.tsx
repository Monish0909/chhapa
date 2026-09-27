'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Ruler, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { ProductGallery } from '@/components/product/ProductGallery';
import { SizeChartModal } from '@/components/product/SizeChartModal';
import { ProductAccordion, AccordionSection } from '@/components/product/ProductAccordion';
import { useCartStore } from '@/lib/store';
import { getProductBySlug, MockProduct } from '@/lib/products';
import { motion } from 'motion/react';

interface PageProps {
  params: { slug: string };
}

export default function ProductDetailPage({ params }: PageProps) {
  const { slug } = params;

  const [productData, setProductData] = useState<MockProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      setLoading(true);
      try {
        const item = await getProductBySlug(slug);
        if (isMounted) {
          setProductData(item);
        }
      } catch (err) {
        console.error('[ProductDetailPage] Failed to load product:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const pulseCart = useCartStore((state) => state.pulseCart);

  // Auto-dismiss toast after 2 seconds
  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [showToast]);

  const handleAddToCart = () => {
    if (!productData || productData.sold) return;

    addItem({
      productId: productData.id,
      name: productData.name,
      price: productData.price,
      image: productData.images[0] || '',
      size: productData.sizeChart?.[0]?.size || 'One Size',
      quantity: 1,
    });

    // Trigger bounce pulse on nav cart icon
    pulseCart();

    // Trigger sliding toast
    setShowToast(true);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] pt-32 pb-24 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-2 border-terracotta border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif text-lg text-terracotta-dark">Retrieving silhouette details...</p>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-[70vh] pt-32 pb-24 px-4 flex flex-col items-center justify-center text-center">
        <h1 className="font-serif text-2xl sm:text-3xl text-terracotta-dark font-medium mb-3">
          Piece Not Found
        </h1>
        <p className="text-sm text-terracotta-600 max-w-md mb-6 font-light">
          This handcrafted silhouette is not present in our collection or has been archived.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center px-6 py-2.5 rounded-full bg-[#8B4520] text-white text-xs font-medium tracking-wide shadow-sm hover:bg-[#703517] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Shop
        </Link>
      </div>
    );
  }

  const accordionSections: AccordionSection[] = [
    {
      id: 'fabric-care',
      title: 'Fabric & Care',
      content: (
        <div className="space-y-3 font-light text-terracotta-dark/85">
          <p>{productData.fabricCare}</p>
          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-terracotta/5 border border-terracotta/10 text-terracotta">
              ✦ 100% Botanical Plant Dyes
            </span>
            <span className="px-2.5 py-1 rounded-md bg-terracotta/5 border border-terracotta/10 text-terracotta">
              ✦ Handspun Organic Fiber
            </span>
            <span className="px-2.5 py-1 rounded-md bg-terracotta/5 border border-terracotta/10 text-terracotta">
              ✦ Gentle Cold Handwash
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'details',
      title: 'Details',
      content: (
        <div className="space-y-3 font-light text-terracotta-dark/85">
          <p>{productData.details}</p>
          <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm pt-1 text-terracotta-dark/80">
            <li>Individually painted freehand with fine artisan brushes</li>
            <li>Artisanal batch-dyed with raw botanical extracts and minerals</li>
            <li>French seams &amp; hand-finished edge hem details</li>
            <li>Tailored to celebrate natural organic drape and hand-feel</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'shipping-returns',
      title: 'Shipping & Returns',
      content: (
        <div className="space-y-3 font-light text-terracotta-dark/85">
          <p>{productData.shippingReturns}</p>
          <div className="pt-1 text-xs text-terracotta-600 space-y-1">
            <p>✦ Packaging: 100% plastic-free compostable cloth wrap</p>
            <p>✦ Delivery: Tracking link dispatched via SMS &amp; Email upon order completion</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Toast Notification (sliding in from top-right, auto-dismissing after 2s) */}
      <div
        className={`fixed top-6 right-4 sm:right-8 z-50 transition-all duration-300 transform pointer-events-none ${
          showToast
            ? 'translate-y-0 opacity-100'
            : '-translate-y-6 opacity-0'
        }`}
      >
        <div className="flex items-center space-x-3 px-5 py-3.5 rounded-2xl bg-terracotta text-cream shadow-2xl border border-white/20">
          <div className="w-6 h-6 rounded-full bg-cream/20 flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-cream" />
          </div>
          <div>
            <p className="text-sm font-medium tracking-wide">Added to cart</p>
            <p className="text-[11px] text-cream/80 truncate max-w-[200px]">
              {productData.name} (1 of 1)
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <nav className="mb-6 sm:mb-8 flex items-center space-x-2 text-xs sm:text-sm text-terracotta-600">
        <Link
          href="/shop"
          className="inline-flex items-center hover:text-terracotta transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
          Back to Shop
        </Link>
        <span className="text-terracotta-400">/</span>
        <span className="capitalize">{productData.category}</span>
        <span className="text-terracotta-400">/</span>
        <span className="text-terracotta-dark font-medium truncate max-w-[220px] sm:max-w-none">
          {productData.name}
        </span>
      </nav>

      {/* Main Two-Column Layout (stacked on mobile, two-column on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery (7 cols on desktop) */}
        <div className="lg:col-span-7 w-full">
          <ProductGallery
            images={productData.images}
            productName={productData.name}
          />
        </div>

        {/* Right Column: Glass Panel (5 cols on desktop) */}
        <div className="lg:col-span-5 w-full">
          <div
            className={`rounded-2xl transition-all duration-300 ${
              productData.sold ? 'opacity-65' : 'opacity-100'
            }`}
            style={{
              background: 'rgba(253, 248, 240, 0.6)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              padding: '32px',
            }}
          >
            {/* Header: Badge & Sold indicator */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium tracking-wide bg-terracotta-50/80 text-terracotta border border-terracotta/20 shadow-sm">
                <Sparkles className="w-3 h-3 mr-1 text-gold" />
                One of one · Made to order
              </span>

              {productData.sold && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-terracotta-dark text-cream">
                  Archived / Sold
                </span>
              )}
            </div>

            {/* Product Name (Refined Serif, Large) */}
            <h1 className="font-serif text-3xl sm:text-4xl text-terracotta-dark font-medium tracking-tight leading-tight">
              {productData.name}
            </h1>

            {/* Tagline if present */}
            {productData.tagline && (
              <p className="mt-2 text-xs sm:text-sm text-terracotta-dark/75 font-light leading-relaxed">
                {productData.tagline}
              </p>
            )}

            {/* Price */}
            <div className="mt-4 flex items-baseline space-x-3 pb-6 border-b border-terracotta/15">
              <span className="text-3xl font-semibold text-terracotta font-serif">
                ₹{productData.price.toLocaleString('en-IN')}
              </span>
              {productData.originalPrice && (
                <span className="text-sm line-through text-terracotta-400">
                  ₹{productData.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-xs text-terracotta-600 font-light">
                (Inclusive of all taxes)
              </span>
            </div>

            {/* Interactive Callout Boxes: Size Guide & Ships-In */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Size chart callout */}
              <button
                type="button"
                onClick={() => setIsSizeChartOpen(true)}
                className="flex items-center space-x-3 p-3.5 rounded-xl border border-terracotta/20 bg-white/40 hover:bg-white/70 hover:border-terracotta/40 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-terracotta/10 flex items-center justify-center text-terracotta flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Ruler className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-terracotta-600 font-semibold block">
                    Fit Details
                  </span>
                  <span className="text-xs font-medium text-terracotta-dark group-hover:text-terracotta transition-colors">
                    View Size &amp; Fit Guide
                  </span>
                </div>
              </button>

              {/* Ships-in callout */}
              <div className="flex items-center space-x-3 p-3.5 rounded-xl border border-terracotta/20 bg-white/40">
                <div className="w-9 h-9 rounded-lg bg-terracotta/10 flex items-center justify-center text-terracotta flex-shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-terracotta-600 font-semibold block">
                    Dispatch Time
                  </span>
                  <span className="text-xs font-medium text-terracotta-dark">
                    Ships in {productData.shipsInDays}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Selector: Fixed at 1 with no stepper since these are one-of-one pieces */}
            <div className="mt-6 flex items-center justify-between p-3.5 rounded-xl bg-white/30 border border-terracotta/15">
              <div>
                <span className="text-xs font-semibold text-terracotta-dark block">
                  Edition Quantity
                </span>
                <span className="text-[11px] text-terracotta-600 font-light">
                  Archival unique one-of-one piece
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3.5 py-1.5 rounded-lg bg-cream-100 border border-terracotta/20 text-sm font-semibold text-terracotta-dark">
                  1
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="mt-6">
              <motion.button
                type="button"
                onClick={handleAddToCart}
                disabled={productData.sold}
                whileTap={productData.sold ? {} : { scale: 0.97 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full py-4 px-6 rounded-full text-base font-medium tracking-wide transition-all duration-200 shadow-md ${
                  productData.sold
                    ? 'bg-terracotta/40 text-cream/70 cursor-not-allowed shadow-none'
                    : 'bg-[#8B4520] hover:bg-[#703517] text-white shadow-terracotta/20 hover:shadow-lg hover:shadow-terracotta/30'
                }`}
              >
                {productData.sold ? 'Sold Out' : 'Add to Cart'}
              </motion.button>
            </div>

            {/* Subtle Brand Value Props */}
            <div className="mt-6 pt-5 border-t border-terracotta/15 grid grid-cols-2 gap-2 text-[11px] text-terracotta-600">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-terracotta" />
                <span>Authentic Freehand Brushcraft</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Zero Synthetic Chemicals</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Below the Two Columns: Collapsible Accordion Component */}
      <section className="mt-14 sm:mt-20 max-w-4xl mx-auto">
        <div className="mb-4 text-center sm:text-left">
          <span className="text-xs uppercase tracking-widest text-terracotta font-semibold">
            Garment Specifications
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-terracotta-dark font-medium mt-1">
            Artisan Craft &amp; Provenance
          </h2>
        </div>

        <ProductAccordion sections={accordionSections} />
      </section>

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        sizeChart={productData.sizeChart}
        productName={productData.name}
      />
    </div>
  );
}
