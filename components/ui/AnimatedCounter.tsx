'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  prefix = '₹',
  duration = 0.4,
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const countRef = useRef({ val: value });
  const isInitial = useRef(true);

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      countRef.current.val = value;
      setDisplayValue(value);
      return;
    }

    const tween = gsap.to(countRef.current, {
      val: value,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        setDisplayValue(Math.round(countRef.current.val));
      },
    });

    return () => {
      tween.kill();
    };
  }, [value, duration]);

  return (
    <span className={`inline-block tabular-nums transition-transform duration-200 ${className}`}>
      {prefix}
      {displayValue.toLocaleString('en-IN')}
    </span>
  );
}
