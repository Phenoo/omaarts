'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Booking, Order } from '@/lib/types';
import { CheckCircle2, AlertTriangle, Printer, Home, Phone } from 'lucide-react';
import Footer from '@/components/Footer';

interface PageProps {
  searchParams: Promise<{ type?: string; id?: string; reference?: string }>;
}

export default function ConfirmationPage({ searchParams }: PageProps) {
  const params = use(searchParams);
  const type = params.type;
  const id = params.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyAttempts, setVerifyAttempts] = useState(0);
  const isBookingEnquiry = type === 'booking' && booking?.paymentMode === 'ENQUIRY';

  // Poll database to verify paymentStatus changes to PAID (in case webhook is still processing)
  useEffect(() => {
    if (!id || !type) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    
    const checkPayment = async () => {
      try {
        const docRef = doc(db, type === 'booking' ? 'bookings' : 'orders', id);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const data = snap.data();
          if (type === 'booking') {
            setBooking({ id: snap.id, ...data } as Booking);
            if (data.paymentStatus === 'PAID' || data.paymentMode === 'ENQUIRY') {
              setLoading(false);
              return;
            }
          } else {
            setOrder({ id: snap.id, ...data } as Order);
            if (data.paymentStatus === 'PAID') {
              setLoading(false);
              return;
            }
          }
        }
      } catch (e) {
        console.error('Failed to load status:', e);
      }

      // If not paid and attempts < 10, poll again in 2.5 seconds
      if (verifyAttempts < 10 && isMounted) {
        setVerifyAttempts((prev) => prev + 1);
        setTimeout(checkPayment, 2500);
      } else {
        setLoading(false);
      }
    };

    checkPayment();

    return () => {
      isMounted = false;
    };
  }, [id, type, verifyAttempts]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="pt-32 min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center font-mono text-xs uppercase tracking-widest text-[var(--text-muted)] flex flex-col gap-4 items-center">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-purple)] border-t-transparent animate-spin" />
          Verifying your secure payment...
        </div>
      </div>
    );
  }

  // Error: Invalid URL Params
  if (!id || !type || (!booking && !order)) {
    return (
      <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
        <div className="max-w-[90vw] mx-auto pb-24 w-full flex-grow flex items-center justify-center">
          <div className="section-shell p-10 text-center max-w-md bg-white">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={40} />
            <h2 className="font-serif text-2xl mb-2">Invalid Confirmation Link</h2>
            <p className="font-sans text-sm text-[var(--text-muted)] mb-6">
              This receipt link is incomplete. If you completed a payment, please contact the studio to verify your records manually.
            </p>
            <Link href="/" className="px-6 py-2.5 bg-[var(--accent-purple)] text-white rounded-full font-mono text-xs uppercase tracking-widest hover:bg-[var(--accent-orange)] transition-colors">
              Go to Home Page
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Not Verified Paid yet
  const isPaid = type === 'booking' ? booking?.paymentStatus === 'PAID' : order?.paymentStatus === 'PAID';

  if (!isPaid && !isBookingEnquiry) {
    return (
      <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
        <div className="max-w-[90vw] mx-auto pb-24 w-full flex-grow flex items-center justify-center">
          <div className="section-shell p-10 text-center max-w-lg bg-white flex flex-col gap-6 items-center">
            <AlertTriangle className="text-amber-500" size={48} />
            <h2 className="font-serif text-3xl text-[var(--foreground)]">Payment Verification Pending</h2>
            <p className="font-sans text-sm text-[var(--text-muted)] leading-relaxed">
              We received your order, but Paystack payment verification is still processing. 
              If you have been debited, please wait a minute and refresh this page.
            </p>
            <button
              onClick={() => {
                setLoading(true);
                setVerifyAttempts(0);
              }}
              className="px-6 py-3 bg-[var(--accent-purple)] text-white rounded-full font-mono text-xs uppercase tracking-widest hover:bg-[var(--accent-orange)] transition-all cursor-pointer font-bold shadow-sm"
            >
              Refresh Verification Status
            </button>
            <Link href="/contact" className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent-purple)]">
              Contact Studio Support
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between print:pt-0 print:bg-white">
      <div className="max-w-[90vw] md:max-w-2xl mx-auto pb-24 w-full flex-grow">
        
        {/* Printable success card */}
        <div className="section-shell p-6 md:p-10 bg-white shadow-xl border border-[var(--border-soft)] flex flex-col gap-8 print:border-none print:shadow-none">
          
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-4 border-b border-[var(--border-soft)] pb-8">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center shadow-sm">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h1 className="font-serif text-4xl text-[var(--accent-purple)] tracking-tight print:text-black">
                {isBookingEnquiry
                  ? 'Booking Request Received!'
                  : type === 'booking'
                    ? 'Booking Confirmed!'
                    : 'Thank You for Your Purchase!'}
              </h1>
              <p className="font-sans text-sm text-[var(--text-muted)] mt-1">
                {isBookingEnquiry
                  ? 'Your request has been saved and the studio will follow up with pricing or confirmation details.'
                  : 'Your transaction has been verified successfully.'}
              </p>
            </div>
          </div>

          {/* Receipt details */}
          <div className="flex flex-col gap-6">
            <h3 className="font-serif text-xl border-b border-[var(--border-soft)] pb-2 text-[var(--accent-purple)] print:text-black">Receipt Details</h3>
            
            <div className="grid grid-cols-2 gap-y-4 font-mono text-xs">
              <div>
                <span className="block text-[var(--text-muted)]">Reference Number</span>
                <span className="font-semibold text-[var(--foreground)] mt-0.5 block">
                  {type === 'booking' ? booking?.bookingNumber : order?.orderNumber}
                </span>
              </div>
              <div>
                <span className="block text-[var(--text-muted)]">Paystack Reference</span>
                <span className="font-semibold text-gray-500 mt-0.5 block truncate pr-4">
                  {isBookingEnquiry ? 'Not applicable' : type === 'booking' ? booking?.paystackReference : order?.paystackReference}
                </span>
              </div>
              
              {type === 'booking' && booking ? (
                <>
                  <div>
                    <span className="block text-[var(--text-muted)]">Activity</span>
                    <span className="font-serif text-sm font-semibold text-[var(--foreground)] mt-0.5 block">
                      {booking.activitySnapshot.name}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[var(--text-muted)]">Option Selected</span>
                    <span className="font-sans text-xs text-[var(--foreground)] mt-0.5 block">
                      {booking.variant ? booking.variant.name : 'Standard'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[var(--text-muted)]">Date & Time</span>
                    <span className="font-semibold text-[var(--foreground)] mt-0.5 block">
                      {booking.date} @ {booking.startTime}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[var(--text-muted)]">Guests / Size</span>
                    <span className="font-semibold text-[var(--foreground)] mt-0.5 block">
                      {booking.numberOfGuests} {booking.numberOfGuests === 1 ? 'Guest' : 'Guests'}
                    </span>
                  </div>
                </>
              ) : (
                order && (
                  <>
                    <div className="col-span-2">
                      <span className="block text-[var(--text-muted)] mb-2">Artworks Ordered</span>
                      <div className="flex flex-col gap-2 bg-[var(--surface-soft)]/20 p-3 rounded-lg border border-[var(--border-soft)]">
                        {order.items.map((item) => (
                          <div key={item.artworkId} className="flex justify-between items-center text-xs">
                            <span className="font-serif font-semibold">{item.title}</span>
                            <span className="font-semibold">₦{item.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="block text-[var(--text-muted)]">Fulfillment</span>
                      <span className="font-sans text-xs font-semibold text-[var(--foreground)] mt-0.5 block uppercase">
                        {order.deliveryOption === 'delivery' ? 'Shipment Delivery' : 'Pickup at Studio'}
                      </span>
                    </div>
                    {order.deliveryOption === 'delivery' && (
                      <div className="col-span-2 mt-2">
                        <span className="block text-[var(--text-muted)]">Shipping Address</span>
                        <span className="font-sans text-xs text-[var(--foreground)] mt-0.5 block bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          {order.deliveryAddress}
                        </span>
                      </div>
                    )}
                  </>
                )
              )}
            </div>
          </div>

          {/* Customer info & amounts */}
          <div className="flex flex-col gap-5 border-t border-[var(--border-soft)] pt-6 font-mono text-xs">
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <span className="block text-[var(--text-muted)]">Customer Name</span>
                <span className="font-semibold text-[var(--foreground)] mt-0.5 block">
                  {type === 'booking' ? booking?.customerName : order?.customerName}
                </span>
              </div>
              <div>
                <span className="block text-[var(--text-muted)]">Contact Number</span>
                <span className="font-semibold text-[var(--foreground)] mt-0.5 block">
                  {type === 'booking' ? booking?.phone : order?.phone}
                </span>
              </div>
            </div>

            <div className="bg-[var(--surface-soft)]/40 rounded-xl p-4 flex justify-between items-baseline mt-4 border border-[var(--border-soft)] print:bg-white print:border-black">
              <span className="font-serif text-base font-bold text-[var(--foreground)]">
                {isBookingEnquiry ? 'Quoted Amount' : 'Amount Paid'}
              </span>
              <span className="font-mono text-xl font-bold text-[var(--accent-orange)] print:text-black">
                ₦{type === 'booking' ? booking?.total.toLocaleString() : order?.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex flex-col sm:flex-row gap-3 border-t border-[var(--border-soft)] pt-8 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-grow py-3 rounded-full border border-[var(--border-soft)] hover:bg-[var(--surface-soft)] transition-colors flex items-center justify-center gap-1.5 font-mono text-xs uppercase tracking-widest cursor-pointer"
            >
              <Printer size={14} />
              Print Receipt
            </button>
            
            <a
              href="tel:+2348167009545"
              className="flex-grow py-3 rounded-full border border-[var(--border-soft)] hover:bg-[var(--surface-soft)] transition-colors flex items-center justify-center gap-1.5 font-mono text-xs uppercase tracking-widest"
            >
              <Phone size={14} />
              Call Studio
            </a>

            <Link
              href="/"
              className="flex-grow py-3 rounded-full bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-orange)] transition-colors flex items-center justify-center gap-1.5 font-mono text-xs uppercase tracking-widest text-center shadow-sm"
            >
              <Home size={14} />
              Return Home
            </Link>
          </div>

        </div>

      </div>
      <div className="print:hidden">
        <Footer />
      </div>
    </main>
  );
}
export const dynamic = 'force-dynamic';
