'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Upload, Image as ImageIcon } from 'lucide-react';

export default function AdminNewProductPage() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Women',
    description: '',
    fabricCare: '',
    shipsInDays: '7-10 days',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productPayload = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      imagePreview: imagePreview || null,
      createdAt: new Date().toISOString(),
    };

    console.log('=== ADMIN: NEW PRODUCT SAVED ===', productPayload);
    setIsSaved(true);
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

      {/* Success Notification */}
      {isSaved && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold text-sm">Product Saved Successfully!</span>
          </div>
          <p className="text-xs text-emerald-800">
            Product data logged to console (mock mode). In production, this will sync directly to the database.
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
                setImagePreview(null);
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
              placeholder="e.g. Ajrakh Hand-Block Reversible Vest"
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
                <option value="Kids">Kids</option>
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
              placeholder="Describe the block carving motifs, natural dyes, artisan region, and silhouette fit..."
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

        {/* Image Upload with Preview */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
            3. Product Imagery
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Primary Photo
            </label>
            <div className="mt-1 flex items-center gap-4">
              {/* File Input */}
              <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium shadow-sm transition-colors">
                <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                <span>Choose Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-500">
                {imagePreview ? 'Photo selected for preview' : 'PNG, JPG, WebP supported'}
              </span>
            </div>

            {/* Preview Box */}
            <div className="mt-3">
              {imagePreview ? (
                <div className="relative w-36 aspect-[3/4] rounded-lg overflow-hidden border border-slate-300 bg-slate-100 shadow-sm">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white text-[10px] px-1.5 py-0.5 rounded"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="w-36 aspect-[3/4] rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-8 h-8 stroke-[1.2] mb-1 text-slate-300" />
                  <span className="text-[11px]">No preview</span>
                </div>
              )}
            </div>
          </div>
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
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
          >
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
}
