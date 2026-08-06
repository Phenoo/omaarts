'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/lib/context/CustomerAuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  Heart,
  UserCircle,
  LogOut,
  Loader2,
} from 'lucide-react';

const ACCOUNT_NAV = [
  { label: 'Dashboard', href: '/account', icon: LayoutDashboard },
  { label: 'Orders', href: '/account/orders', icon: ShoppingBag },
  { label: 'Bookings', href: '/account/bookings', icon: Calendar },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
  { label: 'Profile', href: '/account/profile', icon: UserCircle },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, logout, profile } = useCustomerAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Auth pages don't need the protected layout
  const isAuthPage =
    pathname === '/account/login' ||
    pathname === '/account/signup' ||
    pathname === '/account/forgot-password';

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Loading state
  if (loading) {
    return (
      <main className="pt-32 min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-[var(--accent-purple)]" />
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
            Loading your account...
          </p>
        </div>
      </main>
    );
  }

  // Not authenticated — redirect to login
  if (!isAuthenticated) {
    router.push('/account/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <main className="pt-28 min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-[90vw] mx-auto pb-24 w-full">
        {/* Account Header */}
        <div className="mb-8 border-b border-[var(--border-soft)] pb-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent-orange)] mb-2">
            My Account
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <h1 className="font-serif text-4xl md:text-5xl text-[var(--accent-purple)] tracking-tight">
              Hello, {profile?.displayName?.split(' ')[0] || 'there'}
            </h1>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-soft)] bg-white/70 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-56 shrink-0">
            <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
              {ACCOUNT_NAV.map((item) => {
                const isActive =
                  item.href === '/account'
                    ? pathname === '/account'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
                      ${
                        isActive
                          ? 'bg-[var(--accent-purple)] text-white shadow-md'
                          : 'text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]'
                      }
                    `}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}
