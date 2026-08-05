'use client';

import React, { useEffect, useState } from 'react';
import { getBookings, updateBookingStatus } from '@/lib/firebase/services/adminOperations';
import { useAdminAuth } from '@/lib/context/AdminAuthContext';
import { Booking } from '@/lib/types';
import { db } from '@/lib/firebase/config';
import { Calendar, Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AdminBookingsPage() {
  const { user } = useAdminAuth();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'PENDING' | 'PAID' | 'FAILED'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');



  const loadBookings = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getBookings();
      setBookings(data);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);



  // Filter computation
  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = bookings.filter((b) => {
    const matchesSearch = b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || b.bookingStatus === statusFilter;
    const matchesPayment = paymentFilter === 'all' || b.paymentStatus === paymentFilter;

    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = b.date === todayStr;
    } else if (dateFilter === 'upcoming') {
      matchesDate = b.date >= todayStr;
    } else if (dateFilter === 'past') {
      matchesDate = b.date < todayStr;
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  return (
    <div className="flex flex-col gap-8 text-[var(--foreground)]">
      
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold">Bookings Desk</h1>
          <p className="font-sans text-sm text-[var(--text-muted)] mt-1">Audit guest reservations, handle scheduling, and process manual status confirmations.</p>
        </div>
        <button onClick={loadBookings} className="p-2.5 rounded-full border hover:bg-gray-100 cursor-pointer" title="Sync Database">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Toolbar filters */}
      <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center bg-white border border-[var(--border-soft)] p-4 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-grow text-xs font-mono">
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search by client or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-[var(--border-soft)] rounded-xl focus:outline-none focus:border-[var(--accent-purple)] font-sans text-xs"
            />
          </div>

          {/* Booking Status */}
          <div className="flex items-center bg-gray-50 border border-[var(--border-soft)] rounded-xl px-2">
            <span className="text-[10px] text-gray-400 uppercase mr-1">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-transparent py-2 focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">All Bookings</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Payment Status */}
          <div className="flex items-center bg-gray-50 border border-[var(--border-soft)] rounded-xl px-2">
            <span className="text-[10px] text-gray-400 uppercase mr-1">Paid:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="w-full bg-transparent py-2 focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">All Payments</option>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center bg-gray-50 border border-[var(--border-soft)] rounded-xl px-2">
            <span className="text-[10px] text-gray-400 uppercase mr-1">Time:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full bg-transparent py-2 focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">All Time</option>
              <option value="today">Today Only</option>
              <option value="upcoming">Upcoming Dates</option>
              <option value="past">Past Dates</option>
            </select>
          </div>

        </div>
      </div>

      {/* Bookings View */}
      {loading ? (
        <div className="text-center py-12 text-xs font-mono text-[var(--text-muted)] flex flex-col gap-2 items-center">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-purple)] border-t-transparent animate-spin" />
          Querying bookings calendar...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[var(--border-soft)] bg-white rounded-2xl">
          <Calendar className="mx-auto text-gray-300 mb-3" size={32} />
          <h3 className="font-serif text-lg">No bookings matched</h3>
          <p className="font-sans text-sm text-[var(--text-muted)] mt-1">No database documents match the filters selected.</p>
        </div>
      ) : (
        /* List view */
        <div className="bg-white border border-[var(--border-soft)] rounded-2xl shadow-sm overflow-hidden">
          {/* Table view (Responsive) */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm font-sans">
              <thead>
                <tr className="border-b border-[var(--border-soft)] font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] bg-gray-50/50">
                  <th className="p-4 font-semibold">Ref Code</th>
                  <th className="p-4 font-semibold">Guest</th>
                  <th className="p-4 font-semibold">Activity</th>
                  <th className="p-4 font-semibold">Scheduled Date</th>
                  <th className="p-4 font-semibold">Size</th>
                  <th className="p-4 font-semibold">Payment</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 text-right font-semibold">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/40">
                    <td className="p-4 font-mono text-xs font-bold text-[var(--foreground)]">{b.bookingNumber}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{b.customerName}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{b.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-semibold max-w-[150px] truncate" title={b.activitySnapshot.name}>
                      {b.activitySnapshot.name}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col font-mono text-xs text-[var(--foreground)]">
                        <span className="font-bold">{b.date}</span>
                        <span className="text-[10px] text-[var(--text-muted)] mt-0.5">{b.startTime}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs">{b.numberOfGuests} pax</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-semibold
                        ${b.paymentStatus === 'PAID' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}
                      `}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-semibold
                        ${b.bookingStatus === 'CONFIRMED' ? 'bg-green-50 text-green-700 border border-green-200' : 
                          b.bookingStatus === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}
                      `}>
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="inline-block px-3 py-1.5 border border-[var(--border-soft)] hover:border-[var(--accent-purple)] text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-[var(--surface-soft)]/20 transition-all cursor-pointer"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}



    </div>
  );
}
export const dynamic = 'force-dynamic';
