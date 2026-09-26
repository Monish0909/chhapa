'use client';

import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { SizeMeasurement } from '@/lib/mockProducts';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizeChart?: SizeMeasurement[];
  productName?: string;
}

export function SizeChartModal({
  isOpen,
  onClose,
  sizeChart,
  productName,
}: SizeChartModalProps) {
  if (!isOpen) return null;

  // Extract columns dynamically if available, otherwise default to standard measurements
  const columns =
    sizeChart && sizeChart.length > 0
      ? Object.keys(sizeChart[0].measurements)
      : ['Chest', 'Waist', 'Length'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-chart-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#3d2418]/50 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-lg z-10 rounded-2xl p-6 sm:p-8 shadow-2xl transition-all"
        style={{
          background: 'rgba(253, 248, 240, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-terracotta/15">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest text-terracotta font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Tailoring Guide</span>
            </div>
            <h3 id="size-chart-title" className="font-serif text-2xl font-medium text-terracotta-dark">
              Size &amp; Fit Guide
            </h3>
            {productName && (
              <p className="text-xs text-terracotta-600 mt-0.5 line-clamp-1">
                Measurements for {productName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-terracotta/10 text-terracotta-dark transition-colors"
            aria-label="Close size guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="mt-5 overflow-hidden rounded-xl border border-terracotta/15 bg-white/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-terracotta-dark">
              <thead>
                <tr className="bg-terracotta-50/70 border-b border-terracotta/15 text-xs uppercase tracking-wider text-terracotta font-semibold">
                  <th className="py-3 px-4">Size</th>
                  {columns.map((col) => (
                    <th key={col} className="py-3 px-4">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-terracotta/10 text-xs sm:text-sm">
                {sizeChart && sizeChart.length > 0 ? (
                  sizeChart.map((row) => (
                    <tr key={row.size} className="hover:bg-cream-100/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-terracotta-dark">{row.size}</td>
                      {columns.map((col) => (
                        <td key={col} className="py-3 px-4 text-terracotta-dark/85">
                          {row.measurements[col] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="hover:bg-cream-100/50 transition-colors">
                      <td className="py-3 px-4 font-semibold">S</td>
                      <td className="py-3 px-4">38&quot;</td>
                      <td className="py-3 px-4">34&quot;</td>
                      <td className="py-3 px-4">28&quot;</td>
                    </tr>
                    <tr className="hover:bg-cream-100/50 transition-colors">
                      <td className="py-3 px-4 font-semibold">M</td>
                      <td className="py-3 px-4">40&quot;</td>
                      <td className="py-3 px-4">36&quot;</td>
                      <td className="py-3 px-4">29&quot;</td>
                    </tr>
                    <tr className="hover:bg-cream-100/50 transition-colors">
                      <td className="py-3 px-4 font-semibold">L</td>
                      <td className="py-3 px-4">42&quot;</td>
                      <td className="py-3 px-4">38&quot;</td>
                      <td className="py-3 px-4">30&quot;</td>
                    </tr>
                    <tr className="hover:bg-cream-100/50 transition-colors">
                      <td className="py-3 px-4 font-semibold">XL</td>
                      <td className="py-3 px-4">44&quot;</td>
                      <td className="py-3 px-4">40&quot;</td>
                      <td className="py-3 px-4">31&quot;</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fit note footer */}
        <div className="mt-4 p-3 rounded-xl bg-terracotta/5 border border-terracotta/10 text-xs text-terracotta-dark/80 leading-relaxed">
          <p className="font-medium text-terracotta">Fit &amp; Sizing Note:</p>
          <p className="mt-0.5">
            All pieces are handcrafted one-of-one silhouettes cut with an easy, relaxed drape.
            Because each piece is washed in open water tanks, minor variations (±0.5&quot;) are natural and celebrated.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-terracotta text-cream text-xs font-medium hover:bg-terracotta-600 transition-colors shadow-sm"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
