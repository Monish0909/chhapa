import React from 'react';

interface BotanicalWatermarkProps {
  className?: string;
  opacity?: number;
}

export function BotanicalWatermark({
  className = '',
  opacity = 0.07,
}: BotanicalWatermarkProps) {
  return (
    <div
      className={`pointer-events-none select-none absolute overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-[#8B4520]"
      >
        <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Concentric subtle mandala guidelines */}
          <circle cx="300" cy="300" r="270" strokeDasharray="3 6" opacity="0.6" />
          <circle cx="300" cy="300" r="220" />
          <circle cx="300" cy="300" r="170" strokeDasharray="4 4" />
          <circle cx="300" cy="300" r="120" />
          <circle cx="300" cy="300" r="70" />
          <circle cx="300" cy="300" r="28" fill="currentColor" fillOpacity="0.12" />

          {/* Center lotus seed dot */}
          <circle cx="300" cy="300" r="6" fill="currentColor" />

          {/* 8-Petal Central Floral Core */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <g key={`core-${i}`} transform={`rotate(${angle} 300 300)`}>
              {/* Petal leaf loop */}
              <path d="M 300 272 C 285 240 288 200 300 180 C 312 200 315 240 300 272 Z" fill="currentColor" fillOpacity="0.04" />
              {/* Central petal rib */}
              <line x1="300" y1="272" x2="300" y2="185" strokeWidth="0.8" />
              {/* Radial dots along the axis */}
              <circle cx="300" cy="155" r="3" fill="currentColor" />
              <circle cx="300" cy="138" r="2" fill="currentColor" />
            </g>
          ))}

          {/* Outer Layer: Flowing Paisley / Ajrakh Botanical Motifs */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
            <g key={`paisley-${i}`} transform={`rotate(${angle} 300 300)`}>
              {/* Stem curving outwards */}
              <path
                d="M 300 180 C 315 150 330 115 320 85 C 310 60 285 55 275 80 C 265 105 285 140 300 160"
                strokeWidth="1"
              />
              {/* Budding botanical leaf pairs */}
              <path d="M 312 145 C 326 142 338 147 342 153 C 335 157 322 156 312 145" />
              <path d="M 320 120 C 334 115 346 118 350 125 C 342 129 330 128 320 120" />
              <circle cx="282" cy="74" r="2.5" fill="currentColor" />
              <circle cx="320" cy="85" r="3.5" fill="currentColor" fillOpacity="0.15" />
            </g>
          ))}

          {/* Outer Ring of Delicately Spaced Botanical Buds & Dots */}
          {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((angle, i) => (
            <g key={`leaf-${i}`} transform={`rotate(${angle} 300 300)`}>
              <path d="M 300 230 C 285 200 270 170 280 140 C 290 120 305 130 300 160" strokeWidth="0.9" />
              <circle cx="280" cy="138" r="3" fill="currentColor" />
              <path d="M 300 230 C 315 200 330 170 320 140 C 310 120 295 130 300 160" strokeWidth="0.9" />
              <circle cx="320" cy="138" r="3" fill="currentColor" />
            </g>
          ))}

          {/* Delicate border perimeter scalloped beads */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = i * 10;
            return (
              <g key={`bead-${i}`} transform={`rotate(${angle} 300 300)`}>
                <circle cx="300" cy="40" r="2" fill="currentColor" opacity="0.8" />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
