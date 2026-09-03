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
  const confirmationToken = searchParams.get('token');
  if ((type !== 'order' && type !== 'booking') || !id || !/^[A-Za-z0-9_-]{1,160}$/.test(id)) return NextResponse.json({ error: 'Invalid confirmation details.' }, { status: 400 });
  if (!reference && !confirmationToken) return NextResponse.json({ error: 'Confirmation proof is required.' }, { status: 401 });
  if (reference && !/^[A-Za-z0-9_-]{8,100}$/.test(reference)) return NextResponse.json({ error: 'Invalid confirmation reference.' }, { status: 400 });
  if (confirmationToken && !/^[A-Za-z0-9_-]{20,80}$/.test(confirmationToken)) return NextResponse.json({ error: 'Invalid confirmation token.' }, { status: 400 });

  const snapshot = await adminDb.collection(type === 'order' ? 'orders' : 'bookings').doc(id).get();
  if (!snapshot.exists) return NextResponse.json({ error: 'Confirmation record not found.' }, { status: 404 });
  const data = snapshot.data() || {};
  if (reference) {
    if (!data.paystackReference || data.paystackReference !== reference) return NextResponse.json({ error: 'Confirmation reference does not match this record.' }, { status: 403 });
  } else if (confirmationToken) {
    const checkout = await adminDb.collection('checkoutRequests').doc(`${type}_${confirmationToken}`).get();
    const checkoutData = checkout.data();
    if (!checkout.exists || checkoutData?.resourceId !== id || checkoutData?.type !== type) {
      return NextResponse.json({ error: 'Confirmation token does not match this record.' }, { status: 403 });
    }
  }

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
