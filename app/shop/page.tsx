'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '@/components/product/ProductCard';
import { GlassPanel } from '@/components/ui/GlassPanel';
import BlurText from '@/components/ui/BlurText';
import { mockProducts, MockProduct } from '@/lib/mockProducts';
import { SlidersHorizontal, ArrowUpDown, X, Sparkles } from 'lucide-react';

type CategoryFilter = 'All' | 'Women' | 'Kids';
type SortOption = 'Newest' | 'Price: Low to High' | 'Price: High to Low';

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<SortOption>('Newest');

  // Compute all available unique sizes across the catalog for the size filter pills
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    mockProducts.forEach((product) => {
      product.sizes?.forEach((sz) => sizeSet.add(sz));
    });
    return Array.from(sizeSet);
  }, []);

  // Filter and sort products reactively
  const filteredProducts = useMemo(() => {
    let list = [...mockProducts];

    // 1. Category Filter
    if (selectedCategory !== 'All') {
      list = list.filter(
        (product) => product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 2. Size Filter
    if (selectedSize !== 'All') {
      list = list.filter((product) =>
        product.sizes ? product.sizes.includes(selectedSize) : false
      );
    }

    // 3. Sort Order
    if (selectedSort === 'Price: Low to High') {
      list.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'Price: High to Low') {
      list.sort((a, b) => b.price - a.price);
    } else {
      // 'Newest' — sort descending by createdAt date
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }

    return list;
  }, [selectedCategory, selectedSize, selectedSort]);

  // Transform MockProduct for the ProductCard component
  const formatForCard = (p: MockProduct) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.details,
    price: p.price,
    originalPrice: p.originalPrice,
    images: p.images,
    sizes: p.sizes,
    category: p.category.charAt(0).toUpperCase() + p.category.slice(1),
    inStock: !p.sold,
  });

  const hasActiveFilters = selectedCategory !== 'All' || selectedSize !== 'All';

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedSize('All');
    setSelectedSort('Newest');
  };

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <GlassPanel className="text-center py-12 mb-8">
        <span className="text-xs uppercase tracking-widest text-terracotta font-semibold">
          Artisanal Catalog
        </span>
        <div className="flex justify-center mt-2">
          <BlurText
            text="Shop The Collection"
            direction="top"
            className="font-serif text-3xl sm:text-5xl text-terracotta-dark justify-center text-center"
          />
        </div>
        <p className="text-sm text-terracotta-600 mt-2 max-w-md mx-auto font-light">
          Handcrafted slow fashion dyed with natural botanical extracts. One-of-one silhouettes made to order.
        </p>
      </GlassPanel>

      {/* Filter & Sort Bar */}
      <div
        className="rounded-2xl p-4 sm:p-5 mb-8 shadow-glass transition-all space-y-4"
        style={{
          background: 'rgba(253, 248, 240, 0.65)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="text-xs uppercase tracking-wider font-semibold text-terracotta-dark mr-1 flex items-center">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-terracotta" />
              Category:
            </span>
            {(['All', 'Women', 'Kids'] as CategoryFilter[]).map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-colors duration-300 ease-out cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-[#8B4520] text-white shadow-sm shadow-terracotta/30 border border-[#8B4520]'
                      : 'bg-white/50 text-terracotta-dark border border-terracotta/20 hover:border-terracotta/40 hover:bg-white/80'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Right: Sort Selector */}
          <div className="flex items-center space-x-2.5">
            <span className="text-xs uppercase tracking-wider font-semibold text-terracotta-dark flex items-center flex-shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-terracotta" />
              Sort:
            </span>
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as SortOption)}
                className="appearance-none bg-white/70 border border-terracotta/20 rounded-full px-4 py-1.5 pr-8 text-xs font-medium text-terracotta-dark focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta cursor-pointer transition-all duration-300 ease-out shadow-sm"
              >
                <option value="Newest">Newest</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-terracotta-600">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Row: Available Size Range Filter */}
        <div className="pt-3 border-t border-terracotta/10 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-terracotta-dark mr-1">
            Size:
          </span>
          <button
            type="button"
            onClick={() => setSelectedSize('All')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-300 ease-out cursor-pointer active:scale-95 ${
              selectedSize === 'All'
                ? 'bg-[#8B4520] text-white border border-[#8B4520]'
                : 'bg-white/40 text-terracotta-dark border border-terracotta/15 hover:border-terracotta/40'
            }`}
          >
            All Sizes
          </button>
          {availableSizes.map((sz) => {
            const isActive = selectedSize === sz;
            return (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSize(sz)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-300 ease-out cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-[#8B4520] text-white border border-[#8B4520]'
                    : 'bg-white/40 text-terracotta-dark border border-terracotta/15 hover:border-terracotta/40'
                }`}
              >
                {sz}
              </button>
            );
          })}

          {/* Active Filter Clear Helper */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto inline-flex items-center space-x-1 text-xs text-terracotta hover:text-terracotta-dark font-medium transition-colors duration-200"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header / Counter */}
      <div className="mb-4 flex items-center justify-between text-xs text-terracotta-600 px-1">
        <span>
          Showing{' '}
          <strong className="font-semibold text-terracotta-dark">
            {filteredProducts.length}
          </strong>{' '}
          {filteredProducts.length === 1 ? 'silhouette' : 'silhouettes'}
          {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
          {selectedSize !== 'All' ? ` (Size: ${selectedSize})` : ''}
        </span>
        <span className="text-[11px] text-terracotta-500 font-light hidden sm:inline">
          ✦ One-of-one handcrafted editions
        </span>
      </div>

      {/* Catalog Grid or Empty State with Staggered Entrance */}
      <AnimatePresence mode="wait">
        {filteredProducts.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-center py-20 px-6 sm:px-12 rounded-3xl max-w-xl mx-auto shadow-glass my-8"
            style={{
              background: 'rgba(253, 248, 240, 0.7)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
            }}
          >
            <div className="w-14 h-14 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-gold stroke-[1.5]" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-terracotta-dark font-medium">
              No pieces match your filters right now
            </h2>
            <p className="text-xs sm:text-sm text-terracotta-600 mt-2 max-w-md mx-auto leading-relaxed">
              Try adjusting your category or size selection to discover more handcrafted silhouettes.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-full bg-[#8B4520] hover:bg-[#703517] text-white text-xs font-medium tracking-wide transition-all shadow-sm hover:shadow"
              >
                Reset All Filters
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`${selectedCategory}-${selectedSize}-${selectedSort}`}
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
            className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  },
                }}
              >
                <ProductCard product={formatForCard(product)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
