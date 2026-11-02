'use client';

import React from 'react';
import { SIZE_OPTIONS } from '@/lib/sizes';

export default function SizePicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (sizes: string[]) => void;
}) {
  const toggle = (sz: string) =>
    onChange(value.includes(sz) ? value.filter((s) => s !== sz) : [...value, sz]);

  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        Available Sizes <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {SIZE_OPTIONS.map((sz) => {
          const on = value.includes(sz);
          return (
            <button
              key={sz}
              type="button"
              onClick={() => toggle(sz)}
              aria-pressed={on}
              className={`min-w-[3rem] px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                on
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {sz}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500 mt-1">Tap to select every size this piece is made in (XS to 3XL).</p>
    </div>
  );
}
