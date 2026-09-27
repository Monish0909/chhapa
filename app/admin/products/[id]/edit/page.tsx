'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertCircle, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Women',
    description: '',
    fabricCare: '',
    shipsInDays: '7-10 days',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [sold, setSold] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch product data on mount
  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      if (!productId) {
        setIsLoading(false);
        setNotFound(true);
        return;
      }

      setIsLoading(true);
      setNotFound(false);
      setErrorMessage(null);

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .maybeSingle();

        if (error) {
          console.error('[Admin Edit Product] Fetch error:', error);
          if (isMounted) {
            setErrorMessage(error.message);
            setNotFound(true);
          }
          return;
        }

        if (!data) {
          if (isMounted) {
            setNotFound(true);
          }
          return;
        }

        if (isMounted) {
          const categoryDisplay =
            data.category && data.category.toLowerCase() === 'kids' ? 'Kids' : 'Women';

          setFormData({
            name: data.name || '',
            price: data.price !== undefined && data.price !== null ? String(data.price) : '',
            category: categoryDisplay,
            description: data.details || '',
            fabricCare: data.fabric_care || '',
            shipsInDays: data.ships_in_days ? `${data.ships_in_days} days` : '7-10 days',
          });

          setSold(Boolean(data.sold));

          if (Array.isArray(data.images) && data.images.length > 0) {
            setExistingImages(data.images);
            setImagePreview(data.images[0]);
          } else {
            setExistingImages([]);
            setImagePreview(null);
          }
        }
      } catch (err) {
        console.error('[Admin Edit Product] Exception fetching product:', err);
        if (isMounted) {
          setNotFound(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const priceNum = parseFloat(formData.price) || 0;
    const shipsDaysNum = parseInt(formData.shipsInDays.replace(/[^0-9]/g, '')) || 7;
    
    // Determine images array
    let imagesArray: string[];
    if (imagePreview) {
      // If imagePreview is still the first existing image, keep existing images
      if (existingImages.length > 0 && imagePreview === existingImages[0]) {
        imagesArray = existingImages;
      } else {
        imagesArray = [imagePreview];
      }
    } else {
      imagesArray = existingImages.length > 0 ? existingImages : ['/frames/home/frame_0001.jpg'];
    }

    const categoryLower = formData.category.toLowerCase();

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          price: priceNum,
          category: categoryLower,
          images: imagesArray,
          ships_in_days: shipsDaysNum,
          fabric_care: formData.fabricCare,
          details: formData.description,
        })
        .eq('id', productId);

      if (error) {
        console.error('[Admin Edit Product] Supabase update error:', error);
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      setIsSaved(true);
      // Auto-redirect to /admin/products after brief pause so the user sees success
      setTimeout(() => {
        router.push('/admin/products');
      }, 1200);
    } catch (err: unknown) {
      console.error('[Admin Edit Product] Exception updating product:', err);
      const msg = err instanceof Error ? err.message : 'Error updating product';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
        <p className="text-sm text-slate-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500 mb-2">
          <AlertCircle className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Product Not Found</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          The product with ID <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs text-slate-800">{productId}</code> could not be found in the database.
        </p>
        <div className="pt-4">
          <Link
            href="/admin/products"
            className="inline-flex items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            <span>Return to Products List</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button & Header */}
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Products</span>
        </Link>
        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Edit Product
          </h1>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
              sold
                ? 'bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                sold ? 'bg-slate-500' : 'bg-emerald-500'
              }`}
            />
            {sold ? 'Sold / Archived' : 'Available in Shop'}
          </span>
        </div>
        <p className="text-sm text-slate-500">
          Modify the garment specifications, pricing, imagery, and artisan details for this piece.
        </p>
      </div>

      {/* Success Notification */}
      {isSaved && (
        <div className="p-4 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-900 space-y-2 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span className="font-semibold text-sm">Product Updated Successfully!</span>
          </div>
          <p className="text-xs text-emerald-800">
            Changes have been saved to Supabase. Redirecting back to products list...
          </p>
          <div className="pt-2">
            <Link
              href="/admin/products"
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-medium transition-colors inline-block"
            >
              Go to Products Now
            </Link>
          </div>
        </div>
      )}

      {/* Error Message if any */}
      {errorMessage && !isSaved && (
        <div className="p-4 rounded-lg border bg-red-50 border-red-200 text-red-900 space-y-1">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="font-semibold text-sm">Update Failed</span>
          </div>
          <p className="text-xs text-red-700">{errorMessage}</p>
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
                <span>Replace Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-500">
                {imagePreview ? 'Photo selected' : 'PNG, JPG, WebP supported'}
              </span>
            </div>

            {/* Preview Box */}
            <div className="mt-3">
              {imagePreview ? (
                <div className="relative w-36 aspect-[3/4] rounded-lg overflow-hidden border border-slate-300 bg-slate-100 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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

        {/* Submit & Cancel Buttons */}
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
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors shadow-sm flex items-center space-x-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isSubmitting ? 'Updating...' : 'Update Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
