import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/firebase/admin';
import { validateEmail, validatePhone } from '@/lib/validation';
import { sendEnquiryReceivedEmail } from '@/lib/email/resend';

const recentRequests = new Map<string, number[]>();

function rateLimited(key: string) {
  const now = Date.now();
  const recent = (recentRequests.get(key) || []).filter((time) => now - time < 60_000);
  if (recent.length >= 5) return true;
  recent.push(now);
  recentRequests.set(key, recent);
  return false;
}

function text(value: unknown, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) return NextResponse.json({ success: false, error: 'Too many requests. Please try again in a minute.' }, { status: 429 });

  try {
    const body = await request.json();
    if (text(body.website)) return NextResponse.json({ success: true, reference: 'received' });

    const name = text(body.name, 120);
    const email = text(body.email, 160).toLowerCase();
    const phone = text(body.phone, 40);
    const message = text(body.message, 2000);
    if (!name || !validateEmail(email) || (phone && !validatePhone(phone))) {
      return NextResponse.json({ success: false, error: 'Please check your name, email, and phone number.' }, { status: 400 });
    }
    if (!message && body.type !== 'artwork') return NextResponse.json({ success: false, error: 'Please add a short message so we can help.' }, { status: 400 });

    const { adminDb, isConfigured } = getAdminContext();
    if (!isConfigured || !adminDb) return NextResponse.json({ success: false, error: 'Enquiries are temporarily unavailable. Please email support@artsybyoma.com.' }, { status: 503 });

    const ref = `ABO-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const enquiry = {
      reference: ref,
      type: text(body.type, 30) || 'contact',
      name,
      email,
      phone,
      preferredDate: text(body.preferredDate, 20),
      numberOfGuests: Math.max(0, Math.min(500, Number(body.numberOfGuests) || 0)),
      eventType: text(body.eventType, 120),
      preferredActivity: text(body.preferredActivity, 160),
      message,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    await adminDb.collection('enquiries').add(enquiry);
    await sendEnquiryReceivedEmail({ reference: ref, name, email, type: enquiry.type, message });
    return NextResponse.json({ success: true, reference: ref });
  } catch (error) {
    console.error('Enquiry API failed:', error);
    return NextResponse.json({ success: false, error: 'We could not save that enquiry. Please try again or email support@artsybyoma.com.' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
