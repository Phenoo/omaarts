'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/lib/context/AdminAuthContext';
import { 
  LayoutDashboard, 
  Paintbrush, 
  CalendarRange, 
  ShoppingBag, 
  Coins, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Palette
} from 'lucide-react';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { adminProfile, loading, logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Skip layout wrapper on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center font-mono text-xs uppercase tracking-widest text-[var(--text-muted)] flex flex-col gap-4 items-center">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-purple)] border-t-transparent animate-spin" />
          Loading admin session...
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Activities', href: '/admin/activities', icon: Paintbrush },
    { label: 'Artworks', href: '/admin/artworks', icon: Palette },
    { label: 'Bookings', href: '/admin/bookings', icon: CalendarRange },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Sales Ledger', href: '/admin/sales', icon: Coins },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'CMS Content', href: '/admin/content', icon: FileText },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-800">
      
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-[var(--surface-strong)] text-white p-4 flex justify-between items-center shadow-md">
        <div className="relative h-8 w-32 overflow-hidden">
          <Image
            src="/images/oma-logo.jpg"
            alt="Artsy by Oma"
            fill
            className="object-contain scale-[1.3] origin-left"
          />
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar - Desktop and Mobile Drawer */}
      <aside
        className={`bg-[var(--surface-strong)] text-white w-64 flex-shrink-0 flex flex-col justify-between fixed md:sticky top-0 h-screen z-50 transition-transform duration-300 md:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col overflow-y-auto">
          {/* Logo header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <Link href="/" className="relative h-10 w-40 overflow-hidden block">
              <Image
                src="/images/oma-logo.jpg"
                alt="Artsy by Oma"
                fill
                className="object-contain scale-[1.35] origin-left"
              />
            </Link>
            <button className="md:hidden text-white/75 hover:text-white" onClick={() => setMobileOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Logged in admin info */}
          <div className="px-6 py-4 border-b border-white/5 bg-black/15">
            <span className="block text-xs text-white/55 font-mono uppercase">User Role</span>
            <span className="block text-sm font-semibold text-white mt-0.5">{adminProfile?.displayName || 'Studio Staff'}</span>
            <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-semibold bg-[var(--accent-orange)] text-white">
              {adminProfile?.role.replace('_', ' ')}
            </span>
          </div>

          {/* Links list */}
          <nav className="p-4 flex flex-col gap-1 font-sans text-sm">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive 
                      ? 'bg-[var(--accent-purple)] text-white font-semibold shadow-md' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-white/60'} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer controls (logout) */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              logout();
              setMobileOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all font-mono text-xs uppercase tracking-widest cursor-pointer"
          >
            <LogOut size={16} />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Content scrollable panel */}
      <main className="flex-grow p-6 md:p-10 max-w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  );
}
export const dynamic = 'force-dynamic';
