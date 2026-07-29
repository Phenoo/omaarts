'use client';

import React, { useEffect, useState } from 'react';
import { getBookings, updateBookingStatus } from '@/lib/firebase/services/adminOperations';
import { useAdminAuth } from '@/lib/context/AdminAuthContext';
import { Booking } from '@/lib/types';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { Calendar, Search, SlidersHorizontal, RefreshCw, Clipboard, Check, Ban, FileEdit, Clock, Plus, Coins } from 'lucide-react';

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

  // Detail Modal state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [internalNotes, setInternalNotes] = useState('');
  
  // Reschedule state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

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

  const openDetailModal = (b: Booking) => {
    setSelectedBooking(b);
    setInternalNotes(b.bookingNotes || '');
    setRescheduleDate(b.date);
    setRescheduleTime(b.startTime);
    setIsRescheduling(false);
  };

  const handleUpdateStatus = async (status: Booking['bookingStatus']) => {
    if (!selectedBooking) return;
    try {
      const adminUid = user?.uid || 'anonymous';
      await updateBookingStatus(
        selectedBooking.id,
        { bookingStatus: status },
        adminUid
      );
      setSelectedBooking({ ...selectedBooking, bookingStatus: status });
      loadBookings();
    } catch (e) {
      console.error(e);
      alert('Failed to update status.');
    }
  };

  const handleRecordManualPayment = async () => {
    if (!selectedBooking) return;
    if (window.confirm('Confirm offline payment verification? This marks the booking payment as PAID and logs confirmation.')) {
      try {
        const adminUid = user?.uid || 'anonymous';
        await updateBookingStatus(
          selectedBooking.id,
          { paymentStatus: 'PAID', bookingStatus: 'CONFIRMED' },
          adminUid
        );
        setSelectedBooking({ ...selectedBooking, paymentStatus: 'PAID', bookingStatus: 'CONFIRMED' });
        loadBookings();
      } catch (e) {
        console.error(e);
        alert('Failed to update payment status.');
      }
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedBooking) return;
    try {
      const adminUid = user?.uid || 'anonymous';
      await updateBookingStatus(
        selectedBooking.id,
        { internalNotes },
        adminUid
      );
      setSelectedBooking({ ...selectedBooking, bookingNotes: internalNotes });
      loadBookings();
      alert('Internal notes updated.');
    } catch (e) {
      console.error(e);
      alert('Failed to save notes.');
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      const adminUid = user?.uid || 'anonymous';
      await updateBookingStatus(
        selectedBooking.id,
        { 
          bookingStatus: 'CONFIRMED',
          internalNotes: `${internalNotes}\n[Rescheduled from ${selectedBooking.date} @ ${selectedBooking.startTime} by Staff]`
        },
        adminUid
      );
      // Wait, let's make sure date and time are actually updated!
      // In typescript/types, bookings contains `date` and `startTime`. Let's update them:
      await updateBookingStatus(
        selectedBooking.id,
        {
          bookingStatus: 'CONFIRMED',
          internalNotes: `${internalNotes}\n[Rescheduled from ${selectedBooking.date} @ ${selectedBooking.startTime} by Staff]`
        },
        adminUid
      );
      
      const docRef = doc(db, 'bookings', selectedBooking.id);
      await updateDoc(docRef, {
        date: rescheduleDate,
        startTime: rescheduleTime,
        updatedAt: new Date().toISOString()
      });

      setSelectedBooking({
        ...selectedBooking,
        date: rescheduleDate,
        startTime: rescheduleTime,
        bookingStatus: 'CONFIRMED'
      });
      setIsRescheduling(false);
      loadBookings();
      alert('Booking rescheduled successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to reschedule.');
    }
  };



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
                      <button
                        onClick={() => openDetailModal(b)}
                        className="px-3 py-1.5 border border-[var(--border-soft)] hover:border-[var(--accent-purple)] text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-[var(--surface-soft)]/20 transition-all cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL DRAWER */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto border border-gray-100">
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-soft)] flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="font-serif text-2xl text-[var(--accent-purple)] font-semibold">Booking Manager</h2>
                <span className="font-mono text-xs text-[var(--text-muted)] mt-1 block">Ref: {selectedBooking.bookingNumber}</span>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-1 rounded-full hover:bg-gray-200 cursor-pointer">
                <Plus className="rotate-45" size={20} />
              </button>
            </div>

            {/* Content Form */}
            <div className="p-6 overflow-y-auto flex flex-col gap-6 text-sm">
              
              {/* Summary specifications list */}
              <div className="grid grid-cols-2 gap-4 font-mono text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <span className="block text-[var(--text-muted)]">Activity name</span>
                  <span className="font-serif text-sm font-semibold text-[var(--foreground)] mt-0.5 block">{selectedBooking.activitySnapshot.name}</span>
                </div>
                <div>
                  <span className="block text-[var(--text-muted)]">Option Variant</span>
                  <span className="font-sans text-xs text-[var(--foreground)] mt-0.5 block">{selectedBooking.variant?.name || 'Standard'}</span>
                </div>
                <div>
                  <span className="block text-[var(--text-muted)]">Client details</span>
                  <span className="font-sans text-xs font-semibold text-[var(--foreground)] mt-0.5 block">{selectedBooking.customerName}</span>
                  <span className="font-sans text-[10px] text-[var(--text-muted)] block mt-0.5 truncate">{selectedBooking.email} • {selectedBooking.phone}</span>
                </div>
                <div>
                  <span className="block text-[var(--text-muted)]">Date & Time</span>
                  <span className="font-bold text-[var(--foreground)] mt-0.5 block">{selectedBooking.date} @ {selectedBooking.startTime}</span>
                </div>
                <div>
                  <span className="block text-[var(--text-muted)]">Total Seats</span>
                  <span className="font-bold text-[var(--foreground)] mt-0.5 block">{selectedBooking.numberOfGuests} pax</span>
                </div>
                <div>
                  <span className="block text-[var(--text-muted)]">Amount Paid</span>
                  <span className="font-bold text-[var(--accent-orange)] mt-0.5 block">₦{selectedBooking.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Client requests</span>
                  <p className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl font-sans text-xs italic text-[var(--foreground)]">
                    &ldquo;{selectedBooking.specialRequests}&rdquo;
                  </p>
                </div>
              )}

              {/* Status Actions */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Fulfillment Actions</span>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.bookingStatus === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus('CONFIRMED')}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl font-mono text-[10px] uppercase tracking-wider hover:bg-green-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={12} />
                      Confirm Booking
                    </button>
                  )}
                  {selectedBooking.bookingStatus !== 'COMPLETED' && selectedBooking.bookingStatus !== 'CANCELLED' && (
                    <button
                      onClick={() => handleUpdateStatus('COMPLETED')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-mono text-[10px] uppercase tracking-wider hover:bg-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={12} />
                      Mark Completed
                    </button>
                  )}
                  {selectedBooking.bookingStatus !== 'CANCELLED' && (
                    <button
                      onClick={() => handleUpdateStatus('CANCELLED')}
                      className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl font-mono text-[10px] uppercase tracking-wider hover:bg-red-100 flex items-center gap-1 cursor-pointer"
                    >
                      <Ban size={12} />
                      Cancel Booking
                    </button>
                  )}
                  {selectedBooking.paymentStatus === 'PENDING' && (
                    <button
                      onClick={handleRecordManualPayment}
                      className="px-4 py-2 bg-orange-600 text-white rounded-xl font-mono text-[10px] uppercase tracking-wider hover:bg-orange-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Coins size={12} />
                      Record Cash Paid
                    </button>
                  )}
                </div>
              </div>

              {/* Rescheduling Panel */}
              <div className="border border-[var(--border-soft)] rounded-2xl p-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setIsRescheduling(!isRescheduling)}
                  className="flex justify-between items-center w-full font-mono text-xs uppercase tracking-wider text-[var(--accent-purple)] text-left hover:text-[var(--accent-orange)] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    Reschedule Date / Time slot
                  </span>
                  <span>{isRescheduling ? 'Hide Form' : 'Show Form'}</span>
                </button>

                {isRescheduling && (
                  <form onSubmit={handleRescheduleSubmit} className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border-soft)]">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Date</label>
                      <input
                        type="date"
                        required
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="border border-[var(--border-soft)] rounded-xl py-1.5 px-3 text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Time Slot</label>
                      <input
                        type="time"
                        required
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className="border border-[var(--border-soft)] rounded-xl py-1.5 px-3 text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="col-span-2 py-2 bg-gray-800 text-white rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-gray-700 transition-colors font-bold mt-2"
                    >
                      Update Schedule & Confirm
                    </button>
                  </form>
                )}
              </div>

              {/* Internal Notes */}
              <div className="flex flex-col gap-2 border-t border-[var(--border-soft)] pt-6">
                <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Internal Notes / Log</label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="E.g. Rescheduled due to gallery closure. Confirmed offline bank transfer on POS."
                  rows={3}
                  className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] resize-none"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="self-end py-1.5 px-4 bg-gray-800 text-white rounded-full font-mono text-[10px] uppercase tracking-wider font-semibold hover:bg-gray-700 cursor-pointer mt-1"
                >
                  Save notes
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export const dynamic = 'force-dynamic';
