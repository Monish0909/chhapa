import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
}

export function GlassCard({
  children,
  interactive = true,
  className = '',
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`bg-cream/60 backdrop-blur-lg border border-white/30 rounded-2xl shadow-glass ${
        interactive ? 'hover:shadow-glass-hover hover:-translate-y-1 hover:border-white/50 cursor-pointer' : ''
      } transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
