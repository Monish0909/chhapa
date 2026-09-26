import React from 'react';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  opacity?: 'low' | 'medium' | 'high';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function GlassPanel({
  children,
  opacity = 'medium',
  blur = 'lg',
  className = '',
  ...props
}: GlassPanelProps) {
  const opacityMap = {
    low: 'bg-cream/40',
    medium: 'bg-cream/65',
    high: 'bg-cream/85',
  };

  const blurMap = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  return (
    <div
      className={`${opacityMap[opacity]} ${blurMap[blur]} border border-white/40 shadow-glass rounded-2xl p-6 transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
