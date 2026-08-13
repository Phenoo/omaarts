'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCustomerAuth } from '@/lib/context/CustomerAuthContext';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Calendar, Loader2, Clock, MapPin, Users } from 'lucide-react';
import Footer from '@/components/Footer';

interface BookingDoc {
  id: string;
  bookingNumber: string;
  activityId: string;
  activitySnapshot: {
    name: string;
    basePrice: number;
    pricingModel: string;
  };
  variant: { name: string; price: number } | null;
  date: string;
  startTime: string;
  numberOfGuests: number;
  total: number;
  paymentStatus: string;
  bookingStatus: string;
  paymentMode?: string;
  createdAt: string;
}

export default function BookingsPage() {
  const { user } = useCustomerAuth();
  const [bookings, setBookings] = useState<BookingDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() } as BookingDoc)));
      } catch (e) {
        console.error('Error fetching bookings:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-NG', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl tracking-tight">My Bookings</h2>
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
            {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="section-shell p-12 text-center bg-white/80">
            <div className="w-16 h-16 rounded-full bg-[var(--surface-soft)] flex items-center justify-center mx-auto mb-4">
              <Clock size={28} className="text-[var(--accent-orange)]" />
            </div>
            <h3 className="font-serif text-2xl mb-2">No bookings yet</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Explore our art experiences and book your first session.
            </p>
            <Link
              href="/experiences"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-xs uppercase tracking-widest transition-all cursor-pointer"
            >
              <Calendar size={14} />
              Book an Experience
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="section-shell p-6 bg-white/80"
              >
                {/* Booking Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-serif text-xl tracking-tight">
                      {booking.activitySnapshot?.name}
                    </h3>
                    <p className="font-mono text-xs text-[var(--text-muted)] mt-0.5">
                      {booking.bookingNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-mono uppercase px-3 py-1 rounded-full border ${getStatusColor(
                        booking.bookingStatus
                      )}`}
                    >
                      {booking.bookingStatus}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-3 py-1 rounded-full border ${getStatusColor(
                        booking.paymentStatus
                      )}`}
                    >
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[var(--border-soft)] pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-[var(--text-muted)]" />
                    <span>{formatDate(booking.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-[var(--text-muted)]" />
                    <span>{booking.startTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users size={14} className="text-[var(--text-muted)]" />
                    <span>{booking.numberOfGuests} guest{booking.numberOfGuests !== 1 ? 's' : ''}</span>
                  </div>
                  {booking.variant && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={14} className="text-[var(--text-muted)]" />
                      <span>{booking.variant.name}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="border-t border-[var(--border-soft)] pt-4 mt-4 flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">
                    {booking.paymentMode === 'ENQUIRY' ? 'Pay at studio' : 'Paid online'}
                  </span>
                  <p className="font-mono font-semibold text-lg">
                    ₦{booking.total?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12">
        <Footer />
      </div>
    </>
  );
}
