'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Package, ShoppingCart, LayoutDashboard, ArrowLeft, LogOut, Store } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // On the login page, render children directly without the authenticated header/nav
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // Proceed with redirect regardless
    }
    router.push('/admin/login');
    router.refresh();
  };

  const navLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center md:space-x-8">
            <Link href="/admin" className="flex items-center space-x-2.5">
              <img
                src="/logo.png"
                alt="Chhapa"
                className="w-8 h-8 object-contain"
              />
              <span className="text-lg md:text-xl font-bold tracking-tight text-slate-900">
                Chhapa
              </span>
              <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Admin
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1 sm:space-x-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-3 md:space-x-4">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center space-x-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </Link>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            {/* Log Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out" className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-md border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
              title="Log out from admin panel"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 pb-28 sm:p-6 md:pb-8 lg:p-8">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-slate-200 grid grid-cols-4"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Admin navigation"
      >
        {[...navLinks.map((n) => ({ ...n, external: false })), { name: 'Storefront', href: '/', icon: Store, external: true }].map((item) => {
          const Icon = item.icon;
          const isActive = !item.external && (item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium ${
                isActive ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
