import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/firebase/admin';
import { validateEmail, validatePhone } from '@/lib/validation';
import { sendEnquiryReceivedEmail } from '@/lib/email/resend';

const recentRequests = new Map<string, number[]>();
const ALLOWED_TYPES = new Set(['contact', 'private-event', 'experience-enquiry', 'artwork', 'commission', 'corporate', 'space']);

function rateLimited(key: string) {
  const now = Date.now();
  const recent = (recentRequests.get(key) || []).filter((time) => now - time < 60_000);
  if (recent.length === 0) recentRequests.delete(key);
  if (recent.length >= 5) return true;
  recent.push(now);
  recentRequests.set(key, recent);
  return false;
}

function text(value: unknown, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) return NextResponse.json({ success: false, error: 'Too many requests. Please try again in a minute.' }, { status: 429 });

  try {
    const parsed = await request.json().catch(() => null) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return NextResponse.json({ success: false, error: 'Invalid enquiry.' }, { status: 400 });
    }
    const body = parsed as Record<string, unknown>;
    if (text(body.website)) return NextResponse.json({ success: true, reference: 'received' });

    const type = text(body.type, 30) || 'contact';
    if (!ALLOWED_TYPES.has(type)) return NextResponse.json({ success: false, error: 'Invalid enquiry type.' }, { status: 400 });
    const name = text(body.name, 120);
    const email = text(body.email, 160).toLowerCase();
    const phone = text(body.phone, 40);
    const message = text(body.message, 2000);
    if (!name || !validateEmail(email) || (phone && !validatePhone(phone))) {
      return NextResponse.json({ success: false, error: 'Please check your name, email, and phone number.' }, { status: 400 });
    }
    if (!message && type !== 'artwork') return NextResponse.json({ success: false, error: 'Please add a short message so we can help.' }, { status: 400 });
    const preferredDate = text(body.preferredDate, 20);
    if (preferredDate && !isIsoDate(preferredDate)) return NextResponse.json({ success: false, error: 'Please provide a valid preferred date.' }, { status: 400 });
    const rawGuests = body.numberOfGuests;
    const numberOfGuests = rawGuests === undefined || rawGuests === '' ? 0 : Number(rawGuests);
    if (!Number.isInteger(numberOfGuests) || numberOfGuests < 0 || numberOfGuests > 500) return NextResponse.json({ success: false, error: 'Please provide a valid guest count.' }, { status: 400 });

    const { adminDb, isConfigured } = getAdminContext();
    if (!isConfigured || !adminDb) return NextResponse.json({ success: false, error: 'Enquiries are temporarily unavailable. Please email support@artsybyoma.com.' }, { status: 503 });

    const ref = `ABO-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const enquiry = {
      reference: ref,
      type,
      name,
      email,
      phone,
      preferredDate,
      numberOfGuests,
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
    console.error('Enquiry API failed:', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ success: false, error: 'We could not save that enquiry. Please try again or email support@artsybyoma.com.' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
