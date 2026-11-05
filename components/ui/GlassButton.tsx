import React from 'react';
import Link from 'next/link';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'glass' | 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** When set, renders a real <a> link styled as a button (avoids invalid <a><button> nesting that breaks taps on phones). */
  href?: string;
}

export function GlassButton({
  children,
  variant = 'glass',
  size = 'md',
  className = '',
  href,
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

  const classes = `inline-flex items-center justify-center text-center rounded-full transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} onClick={props.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
