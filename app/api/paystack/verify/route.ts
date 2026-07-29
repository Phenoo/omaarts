import { NextResponse } from 'next/server';
import { adminDb, isConfigured } from '@/lib/firebase/admin';
import { processSuccessfulPayment } from '@/lib/firebase/services/paymentHandler';
import { sendBookingConfirmationEmail, sendOrderConfirmationEmail } from '@/lib/email/resend';

export async function GET(request: Request) {
  try {
    if (!isConfigured) {
      return NextResponse.json({
        error: 'Firebase Admin credentials are not configured in your .env.local file. Please add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.'
      }, { status: 500 });
    }
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: 'Missing transaction reference query parameter.' }, { status: 400 });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return NextResponse.json({ error: 'Paystack secret key is not configured.' }, { status: 500 });
    }

    // 1. Verify transaction status with Paystack API
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
      },
    });

    const verifyData = await paystackRes.json();
    
    if (!verifyData.status) {
      return NextResponse.json({ error: 'Transaction reference is invalid or could not be verified.' }, { status: 400 });
    }

    const tx = verifyData.data;

    // Confirm success state
    if (tx.status !== 'success') {
      return NextResponse.json({
        verified: false,
        status: tx.status,
        message: 'Payment could not be verified. You have not been charged again.',
      });
    }

    // Extract metadata
    const metadata = tx.metadata || {};
    const type = metadata.type; // 'booking' or 'order'
    const id = type === 'booking' ? metadata.bookingId : metadata.orderId;

    if (!type || !id) {
      return NextResponse.json({ error: 'Transaction is verified but missing required booking/order metadata.' }, { status: 400 });
    }

    // Convert amount back to major unit (Naira)
    const amountNaira = tx.amount / 100;

    // 2. Atomically process the payment updates
    const result = await processSuccessfulPayment({
      type,
      id,
      reference,
      amount: amountNaira,
      channel: tx.channel,
      paidAt: tx.paid_at,
    });

    // 3. Dispatch receipt email if first time success
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
        console.error('Failed to trigger email confirmation after verification:', emailErr);
      }
    }

    return NextResponse.json({
      verified: true,
      type,
      id,
      reference,
      amount: amountNaira,
      result,
    });

  } catch (error: any) {
    console.error('API verify error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
