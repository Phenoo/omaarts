import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/firebase/admin';
import { markPaymentFailed, processSuccessfulPayment } from '@/lib/firebase/services/paymentHandler';
import { sendBookingConfirmationEmail, sendOrderConfirmationEmail } from '@/lib/email/resend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function responseError(message: string, status: number) {
  return NextResponse.json({ verified: false, error: message }, { status });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Payment verification failed.';
}

async function sendReceipt(adminDb: NonNullable<ReturnType<typeof getAdminContext>['adminDb']>, type: 'booking' | 'order', id: string) {
  try {
    const snapshot = await adminDb.collection(type === 'booking' ? 'bookings' : 'orders').doc(id).get();
    if (!snapshot.exists) return;
    const data = { id: snapshot.id, ...snapshot.data() };
    if (type === 'booking') await sendBookingConfirmationEmail(data as Parameters<typeof sendBookingConfirmationEmail>[0]);
    else await sendOrderConfirmationEmail(data as Parameters<typeof sendOrderConfirmationEmail>[0]);
  } catch (error) {
    console.error('Payment receipt email failed:', error instanceof Error ? error.name : 'unknown');
  }
}

export async function GET(request: Request) {
  try {
    const { adminDb, isConfigured } = getAdminContext();
    if (!isConfigured || !adminDb) return responseError('Payment services are temporarily unavailable.', 503);

    const searchParams = new URL(request.url).searchParams;
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    const requestedType = searchParams.get('type');
    const requestedId = searchParams.get('id');
    if (!reference || !/^[A-Za-z0-9_-]{8,100}$/.test(reference)) return responseError('Missing or invalid transaction reference.', 400);
    if (requestedType && requestedType !== 'booking' && requestedType !== 'order') return responseError('Invalid payment type.', 400);

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) return responseError('Payment services are not configured on the server.', 503);

    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${paystackSecret}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    const verifyData = await paystackResponse.json().catch(() => null) as { status?: boolean; message?: string; data?: Record<string, unknown> } | null;
    if (!paystackResponse.ok || !verifyData?.status || !verifyData.data) return responseError('Transaction could not be verified with Paystack.', 502);

    const transaction = verifyData.data;
    const metadata = transaction.metadata && typeof transaction.metadata === 'object' ? transaction.metadata as Record<string, unknown> : {};
    const type = metadata.type;
    const id = type === 'booking' ? metadata.bookingId : type === 'order' ? metadata.orderId : undefined;
    if ((type !== 'booking' && type !== 'order') || typeof id !== 'string' || !id) return responseError('Verified transaction is missing checkout details.', 400);
    if (requestedType && requestedType !== type) return responseError('Transaction type does not match this confirmation link.', 400);
    if (requestedId && requestedId !== id) return responseError('Transaction does not match this confirmation link.', 400);
    if (transaction.reference !== reference || transaction.currency !== 'NGN') return responseError('Transaction details could not be matched securely.', 400);

    const amount = Number(transaction.amount) / 100;
    if (!Number.isSafeInteger(amount) || amount < 0) return responseError('Transaction amount is invalid.', 400);

    if (transaction.status !== 'success') {
      const failed = await markPaymentFailed({ type, id, reference, reason: typeof transaction.gateway_response === 'string' ? transaction.gateway_response : `Paystack status: ${String(transaction.status || 'unknown')}` });
      return NextResponse.json({ verified: false, status: transaction.status || 'unknown', result: failed, message: 'Payment was not completed. No additional charge was made.' });
    }

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
    return NextResponse.json({ verified: true, type, id, reference, amount, result });
  } catch (error: unknown) {
    console.error('API verify error:', error instanceof Error ? error.name : 'unknown');
    return responseError(getErrorMessage(error), 500);
  }
}
