'use client';

import React, { useMemo } from 'react';
import { IndianRupee, TrendingUp, ReceiptText, CheckCircle2 } from 'lucide-react';

export interface AnalyticsOrder {
  status?: string;
  total?: number;
  city?: string;
  state?: string;
  created_at?: string;
  items?: unknown;
}

type Stage = 'pending' | 'paid' | 'shipped' | 'delivered';

function stageOf(status: string | undefined): Stage {
  const s = (status || '').toLowerCase();
  if (s.includes('pending') || s.includes('awaiting') || s.includes('whatsapp')) return 'pending';
  if (s.includes('delivered')) return 'delivered';
  if (s.includes('shipped')) return 'shipped';
  if (s.includes('payment') || s.includes('received') || s.includes('paid')) return 'paid';
  return 'pending';
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const DAYS = 14;

export default function StoreAnalytics({ orders }: { orders: AnalyticsOrder[] }) {
  const stats = useMemo(() => {
    const stageCount: Record<Stage, number> = { pending: 0, paid: 0, shipped: 0, delivered: 0 };
    let revenue = 0;
    let paidCount = 0;
    const products = new Map<string, { units: number; revenue: number }>();
    const places = new Map<string, number>();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Array.from({ length: DAYS }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (DAYS - 1 - i));
      return { date: d, orders: 0, revenue: 0 };
    });

    for (const o of orders) {
      const stage = stageOf(o.status);
      stageCount[stage] += 1;
      const total = Number(o.total || 0);
      const isPaid = stage !== 'pending';
      if (isPaid) {
        revenue += total;
        paidCount += 1;
        if (Array.isArray(o.items)) {
          for (const it of o.items as Array<{ name?: string; price?: number; quantity?: number }>) {
            const name = it.name || 'Item';
            const qty = Number(it.quantity || 1);
            const cur = products.get(name) || { units: 0, revenue: 0 };
            cur.units += qty;
            cur.revenue += Number(it.price || 0) * qty;
            products.set(name, cur);
          }
        }
        const place = [o.city, o.state].filter(Boolean).join(', ');
        if (place) places.set(place, (places.get(place) || 0) + 1);
      }
      if (o.created_at) {
        const d = new Date(o.created_at);
        d.setHours(0, 0, 0, 0);
        const bucket = days.find((x) => x.date.getTime() === d.getTime());
        if (bucket) {
          bucket.orders += 1;
          if (isPaid) bucket.revenue += total;
        }
      }
    }

    return {
      stageCount,
      revenue,
      paidCount,
      aov: paidCount ? revenue / paidCount : 0,
      paidRate: orders.length ? (paidCount / orders.length) * 100 : 0,
      days,
      topProducts: Array.from(products.entries()).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5),
      topPlaces: Array.from(places.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5),
    };
  }, [orders]);

  const maxDay = Math.max(1, ...stats.days.map((d) => d.orders));
  const total = orders.length;
  const stageRows: Array<{ key: Stage; label: string; bar: string }> = [
    { key: 'pending', label: 'Awaiting payment', bar: 'bg-amber-400' },
    { key: 'paid', label: 'Payment received', bar: 'bg-blue-500' },
    { key: 'shipped', label: 'Shipped', bar: 'bg-purple-500' },
    { key: 'delivered', label: 'Delivered', bar: 'bg-emerald-500' },
  ];

  const kpis = [
    { label: 'Revenue (paid)', value: inr(stats.revenue), icon: IndianRupee },
    { label: 'Paid orders', value: String(stats.paidCount), icon: CheckCircle2 },
    { label: 'Avg order value', value: inr(stats.aov), icon: ReceiptText },
    { label: 'Payment rate', value: `${stats.paidRate.toFixed(0)}%`, icon: TrendingUp },
  ];

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Store Analytics</h2>
        <p className="text-xs text-slate-500">
          Based on your orders. Revenue counts only orders marked as paid.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
              <Icon className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Orders per day */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Orders · last {DAYS} days</h3>
          <div className="mt-4 flex items-end gap-1.5 h-36">
            {stats.days.map((d) => (
              <div key={d.date.toISOString()} className="flex-1 flex flex-col items-center justify-end h-full group">
                <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100">{d.orders}</span>
                <div
                  className="w-full rounded-t bg-slate-800/80 group-hover:bg-slate-900 transition-colors"
                  style={{ height: `${(d.orders / maxDay) * 100}%`, minHeight: d.orders ? 4 : 2, opacity: d.orders ? 1 : 0.2 }}
                  title={`${d.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: ${d.orders} orders, ${inr(d.revenue)} paid`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-2">
            <span>{stats.days[0].date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            <span>Today</span>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Order status</h3>
          <div className="mt-4 space-y-3">
            {stageRows.map((r) => {
              const n = stats.stageCount[r.key];
              return (
                <div key={r.key}>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{r.label}</span>
                    <span className="font-medium text-slate-900">{n}</span>
                  </div>
                  <div className="h-1.5 rounded bg-slate-100 mt-1">
                    <div className={`h-full rounded ${r.bar}`} style={{ width: `${total ? (n / total) * 100 : 0}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Top products (paid orders)</h3>
          {stats.topProducts.length === 0 ? (
            <p className="text-xs text-slate-500 mt-3">No paid orders yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {stats.topProducts.map(([name, v]) => (
                <li key={name} className="py-2 flex justify-between gap-3">
                  <span className="text-slate-800 truncate">{name}</span>
                  <span className="text-slate-500 text-xs whitespace-nowrap">
                    {v.units} sold · <span className="font-medium text-slate-900">{inr(v.revenue)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Top locations (paid orders)</h3>
          {stats.topPlaces.length === 0 ? (
            <p className="text-xs text-slate-500 mt-3">No paid orders yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {stats.topPlaces.map(([place, n]) => (
                <li key={place} className="py-2 flex justify-between gap-3">
                  <span className="text-slate-800 truncate">{place}</span>
                  <span className="text-xs font-medium text-slate-900">{n} {n === 1 ? 'order' : 'orders'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
