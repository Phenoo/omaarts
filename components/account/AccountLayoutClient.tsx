'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/lib/context/CustomerAuthContext';
import { LayoutDashboard, ShoppingBag, Calendar, Heart, UserCircle, LogOut, Loader2 } from 'lucide-react';

const ACCOUNT_NAV = [
  { label: 'Dashboard', href: '/account', icon: LayoutDashboard },
  { label: 'Orders', href: '/account/orders', icon: ShoppingBag },
  { label: 'Bookings', href: '/account/bookings', icon: Calendar },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
  { label: 'Profile', href: '/account/profile', icon: UserCircle },
];

export default function AccountLayoutClient({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, logout, profile } = useCustomerAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = ['/account/login', '/account/signup', '/account/forgot-password'].includes(pathname);
  if (isAuthPage) return <>{children}</>;
  if (loading) return <main className="site-main account-state"><div role="status" aria-live="polite"><Loader2 size={32} className="animate-spin text-[var(--accent-purple)]" /><p className="mt-4 font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">Checking your session…</p></div></main>;
  if (!isAuthenticated) { router.replace('/account/login'); return <main className="site-main account-state"><p>Redirecting to sign in…</p></main>; }
  return <main className="site-main"><div className="page-shell"><div className="mb-8 border-b border-[var(--border-soft)] pb-6"><p className="eyebrow">My account</p><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><h1>Hello, {profile?.displayName?.split(' ')[0] || 'there'}</h1><button type="button" className="button button--outline" onClick={async () => { await logout(); router.replace('/'); }}><LogOut size={14} /> Sign out</button></div></div><div className="flex flex-col gap-8 lg:flex-row"><aside className="lg:w-56 shrink-0"><nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col" aria-label="Account navigation">{ACCOUNT_NAV.map((item) => { const Icon = item.icon; const isActive = item.href === '/account' ? pathname === '/account' : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm whitespace-nowrap ${isActive ? 'bg-[var(--accent-purple)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--surface-soft)]'}`} aria-current={isActive ? 'page' : undefined}><Icon size={18} />{item.label}</Link>; })}</nav></aside><div className="min-w-0 flex-1">{children}</div></div></div></main>;
}
