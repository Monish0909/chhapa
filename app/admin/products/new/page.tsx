'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ImageUploader from '@/components/admin/ImageUploader';
import SizePicker from '@/components/admin/SizePicker';
import { DEFAULT_SIZES, buildSizeChart } from '@/lib/sizes';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminNewProductPage() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Women',
    description: '',
    fabricCare: '',
    shipsInDays: '7-10 days',
  });

  const [images, setImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>(DEFAULT_SIZES);
  const [imagesBusy, setImagesBusy] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const priceNum = parseFloat(formData.price) || 0;
    const shipsDaysNum = parseInt(formData.shipsInDays.replace(/[^0-9]/g, '')) || 7;
    if (sizes.length === 0) {
      setErrorMessage('Please select at least one size.');
      setIsSubmitting(false);
      return;
    }
    if (imagesBusy) {
      setErrorMessage('Please wait for the images to finish uploading.');
      setIsSubmitting(false);
      return;
    }
    const imagesArray = images.length > 0 ? images : ['/frames/home/frame_0001.jpg'];
    const categoryLower = formData.category.toLowerCase();

    try {
      const { error } = await supabase.from('products').insert({
        name: formData.name,
        price: priceNum,
        category: categoryLower,
        images: imagesArray,
        size_chart: buildSizeChart(sizes),
        ships_in_days: shipsDaysNum,
        sold: false,
        fabric_care: formData.fabricCare || 'Crafted from 100% natural organic cotton. Gentle cold handwash.',
        details: formData.description || 'Handcrafted slow living piece with natural plant dyes.',
        shipping_returns: 'Free insured shipping across India. Exchanges accepted within 7 days in unworn condition.',
      });

      if (error) {
        console.warn('Supabase product insert warning:', error.message);
        setErrorMessage(error.message);
      }
      setIsSaved(true);
    } catch (err: unknown) {
      console.error('Failed to create product in Supabase:', err);
      const msg = err instanceof Error ? err.message : 'Error saving product';
      setErrorMessage(msg);
      setIsSaved(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Products</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
          Add New Product
        </h1>
        <p className="text-sm text-slate-500">
          Create an artisanal one-of-one listing with craft specifications and photo preview.
        </p>
      </div>

      {/* Success / Status Notification */}
      {isSaved && (
        <div className={`p-4 rounded-lg border space-y-2 ${errorMessage ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${errorMessage ? 'text-amber-600' : 'text-emerald-600'}`} />
            <span className="font-semibold text-sm">
              {errorMessage ? 'Saved (With Notice)' : 'Product Saved to Supabase!'}
            </span>
          </div>
          <p className="text-xs">
            {errorMessage
              ? `Note: ${errorMessage}. If tables were not created yet, please run the SQL script in your Supabase dashboard.`
              : 'Product row inserted into the products table successfully.'}
          </p>
          <div className="pt-2 flex space-x-3">
            <Link
              href="/admin/products"
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-medium transition-colors"
            >
              View Products List
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsSaved(false);
                setFormData({
                  name: '',
                  price: '',
                  category: 'Women',
                  description: '',
                  fabricCare: '',
                  shipsInDays: '7-10 days',
                });
                setImages([]);
                setSizes(DEFAULT_SIZES);
              }}
              className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded text-xs font-medium transition-colors"
            >
              Add Another Piece
            </button>
          </div>
        </div>
      )}

      {/* Product Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-sm space-y-6"
      >
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
            1. Garment Overview
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Hand-Painted Indigo Bloom Silk-Cotton Shirt"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Price (INR ₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                required
                min={0}
                value={formData.price}
                onChange={handleInputChange}
                placeholder="3499"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 cursor-pointer"
              >
                <option value="Women">Women</option>
                <option value="Boy">Boy</option>
                <option value="Girl">Girl</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
            2. Craft &amp; Sizing Specifications
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the hand-painted brush motifs, natural dyes, artisan region, and silhouette fit..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Fabric &amp; Care Instructions <span className="text-red-500">*</span>
            </label>
            <textarea
              name="fabricCare"
              required
              rows={2}
              value={formData.fabricCare}
              onChange={handleInputChange}
              placeholder="e.g. 100% handspun organic cotton. Cold hand-wash separately with mild detergent. Line dry in shade."
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Shipping Time (Days) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="shipsInDays"
              required
              value={formData.shipsInDays}
              onChange={handleInputChange}
              placeholder="e.g. 7-10 days"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>
        </div>

        <SizePicker value={sizes} onChange={setSizes} />

        {/* Product Images (multiple) */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
            3. Product Imagery
          </h2>
          <ImageUploader images={images} onChange={setImages} onBusyChange={setImagesBusy} />
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
          >
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
