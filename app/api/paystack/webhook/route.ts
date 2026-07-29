import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb, isConfigured } from '@/lib/firebase/admin';
import { processSuccessfulPayment } from '@/lib/firebase/services/paymentHandler';
import { sendBookingConfirmationEmail, sendOrderConfirmationEmail } from '@/lib/email/resend';

export async function POST(request: Request) {
  try {
    if (!isConfigured) {
      return NextResponse.json({
        error: 'Firebase Admin credentials are not configured in your .env.local file. Please add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.'
      }, { status: 500 });
    }
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Signature header is missing.' }, { status: 401 });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return NextResponse.json({ error: 'Paystack is not configured on the server.' }, { status: 500 });
    }

    // 1. Verify Paystack Webhook Signature using HMAC SHA512
    const hash = crypto
      .createHmac('sha512', paystackSecret)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Signature verification failed.' }, { status: 401 });
    }

    // 2. Parse event payload
    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === 'charge.success') {
      const tx = payload.data;

      if (tx.status === 'success' && tx.currency === 'NGN') {
        const reference = tx.reference;
        const metadata = tx.metadata || {};
        const type = metadata.type; // 'booking' or 'order'
        const id = type === 'booking' ? metadata.bookingId : metadata.orderId;
        const amountNaira = tx.amount / 100;

        if (type && id) {
          // Process payment updates securely
          const result = await processSuccessfulPayment({
            type,
            id,
            reference,
            amount: amountNaira,
            channel: tx.channel,
            paidAt: tx.paid_at,
          });

          // Dispatch receipt email if first time success
          if (result && (result as any).success) {
            try {
              const docSnap = await adminDb.collection(type === 'booking' ? 'bookings' : 'orders').doc(id).get();
              if (docSnap.exists) {
                const docData = { id: docSnap.id, ...docSnap.data() };
                if (type === 'booking') {
                  await sendBookingConfirmationEmail(docData as any);
                } else {
                  await sendOrderConfirmationEmail(docData as any);
                }
              }
            } catch (emailErr) {
              console.error('Failed to trigger email confirmation in webhook:', emailErr);
            }
          }
        }
      }
    }

    // Always respond with 200 OK to acknowledge receipt of event
    return NextResponse.json({ status: 'success' });

  } catch (error: any) {
    console.error('Webhook execution failed:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
export const preferredRegion = 'auto'; // Next.js specific config
