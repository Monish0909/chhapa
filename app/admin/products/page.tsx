'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getProducts, MockProduct } from '@/lib/products';

export default function AdminProductsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const items = await getProducts();
      setProducts(items);
    } catch (err) {
      console.warn('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    loadProducts();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.warn('Supabase delete error:', error.message);
      }
      setProducts((current) => current.filter((p) => p.id !== id));
      showNotification(`Product "${name}" deleted.`);
    } catch (err) {
      console.error('Error deleting product:', err);
      // Optimistic removal fallback
      setProducts((current) => current.filter((p) => p.id !== id));
      showNotification(`Product "${name}" removed.`);
    }
  };

  const handleToggleSold = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const newSoldState = !target.sold;

    // Optimistic local update
    setProducts((current) =>
      current.map((p) => (p.id === id ? { ...p, sold: newSoldState } : p))
    );

    try {
      const { error } = await supabase
        .from('products')
        .update({ sold: newSoldState })
        .eq('id', id);

      if (error) {
        console.warn('Supabase toggle sold error:', error.message);
      }
      showNotification(
        `"${target.name}" marked as ${newSoldState ? 'Sold' : 'Available'}.`
      );
    } catch (err) {
      console.error('Failed to update product sold status in Supabase:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Products Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your one-of-one handcrafted silhouettes, pricing, and stock status.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Thumbnail</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!isMounted || loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                    No products found. Click &quot;Add New Product&quot; to create one.
                  </td>
                </tr>
              ) : (
                products.map((product, idx) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/80 transition-colors animate-fadeIn"
                    style={{
                      animationDuration: '200ms',
                      animationDelay: `${idx * 20}ms`,
                      animationFillMode: 'both',
                    }}
                  >
                    {/* Thumbnail */}
                    <td className="py-3 px-4 w-16">
                      <div className="w-12 h-14 rounded bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">None</span>
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs">
                      <div className="truncate" title={product.name}>
                        {product.name}
                      </div>
                      <div className="text-xs text-slate-500 font-normal">
                        Ships in {product.shipsInDays}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 capitalize text-slate-600">
                      {product.category}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      ₹{product.price.toLocaleString('en-IN')}
                    </td>

                    {/* Status Toggle / Badge */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleSold(product.id)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                          product.sold
                            ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            product.sold ? 'bg-slate-500' : 'bg-emerald-500'
                          }`}
                        />
                        {product.sold ? 'Sold' : 'Available'}
                      </button>
                    </td>

                    {/* Edit & Delete Action Buttons */}
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(product.id, product.name)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
