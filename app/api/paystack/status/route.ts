import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { adminDb, isConfigured } = getAdminContext();
  if (!isConfigured || !adminDb) return NextResponse.json({ error: 'Payment services are temporarily unavailable.' }, { status: 503 });

  const searchParams = new URL(request.url).searchParams;
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  const reference = searchParams.get('reference');
  if ((type !== 'order' && type !== 'booking') || !id || !/^[A-Za-z0-9_-]{1,160}$/.test(id)) return NextResponse.json({ error: 'Invalid confirmation details.' }, { status: 400 });

  const snapshot = await adminDb.collection(type === 'order' ? 'orders' : 'bookings').doc(id).get();
  if (!snapshot.exists) return NextResponse.json({ error: 'Confirmation record not found.' }, { status: 404 });
  const data = snapshot.data() || {};
  if (reference && data.paystackReference && data.paystackReference !== reference) return NextResponse.json({ error: 'Confirmation reference does not match this record.' }, { status: 403 });

  if (type === 'booking') {
    return NextResponse.json({
      id: snapshot.id,
      type,
      bookingNumber: data.bookingNumber,
      customerName: data.customerName,
      phone: data.phone,
      activitySnapshot: data.activitySnapshot,
      variant: data.variant || null,
      date: data.date,
      startTime: data.startTime,
      numberOfGuests: data.numberOfGuests,
      total: data.total,
      currency: data.currency,
      paymentMode: data.paymentMode,
      paymentStatus: data.paymentStatus,
      bookingStatus: data.bookingStatus,
      paystackReference: reference && data.paystackReference === reference ? data.paystackReference : undefined,
    }, { headers: { 'Cache-Control': 'no-store' } });
  }

  return NextResponse.json({
    id: snapshot.id,
    type,
    orderNumber: data.orderNumber,
    customerName: data.customerName,
    phone: data.phone,
    items: Array.isArray(data.items) ? data.items : [],
    deliveryOption: data.deliveryOption,
    deliveryAddress: data.deliveryAddress,
    total: data.total,
    currency: data.currency,
    paymentStatus: data.paymentStatus,
    fulfilmentStatus: data.fulfilmentStatus,
    paystackReference: reference && data.paystackReference === reference ? data.paystackReference : undefined,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
