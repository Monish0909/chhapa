'use client';

import React, { useState } from 'react';
import BorderGlow from '@/components/ui/BorderGlow';

interface ProductGalleryProps {
  images: string[];
  productName?: string;
}

export function ProductGallery({ images, productName = 'Product' }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <BorderGlow
        borderRadius={24}
        fillOpacity={0.4}
        backgroundColor="rgba(253, 248, 240, 0.7)"
        className="w-full"
      >
        <div className="aspect-[3/4] rounded-3xl bg-cream-200/50 flex flex-col items-center justify-center font-serif text-terracotta-400 p-8 text-center">
          <span className="text-lg">chhapa artisanal silhouette</span>
          <span className="text-xs text-terracotta-400/80 font-sans mt-2">Crafted with botanical pigments</span>
        </div>
      </BorderGlow>
    );
  }


  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Large Main Image Frame with 0.3s soft opacity crossfade */}
      <BorderGlow
        borderRadius={24}
        fillOpacity={0.4}
        backgroundColor="rgba(253, 248, 240, 0.7)"
        className="w-full"
      >
        <div className="aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden bg-cream-100/60 relative shadow-glass border border-white/50">
          {images.map((img, idx) => (
            <img
              key={`${img}-${idx}`}
              src={img}
              alt={`${productName} view ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-in-out ${
                selectedIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          ))}

          {/* Subtle natural lighting vignette */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-transparent z-20" />
          
          {/* Subtle counter tag */}
          <div className="absolute bottom-4 right-4 z-20 px-3 py-1 rounded-full bg-cream-200/80 backdrop-blur-md border border-white/40 text-[11px] font-medium text-terracotta-dark shadow-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      </BorderGlow>

      {/* Thumbnail Strip (4-5 thumbnails) */}
      {images.length > 1 && (
        <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-2 scrollbar-none items-center">
          {images.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={`thumb-${idx}`}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`Select view ${idx + 1} of ${productName}`}
                className={`relative flex-shrink-0 w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden transition-all duration-300 ${
                  isSelected
                    ? 'ring-2 ring-terracotta ring-offset-2 ring-offset-cream scale-105 shadow-md opacity-100'
                    : 'opacity-60 hover:opacity-100 border border-white/60 hover:border-terracotta/40'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {isSelected && (
                  <div className="absolute inset-0 border-2 border-terracotta rounded-xl pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
