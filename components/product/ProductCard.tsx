import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { Badge } from '../ui/Badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/shop/${product.slug}`} className="block h-full group">
      <div
        className="relative overflow-hidden flex flex-col h-full rounded-2xl cursor-pointer transition-all duration-300 ease-out group-hover:scale-[1.018] group-hover:-translate-y-1"
        style={{
          background: 'rgba(253, 248, 240, 0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.55)',
          boxShadow:
            '0 4px 16px -2px rgba(139, 69, 32, 0.06), 0 1px 2px 0 rgba(61, 36, 24, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
        }}
      >
        {/* Faint corner light gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl -z-0 opacity-70 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 40%, rgba(206, 123, 85, 0.05) 100%)',
          }}
        />

        {/* Top inner glass highlight */}
        <div className="glass-inner-highlight z-10" />

        <div className="relative aspect-[3/4] overflow-hidden bg-terracotta-50 z-0">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-serif text-terracotta-400 bg-cream-200">
              chhapa craft
            </div>
          )}
          {product.featured && (
            <div className="absolute top-3 left-3">
              <Badge variant="terracotta">Featured</Badge>
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-terracotta-600 font-medium">
              {product.category}
            </p>
            <h3 className="font-serif text-base text-terracotta-dark font-medium mt-1 group-hover:text-terracotta transition-colors">
              {product.name}
            </h3>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-base font-semibold text-terracotta">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && (
              <span className="text-xs line-through text-terracotta-400">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
