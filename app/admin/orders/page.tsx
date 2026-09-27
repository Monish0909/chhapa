'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle2 } from 'lucide-react';
import { CHHAPA_WHATSAPP_NUMBER } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

type OrderStatus =
  | 'Pending'
  | 'Awaiting WhatsApp confirmation'
  | 'Payment Received'
  | 'Shipped'
  | 'Delivered';

interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: string;
  total: number;
  date: string;
  status: OrderStatus;
}

const statusStyles: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  Pending: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
  },
  'Awaiting WhatsApp confirmation': {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  'Payment Received': {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  Shipped: {
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
  Delivered: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
};

function normalizeStatus(dbStatus: string | undefined): OrderStatus {
  if (!dbStatus) return 'Awaiting WhatsApp confirmation';
  const lower = dbStatus.toLowerCase();
  if (lower.includes('pending')) return 'Pending';
  if (lower.includes('awaiting') || lower.includes('whatsapp')) return 'Awaiting WhatsApp confirmation';
  if (lower.includes('payment') || lower.includes('received')) return 'Payment Received';
  if (lower.includes('shipped')) return 'Shipped';
  if (lower.includes('delivered')) return 'Delivered';
  return 'Awaiting WhatsApp confirmation';
}

function formatItemsSummary(items: unknown): string {
  if (!items) return 'Custom Order';
  if (typeof items === 'string') return items;
  if (Array.isArray(items)) {
    return items
      .map((it: { name?: string; productId?: string; size?: string; quantity?: number }) =>
        `${it.name || it.productId || 'Item'}${it.size ? ` (${it.size})` : ''}${it.quantity && it.quantity > 1 ? ` x${it.quantity}` : ''}`
      )
      .join(', ');
  }
  return 'Custom Order';
}

export default function AdminOrdersPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch orders warning:', error.message);
      } else if (data && data.length > 0) {
        const mapped: AdminOrder[] = data.map((row: Record<string, unknown>) => ({
          id: String(row.id || ''),
          orderNumber: `CHP-${String(row.id || '').slice(0, 6).toUpperCase()}`,
          customerName: (row.customer_name as string) || 'Anonymous Customer',
          customerPhone: (row.phone as string) || 'N/A',
          items: formatItemsSummary(row.items),
          total: Number(row.total || 0),
          date: row.created_at ? new Date(row.created_at as string).toISOString().split('T')[0] : 'Today',
          status: normalizeStatus(row.status as string),
        }));
        setOrders(mapped);
        return;
      }
    } catch (err) {
      console.warn('Supabase orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchOrders();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        console.warn('Supabase order status update warning:', error.message);
      }
      showNotification(`Order status updated to "${newStatus}".`);
    } catch (err) {
      console.error('Failed to update order status in Supabase:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Orders Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review customer orders, verify manual UPI payments on WhatsApp, and update fulfillment milestones.
        </p>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Manual UPI Notice */}
      <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-amber-900 flex items-start space-x-3">
        <MessageCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Manual UPI Workflow Note</p>
          <p className="text-amber-800 text-xs leading-relaxed">
            Customers pay by scanning the QR code and message their screenshot to WhatsApp ({CHHAPA_WHATSAPP_NUMBER}). Orders with status &quot;Awaiting WhatsApp confirmation&quot; require matching transaction IDs before moving to &quot;Payment Received&quot;.
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!isMounted || loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                    No orders found in the database.
                  </td>
                </tr>
              ) : (
                orders.map((order, idx) => {
                const badge = statusStyles[order.status];
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/80 transition-colors animate-fadeIn"
                    style={{
                      animationDuration: '200ms',
                      animationDelay: `${idx * 20}ms`,
                      animationFillMode: 'both',
                    }}
                  >
                    {/* Order Number */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {order.orderNumber}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{order.customerName}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {order.customerPhone}
                      </div>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4 max-w-xs text-slate-800">
                      <div className="truncate" title={order.items}>
                        {order.items}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      ₹{order.total.toLocaleString('en-IN')}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {order.date}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          className={`text-xs font-medium px-2.5 py-1.5 rounded-md border focus:outline-none focus:ring-1 focus:ring-slate-500 transition-colors cursor-pointer ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Awaiting WhatsApp confirmation">
                            Awaiting WhatsApp confirmation
                          </option>
                          <option value="Payment Received">Payment Received</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
