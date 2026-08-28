'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getBooking, updateBookingStatus } from '@/lib/firebase/services/adminOperations';
import { useAdminAuth } from '@/lib/context/AdminAuthContext';
import { Booking } from '@/lib/types';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { Check, Ban, Clock, Coins, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminBookingManagePage() {
  const { user } = useAdminAuth();
  const params = useParams();
  const id = params?.id as string;
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Edit states
  const [internalNotes, setInternalNotes] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  const loadBooking = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getBooking(id);
      setSelectedBooking(data);
      setInternalNotes(data.bookingNotes || '');
      setRescheduleDate(data.date);
      setRescheduleTime(data.startTime);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const handleUpdateStatus = async (status: Booking['bookingStatus']) => {
    if (!selectedBooking) return;
    const confirmMsg = `Are you sure you want to mark this booking as ${status}?`;
    if (!window.confirm(confirmMsg)) return;
    
    try {
      const adminUid = user?.uid || 'anonymous';
      await updateBookingStatus(
        selectedBooking.id,
        { bookingStatus: status },
        adminUid
      );
      setSelectedBooking({ ...selectedBooking, bookingStatus: status });
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
      alert('Internal notes updated.');
    } catch (e) {
      console.error(e);
      alert('Failed to save notes.');
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    
    if (!window.confirm('Are you sure you want to reschedule this booking to the new date and time?')) {
      return;
    }
    
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
      alert('Booking rescheduled successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to reschedule.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 text-[var(--foreground)] min-h-[50vh] justify-center items-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-purple)] border-t-transparent animate-spin" />
        <span className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">Loading booking...</span>
      </div>
    );
  }

  if (error || !selectedBooking) {
    return (
      <div className="flex flex-col gap-4 text-[var(--foreground)] items-center pt-10">
        <h2 className="font-serif text-2xl">Booking not found</h2>
        <Link href="/admin/bookings" className="text-[var(--accent-purple)] hover:underline font-mono text-sm">
          Return to Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-[var(--foreground)] max-w-4xl mx-auto">
      
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-soft)] pb-6">
        <div>
          <Link href="/admin/bookings" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--accent-purple)] font-mono uppercase tracking-widest transition-colors mb-2">
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold">Booking Manager</h1>
          <p className="font-sans text-sm text-[var(--text-muted)] mt-1 font-mono uppercase tracking-widest">Ref: {selectedBooking.bookingNumber}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl w-full shadow-sm overflow-hidden border border-[var(--border-soft)]">
        <div className="p-6 md:p-8 flex flex-col gap-8 text-sm">
          
          {/* Summary specifications list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 font-mono text-xs bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
              <span className="block text-[var(--text-muted)] uppercase tracking-wider mb-1">Activity name</span>
              <span className="font-serif text-base font-semibold text-[var(--foreground)] block">{selectedBooking.activitySnapshot.name}</span>
            </div>
            <div>
              <span className="block text-[var(--text-muted)] uppercase tracking-wider mb-1">Option Variant</span>
              <span className="font-sans text-sm text-[var(--foreground)] block">{selectedBooking.variant?.name || 'Standard'}</span>
            </div>
            <div>
              <span className="block text-[var(--text-muted)] uppercase tracking-wider mb-1">Client details</span>
              <span className="font-sans text-sm font-semibold text-[var(--foreground)] block">{selectedBooking.customerName}</span>
              <span className="font-sans text-xs text-[var(--text-muted)] block mt-0.5">{selectedBooking.email}</span>
              <span className="font-sans text-xs text-[var(--text-muted)] block mt-0.5">{selectedBooking.phone}</span>
            </div>
            <div>
              <span className="block text-[var(--text-muted)] uppercase tracking-wider mb-1">Date & Time</span>
              <span className="font-bold text-sm text-[var(--foreground)] block">{selectedBooking.date} @ {selectedBooking.startTime}</span>
            </div>
            <div>
              <span className="block text-[var(--text-muted)] uppercase tracking-wider mb-1">Total Seats</span>
              <span className="font-bold text-sm text-[var(--foreground)] block">{selectedBooking.numberOfGuests} pax</span>
            </div>
            <div>
              <span className="block text-[var(--text-muted)] uppercase tracking-wider mb-1">Amount Paid</span>
              <span className="font-bold text-sm text-[var(--accent-orange)] block">₦{selectedBooking.total.toLocaleString()}</span>
              <span className="text-[10px] uppercase font-semibold block mt-1">({selectedBooking.paymentStatus})</span>
            </div>
          </div>

          {/* Special Requests */}
          {selectedBooking.specialRequests && (
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">Client requests</span>
              <p className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl font-sans text-sm italic text-[var(--foreground)]">
                &ldquo;{selectedBooking.specialRequests}&rdquo;
              </p>
            </div>
          )}

          {/* Status Actions */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">Fulfillment Actions</span>
            <div className="flex flex-wrap gap-3">
              {selectedBooking.bookingStatus === 'PENDING' && (
                <button
                  onClick={() => handleUpdateStatus('CONFIRMED')}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-mono text-[11px] uppercase tracking-wider hover:bg-green-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check size={14} />
                  Confirm Booking
                </button>
              )}
              {selectedBooking.bookingStatus !== 'COMPLETED' && selectedBooking.bookingStatus !== 'CANCELLED' && (
                <button
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-mono text-[11px] uppercase tracking-wider hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check size={14} />
                  Mark Completed
                </button>
              )}
              {selectedBooking.bookingStatus !== 'CANCELLED' && (
                <button
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  className="px-5 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl font-mono text-[11px] uppercase tracking-wider hover:bg-red-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <Ban size={14} />
                  Cancel Booking
                </button>
              )}
              {selectedBooking.paymentStatus === 'PENDING' && (
                <button
                  onClick={handleRecordManualPayment}
                  className="px-5 py-2.5 bg-orange-600 text-white rounded-xl font-mono text-[11px] uppercase tracking-wider hover:bg-orange-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Coins size={14} />
                  Record Cash Paid
                </button>
              )}
            </div>
          </div>

          {/* Rescheduling Panel */}
          <div className="border border-[var(--border-soft)] rounded-2xl p-5 flex flex-col gap-4 bg-gray-50/50">
            <button
              type="button"
              onClick={() => setIsRescheduling(!isRescheduling)}
              className="flex justify-between items-center w-full font-mono text-sm uppercase tracking-wider text-[var(--accent-purple)] text-left hover:text-[var(--accent-orange)] transition-colors cursor-pointer font-semibold"
            >
              <span className="flex items-center gap-2">
                <Clock size={16} />
                Reschedule Date / Time slot
              </span>
              <span className="text-xs">{isRescheduling ? 'Hide Form' : 'Show Form'}</span>
            </button>

            {isRescheduling && (
              <form method="post" onSubmit={handleRescheduleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--border-soft)]">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider font-semibold">Date</label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="border border-[var(--border-soft)] bg-white rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[var(--accent-purple)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider font-semibold">Time Slot</label>
                  <input
                    type="time"
                    required
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="border border-[var(--border-soft)] bg-white rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[var(--accent-purple)]"
                  />
                </div>
                <button
                  type="submit"
                  className="md:col-span-2 py-3 bg-gray-800 text-white rounded-xl font-mono text-[11px] uppercase tracking-widest hover:bg-gray-700 transition-colors font-bold mt-2 shadow-sm"
                >
                  Update Schedule & Confirm
                </button>
              </form>
            )}
          </div>

          {/* Internal Notes */}
          <div className="flex flex-col gap-3 border-t border-[var(--border-soft)] pt-8">
            <label className="font-mono text-sm uppercase tracking-wider text-[var(--text-muted)] font-semibold">Internal Notes / Log</label>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="E.g. Rescheduled due to gallery closure. Confirmed offline bank transfer on POS."
              rows={4}
              className="w-full border border-[var(--border-soft)] bg-white rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] resize-none text-sm"
            />
            <button
              type="button"
              onClick={handleSaveNotes}
              className="self-end py-2 px-6 bg-gray-800 text-white rounded-full font-mono text-[11px] uppercase tracking-wider font-bold hover:bg-gray-700 cursor-pointer mt-1 shadow-sm transition-colors"
            >
              Save notes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
