'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, AlertCircle, Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Incorrect password');
        setIsLoading(false);
        return;
      }

      // Successful login -> Redirect to /admin
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
        {/* Brand & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-700">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Chhapa Staff
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              Admin Portal
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Enter your admin password to manage products and orders.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-sm inline-flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{isLoading ? 'Verifying...' : 'Log In'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <div className="inline-flex items-center space-x-1 text-[11px] text-slate-400">
            <Shield className="w-3 h-3" />
            <span>Protected Admin Area</span>
          </div>
        </div>
      </div>
    </div>
  );
}
