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
      <div className="overflow-hidden flex flex-col h-full bg-cream/60 backdrop-blur-lg border border-white/30 rounded-2xl shadow-glass cursor-pointer transition-all duration-300 ease-out group-hover:scale-[1.015] group-hover:border-[rgba(139,69,32,0.4)] group-hover:shadow-[0_8px_24px_rgba(139,69,32,0.12)]">
        <div className="relative aspect-[3/4] overflow-hidden bg-terracotta-50">
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
