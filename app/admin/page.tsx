'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, ArrowRight, Clock, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getProducts, MockProduct } from '@/lib/products';

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  itemsSummary: string;
  status: string;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [pendingOrders, setPendingOrders] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        // Fetch products
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);

        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!ordersError && ordersData) {
          setTotalOrders(ordersData.length);
          const pending = ordersData.filter((o: { status?: string }) => {
            const s = (o.status || '').toLowerCase();
            return s.includes('pending') || s.includes('awaiting') || s.includes('whatsapp');
          }).length;
          setPendingOrders(pending);

          const formattedRecent: RecentOrder[] = ordersData.slice(0, 3).map((o: Record<string, unknown>) => {
            let itemsSummary = 'Custom Order';
            if (Array.isArray(o.items) && o.items.length > 0) {
              itemsSummary = o.items
                .map((it: { name?: string; productId?: string; size?: string }) =>
                  `${it.name || it.productId || 'Item'}${it.size ? ` (${it.size})` : ''}`
                )
                .join(', ');
            }
            return {
              id: String(o.id || ''),
              orderNumber: `CHP-${String(o.id || '').slice(0, 6).toUpperCase()}`,
              customerName: String(o.customer_name || 'Anonymous'),
              itemsSummary,
              status: String(o.status || 'Pending'),
            };
          });
          setRecentOrders(formattedRecent);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const totalProducts = products.length;
  const availableProducts = products.filter((p) => !p.sold).length;
  const soldProducts = products.filter((p) => p.sold).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Admin Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Store overview, catalog inventory, and incoming order statuses.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Products Card */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Products
              </span>
              <Package className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {loading ? '—' : totalProducts}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {loading ? 'Loading catalog...' : `${availableProducts} available · ${soldProducts} sold`}
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link
              href="/admin/products"
              className="text-xs font-medium text-slate-700 hover:text-slate-900 inline-flex items-center"
            >
              <span>Manage products</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Orders
              </span>
              <ShoppingCart className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {loading ? '—' : totalOrders}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {loading ? 'Loading orders...' : `${totalOrders} orders recorded`}
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-slate-700 hover:text-slate-900 inline-flex items-center"
            >
              <span>View all orders</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

        {/* Pending UPI Verification */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Awaiting Verification
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-amber-900 mt-2">
              {loading ? '—' : pendingOrders}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              UPI payment screenshots on WhatsApp
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-amber-700 hover:text-amber-900 inline-flex items-center"
            >
              <span>Review pending orders</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

        {/* Quick Action: Add Product */}
        <div className="bg-slate-100 p-5 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Quick Action
            </span>
            <h3 className="text-lg font-semibold text-slate-900 mt-1">
              Add One-of-One Piece
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Upload garment photos, craft details, and set availability.
            </p>
          </div>
          <div className="pt-4 mt-4">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center justify-center w-full px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Create Product</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Shortcuts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Products Panel */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Products Catalog</h2>
              <p className="text-xs text-slate-500">
                View inventory statuses, edit details, or delete archival pieces.
              </p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              Open Products →
            </Link>
          </div>
          <div className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <p className="py-4 text-xs text-slate-400">Loading catalog...</p>
            ) : products.length === 0 ? (
              <p className="py-4 text-xs text-slate-500">
                No products in database. Add a product to get started.
              </p>
            ) : (
              products.slice(0, 3).map((product) => (
                <div key={product.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{product.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                        product.sold
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {product.sold ? 'Sold' : 'Available'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Orders Panel */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent Orders</h2>
              <p className="text-xs text-slate-500">
                Incoming UPI orders awaiting WhatsApp verification or fulfillment.
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              Open Orders →
            </Link>
          </div>
          <div className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <p className="py-4 text-xs text-slate-400">Loading recent orders...</p>
            ) : recentOrders.length === 0 ? (
              <p className="py-4 text-xs text-slate-500">
                No orders recorded yet. Real customer orders will appear here.
              </p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">
                      {order.orderNumber} · {order.customerName}
                    </p>
                    <p className="text-xs text-slate-500">{order.itemsSummary}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    {order.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
