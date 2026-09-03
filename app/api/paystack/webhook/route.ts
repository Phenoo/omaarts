import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminContext } from '@/lib/firebase/admin';
import { markPaymentFailed, processSuccessfulPayment } from '@/lib/firebase/services/paymentHandler';
import { sendBookingConfirmationEmail, sendOrderConfirmationEmail } from '@/lib/email/resend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Internal server error.';
}

function validSignature(rawBody: string, signature: string, secret: string) {
  const expected = crypto.createHmac('sha512', secret).update(rawBody).digest();
  const received = Buffer.from(signature, 'hex');
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

async function sendReceipt(adminDb: NonNullable<ReturnType<typeof getAdminContext>['adminDb']>, type: 'booking' | 'order', id: string) {
  try {
    const snapshot = await adminDb.collection(type === 'booking' ? 'bookings' : 'orders').doc(id).get();
    if (!snapshot.exists) return;
    const data = { id: snapshot.id, ...snapshot.data() };
    if (type === 'booking') await sendBookingConfirmationEmail(data as Parameters<typeof sendBookingConfirmationEmail>[0]);
    else await sendOrderConfirmationEmail(data as Parameters<typeof sendOrderConfirmationEmail>[0]);
  } catch (error) {
    console.error('Webhook receipt email failed:', error instanceof Error ? error.name : 'unknown');
  }
}

export async function POST(request: Request) {
  try {
    const { adminDb, isConfigured } = getAdminContext();
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!isConfigured || !adminDb || !secret) return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 503 });

    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature') || '';
    if (!signature || !validSignature(rawBody, signature, secret)) return NextResponse.json({ error: 'Signature verification failed.' }, { status: 401 });

    let payload: { event?: unknown; data?: Record<string, unknown> };
    try {
      payload = JSON.parse(rawBody) as { event?: unknown; data?: Record<string, unknown> };
    } catch {
      return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
    }

    const event = payload.event;
    const transaction = payload.data || {};
    const metadata = transaction.metadata && typeof transaction.metadata === 'object' ? transaction.metadata as Record<string, unknown> : {};
    const type = metadata.type === 'booking' || metadata.type === 'order' ? metadata.type : undefined;
    const id = type === 'booking' ? metadata.bookingId : type === 'order' ? metadata.orderId : undefined;
    const reference = typeof transaction.reference === 'string' ? transaction.reference : '';

    if (!type || typeof id !== 'string' || !id || !reference) return NextResponse.json({ status: 'ignored' });
    if (transaction.currency !== 'NGN') return NextResponse.json({ status: 'ignored' });

    if (event === 'charge.success' && transaction.status === 'success') {
      const amount = Number(transaction.amount) / 100;
      const result = await processSuccessfulPayment({
        type,
        id,
        reference,
        amount,
        currency: 'NGN',
        email: transaction.customer && typeof transaction.customer === 'object' && typeof (transaction.customer as Record<string, unknown>).email === 'string' ? (transaction.customer as Record<string, unknown>).email as string : undefined,
        channel: typeof transaction.channel === 'string' ? transaction.channel : undefined,
        paidAt: typeof transaction.paid_at === 'string' ? transaction.paid_at : undefined,
      });
      if (result && 'success' in result && result.success) await sendReceipt(adminDb, type, id);
    } else if (event === 'charge.failed') {
      await markPaymentFailed({ type, id, reference, reason: typeof transaction.gateway_response === 'string' ? transaction.gateway_response : `Paystack event: ${String(event)}` });
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: unknown) {
    console.error('Webhook execution failed:', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
