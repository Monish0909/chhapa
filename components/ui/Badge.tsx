import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'terracotta' | 'gold' | 'blush' | 'cream' | 'outline';
  className?: string;
}

export function Badge({
  children,
  variant = 'terracotta',
  className = '',
}: BadgeProps) {
  const variantStyles = {
    terracotta: 'bg-terracotta-50 text-terracotta-800 border-terracotta-200',
    gold: 'bg-gold-light/40 text-gold-dark border-gold/40',
    blush: 'bg-blush-light text-terracotta-700 border-blush/40',
    cream: 'bg-cream-100 text-terracotta-dark border-cream-300',
    outline: 'border border-terracotta/30 text-terracotta-dark',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
