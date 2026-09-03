'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCustomerAuth } from '@/lib/context/CustomerAuthContext';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getWishlist } from '@/lib/firebase/services/wishlist';
import {
  ShoppingBag,
  Calendar,
  Heart,
  ArrowRight,
  Package,
  Clock,
  Loader2,
} from 'lucide-react';

interface DashboardStats {
  orderCount: number;
  bookingCount: number;
  wishlistCount: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  total: number;
  fulfilmentStatus: string;
  createdAt: string;
}

interface RecentBooking {
  id: string;
  bookingNumber: string;
  activitySnapshot: { name: string };
  date: string;
  bookingStatus: string;
}

export default function AccountDashboard() {
  const { user } = useCustomerAuth();
  const [stats, setStats] = useState<DashboardStats>({ orderCount: 0, bookingCount: 0, wishlistCount: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      try {
        // Fetch orders
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const ordersSnap = await getDocs(ordersQuery);
        const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RecentOrder));
        setRecentOrders(orders);

        // Fetch bookings
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const bookingsSnap = await getDocs(bookingsQuery);
        const bookings = bookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RecentBooking));
        setRecentBookings(bookings);

        // Fetch wishlist count
        const wishlistItems = await getWishlist(user.uid);

        // Count totals (using full queries for accurate counts)
        const allOrdersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const allOrdersSnap = await getDocs(allOrdersQuery);

        const allBookingsQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid)
        );
        const allBookingsSnap = await getDocs(allBookingsQuery);

        setStats({
          orderCount: allOrdersSnap.size,
          bookingCount: allBookingsSnap.size,
          wishlistCount: wishlistItems.length,
        });
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'CONFIRMED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-[var(--accent-purple)]" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/account/orders"
            className="section-shell p-6 bg-white/80 hover:bg-[var(--surface-soft)] transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-purple)]/10 flex items-center justify-center text-[var(--accent-purple)]">
                <ShoppingBag size={20} />
              </div>
              <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent-purple)] transition-colors" />
            </div>
            <p className="font-serif text-3xl tracking-tight">{stats.orderCount}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] mt-1">
              Orders
            </p>
          </Link>

          <Link
            href="/account/bookings"
            className="section-shell p-6 bg-white/80 hover:bg-[var(--surface-soft)] transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-orange)]/10 flex items-center justify-center text-[var(--accent-orange)]">
                <Calendar size={20} />
              </div>
              <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] transition-colors" />
            </div>
            <p className="font-serif text-3xl tracking-tight">{stats.bookingCount}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] mt-1">
              Bookings
            </p>
          </Link>

          <Link
            href="/account/wishlist"
            className="section-shell p-6 bg-white/80 hover:bg-[var(--surface-soft)] transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
                <Heart size={20} />
              </div>
              <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-pink-600 transition-colors" />
            </div>
            <p className="font-serif text-3xl tracking-tight">{stats.wishlistCount}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] mt-1">
              Saved Artworks
            </p>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="section-shell p-6 md:p-8 bg-white/80">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl tracking-tight">Recent Orders</h2>
            {stats.orderCount > 0 && (
              <Link
                href="/account/orders"
                className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent-purple)] hover:text-[var(--accent-orange)] transition-colors inline-flex items-center gap-1"
              >
                View All <ArrowRight size={12} />
              </Link>
            )}
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package size={32} className="mx-auto text-[var(--border-soft)] mb-3" />
              <p className="text-sm text-[var(--text-muted)]">No orders yet.</p>
              <Link
                href="/art"
                className="inline-flex items-center gap-1 mt-3 text-sm text-[var(--accent-purple)] hover:text-[var(--accent-orange)] transition-colors"
              >
                Browse the shop <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-soft)] bg-white/60 hover:bg-[var(--surface-soft)] transition-colors"
                >
                  <div>
                    <p className="font-mono text-xs font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full border ${getStatusColor(
                        order.fulfilmentStatus
                      )}`}
                    >
                      {order.fulfilmentStatus}
                    </span>
                    <span className="font-mono text-sm font-medium">
                      ₦{order.total?.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="section-shell p-6 md:p-8 bg-white/80">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl tracking-tight">Recent Bookings</h2>
            {stats.bookingCount > 0 && (
              <Link
                href="/account/bookings"
                className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent-purple)] hover:text-[var(--accent-orange)] transition-colors inline-flex items-center gap-1"
              >
                View All <ArrowRight size={12} />
              </Link>
            )}
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <Clock size={32} className="mx-auto text-[var(--border-soft)] mb-3" />
              <p className="text-sm text-[var(--text-muted)]">No bookings yet.</p>
              <Link
                href="/experiences"
                className="inline-flex items-center gap-1 mt-3 text-sm text-[var(--accent-purple)] hover:text-[var(--accent-orange)] transition-colors"
              >
                Book an experience <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-soft)] bg-white/60 hover:bg-[var(--surface-soft)] transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{booking.activitySnapshot?.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">
                      {booking.bookingNumber} · {formatDate(booking.date)}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full border ${getStatusColor(
                      booking.bookingStatus
                    )}`}
                  >
                    {booking.bookingStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
