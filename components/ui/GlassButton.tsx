import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'glass' | 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GlassButton({
  children,
  variant = 'glass',
  size = 'md',
  className = '',
  ...props
}: GlassButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs min-h-[44px]',
    md: 'px-5 py-2.5 text-sm min-h-[44px]',
    lg: 'px-7 py-3.5 text-base min-h-[48px]',
  };

  const variantClasses = {
    glass: 'glass-btn text-terracotta-dark font-medium tracking-wide shadow-sm',
    solid: 'bg-terracotta text-cream hover:bg-terracotta-dark shadow-md hover:shadow-lg transition-all',
    outline: 'border border-terracotta text-terracotta hover:bg-terracotta hover:text-cream transition-all',
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-full transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
