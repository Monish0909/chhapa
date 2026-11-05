'use client';

import React from 'react';
import { KIDS_SIZES } from '@/lib/sizes';

// Boy / Girl: set a price for each age range. Leave a price empty to not offer that size.
export default function KidsSizePricing({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (prices: Record<string, string>) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        Sizes &amp; prices <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {KIDS_SIZES.map((sz) => (
          <div key={sz} className="rounded-lg border border-slate-300 p-3 bg-white">
            <span className="block text-sm font-semibold text-slate-900 mb-2">{sz}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">₹</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={value[sz] ?? ''}
                onChange={(e) => onChange({ ...value, [sz]: e.target.value })}
                placeholder="Price (leave empty if not available)"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-slate-500 mt-1">
        Enter a price for each age range you sell. The shop shows &quot;From&quot; the lowest price.
      </p>
    </div>
  );
}
