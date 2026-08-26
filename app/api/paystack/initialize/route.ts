import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import type { Auth } from 'firebase-admin/auth';
import type { DocumentReference, Firestore } from 'firebase-admin/firestore';
import { getAdminContext } from '@/lib/firebase/admin';
import { markPaymentFailed } from '@/lib/firebase/services/paymentHandler';
import { sendBookingRequestReceivedEmail } from '@/lib/email/resend';
import { calculateActivityPrice } from '@/lib/utils/pricing';
import { validateEmail, validatePhone } from '@/lib/validation';
import { Activity, ActivityVariant, Artwork, Booking, Material, Order } from '@/lib/types';
import { absoluteUrl } from '@/lib/site';
import { removeUndefinedFields } from '@/lib/firebase/sanitize';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DELIVERY_FEE = 3000;
const RESERVATION_MINUTES = 15;

class CheckoutError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function errorResponse(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Internal server error.';
}

function stringValue(value: unknown, field: string, maxLength: number) {
  if (typeof value !== 'string' || value.trim().length === 0 || value.trim().length > maxLength) {
    throw new CheckoutError(`Please provide a valid ${field}.`);
  }
  return value.trim();
}

function optionalString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function checkoutIdValue(value: unknown) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{20,80}$/.test(value)) {
    throw new CheckoutError('This checkout session is invalid. Please try again.', 400);
  }
  return value;
}

function normalizeCustomer(body: Record<string, unknown>) {
  const firstName = stringValue(body.firstName, 'first name', 80);
  const lastName = stringValue(body.lastName, 'last name', 80);
  const email = stringValue(body.email, 'email address', 160).toLowerCase();
  const phone = stringValue(body.phone, 'phone number', 30);
  if (!validateEmail(email)) throw new CheckoutError('Please provide a valid email address.');
  if (!validatePhone(phone)) throw new CheckoutError('Please provide a valid phone number.');
  return { firstName, lastName, email, phone, customerName: `${firstName} ${lastName}`.trim() };
}

async function getAuthenticatedUserId(request: Request, adminAuth: Auth | null) {
  const authorization = request.headers.get('authorization');
  if (!authorization) return undefined;
  const token = authorization.replace(/^Bearer\s+/i, '').trim();
  if (!token || !adminAuth) throw new CheckoutError('Your sign-in session could not be verified. Please sign in again.', 401);
  try {
    return (await adminAuth.verifyIdToken(token)).uid;
  } catch {
    throw new CheckoutError('Your sign-in session has expired. Please sign in again.', 401);
  }
}

function paystackAmount(amountNaira: number) {
  if (!Number.isSafeInteger(amountNaira) || amountNaira < 0) throw new CheckoutError('The payment amount is invalid.', 500);
  return amountNaira * 100;
}

function paystackCallback(type: 'order' | 'booking', id: string) {
  return absoluteUrl(`/checkout/confirmation?type=${type}&id=${encodeURIComponent(id)}`);
}

async function initializePaystack({ secret, email, amount, reference, callbackUrl, metadata }: {
  secret: string;
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, string>;
}) {
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, amount: paystackAmount(amount), currency: 'NGN', reference, callback_url: callbackUrl, metadata }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  const data = await response.json().catch(() => null) as { status?: boolean; message?: string; data?: { authorization_url?: string } } | null;
  if (!response.ok || !data?.status || !data.data?.authorization_url) {
    throw new CheckoutError(data?.message || 'Paystack could not start this payment. Please try again.', 502);
  }
  return data.data.authorization_url;
}

async function updateCheckoutReady(adminDb: Firestore, checkoutRef: DocumentReference, targetRef: DocumentReference, authorizationUrl: string) {
  await adminDb.runTransaction(async (transaction) => {
    const requestSnap = await transaction.get(checkoutRef);
    if (!requestSnap.exists) throw new Error('Checkout session was not found.');
    transaction.update(checkoutRef, { status: 'READY', authorizationUrl, updatedAt: new Date().toISOString() });
    transaction.update(targetRef, { authorizationUrl, updatedAt: new Date().toISOString() });
  });
}

async function markInitializationFailed(adminDb: Firestore, checkoutRef: DocumentReference, targetRef: DocumentReference, type: 'order' | 'booking', id: string, reference: string, reason: string) {
  try {
    await markPaymentFailed({ type, id, reference, reason });
  } catch (error) {
    console.error('Failed to release checkout after Paystack initialization error:', error);
  }
  await adminDb.runTransaction(async (transaction) => {
    const requestSnap = await transaction.get(checkoutRef);
    if (requestSnap.exists) transaction.update(checkoutRef, { status: 'FAILED', failureReason: reason, updatedAt: new Date().toISOString() });
    const targetSnap = await transaction.get(targetRef);
    if (targetSnap.exists && targetSnap.data()?.paymentStatus !== 'PAID') transaction.update(targetRef, { paymentStatus: 'FAILED', updatedAt: new Date().toISOString() });
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const type = body.type;
    if (type !== 'order' && type !== 'booking') return errorResponse('Invalid checkout type.', 400);

    const { adminDb, adminAuth, isConfigured } = getAdminContext();
    if (!isConfigured || !adminDb) return errorResponse('Payment services are temporarily unavailable. Please try again later.', 503);
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) return errorResponse('Payment services are not configured on the server.', 503);

    const checkoutId = checkoutIdValue(body.checkoutId);
    const customer = normalizeCustomer(body);
    const userId = await getAuthenticatedUserId(request, adminAuth);
    const checkoutRef = adminDb.collection('checkoutRequests').doc(`${type}_${checkoutId}`);

    if (type === 'booking') {
      const activityId = stringValue(body.activityId, 'activity', 160);
      const date = stringValue(body.date, 'booking date', 20);
      const startTime = stringValue(body.startTime, 'booking time', 10);
      const numberOfGuests = Number(body.numberOfGuests);
      const durationHours = Number(body.durationHours || 1);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(startTime)) throw new CheckoutError('Please choose a valid date and time.');
      if (!Number.isInteger(numberOfGuests) || numberOfGuests < 1 || numberOfGuests > 100) throw new CheckoutError('Guest count must be between 1 and 100.');
      if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > 12) throw new CheckoutError('Duration is invalid.');
      const blockedDates = await adminDb.collection('blockedDates').where('date', '==', date).get();
      if (!blockedDates.empty) {
        const blocked = blockedDates.docs[0].data();
        if (blocked.isFullClosure || (Array.isArray(blocked.blockedSlots) && blocked.blockedSlots.includes(startTime))) {
          throw new CheckoutError('Selected date or time slot is unavailable.', 409);
        }
      }

      const existingRequest = await checkoutRef.get();
      if (existingRequest.exists) {
        const existing = existingRequest.data() || {};
        if (existing.status === 'READY' && typeof existing.authorizationUrl === 'string') return NextResponse.json({ success: true, bookingId: existing.resourceId, authorizationUrl: existing.authorizationUrl });
        if (existing.status === 'ENQUIRY_READY') return NextResponse.json({ success: true, bookingId: existing.resourceId, requiresPayment: false });
        return errorResponse('This checkout is already being prepared. Please wait a moment and try again.', 409);
      }

      const activityRef = adminDb.collection('activities').doc(activityId);
      const bookingRef = adminDb.collection('bookings').doc();
      const reference = `PSB-${randomUUID().replace(/-/g, '').slice(0, 20).toUpperCase()}`;
      const now = new Date().toISOString();

      const result = await adminDb.runTransaction(async (transaction) => {
        const [activitySnap, requestSnap] = await Promise.all([transaction.get(activityRef), transaction.get(checkoutRef)]);
        if (requestSnap.exists) return { existing: requestSnap.data() || {} };
        if (!activitySnap.exists) throw new CheckoutError('This experience is no longer available.', 404);
        const activity = { id: activitySnap.id, ...activitySnap.data(), variants: Array.isArray(activitySnap.data()?.variants) ? activitySnap.data()?.variants : [] } as Activity;
        if (!activity.active || !activity.bookingEnabled) throw new CheckoutError('This experience is not currently available.', 409);

        const variantId = typeof body.variantId === 'string' && body.variantId !== 'null' ? body.variantId : undefined;
        const variant = activity.variants.find((item: ActivityVariant) => item.id === variantId) || null;
        const enquiryOnly = activity.pricingModel === 'BOOKING_ONLY' || activity.pricingModel === 'CUSTOM_QUOTE';
        if (activity.pricingModel === 'VARIANT' && activity.variants.length > 0 && !variant) throw new CheckoutError('Please select a valid activity option.');
        const price = calculateActivityPrice(activity, variant, numberOfGuests, durationHours);
        if (!Number.isSafeInteger(price.total) || price.total < 0) throw new CheckoutError('This experience has an invalid price configuration.', 500);
        const booking: Booking = {
          id: bookingRef.id,
          bookingNumber: `PSB-${new Date().getFullYear()}-${randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()}`,
          ...(userId ? { userId } : {}),
          customerName: customer.customerName,
          email: customer.email,
          phone: customer.phone,
          activityId,
          activitySnapshot: { name: activity.name, basePrice: activity.basePrice, pricingModel: activity.pricingModel },
          variant,
          date,
          startTime,
          numberOfGuests,
          specialRequests: optionalString(body.specialRequests, 2000),
          bookingNotes: optionalString(body.bookingNotes, 2000),
          subtotal: price.subtotal,
          total: price.total,
          currency: 'NGN',
          paymentMode: enquiryOnly ? 'ENQUIRY' : 'PAYSTACK',
          paymentStatus: enquiryOnly ? 'PENDING' : 'PENDING',
          bookingStatus: 'PENDING',
          paystackReference: enquiryOnly ? '' : reference,
          createdAt: now,
          updatedAt: now,
        };
        transaction.create(bookingRef, removeUndefinedFields(booking));
        transaction.create(checkoutRef, removeUndefinedFields({ id: checkoutId, type, resourceId: bookingRef.id, reference, status: enquiryOnly ? 'ENQUIRY_INITIALIZING' : 'INITIALIZING', createdAt: now, updatedAt: now }));
        return { created: true, booking, bookingId: bookingRef.id, reference, enquiryOnly };
      });

      if ('existing' in result) {
        const existing = result.existing || {};
        if (existing.status === 'READY' && typeof existing.authorizationUrl === 'string') return NextResponse.json({ success: true, bookingId: existing.resourceId, authorizationUrl: existing.authorizationUrl });
        if (existing.status === 'ENQUIRY_READY') return NextResponse.json({ success: true, bookingId: existing.resourceId, requiresPayment: false });
        return errorResponse('This checkout is already being prepared. Please wait a moment and try again.', 409);
      }

      if (result.enquiryOnly) {
        try {
          await sendBookingRequestReceivedEmail(result.booking);
        } catch (error) {
          console.error('Booking enquiry email failed after the request was saved:', error);
        }
        await adminDb.runTransaction(async (transaction) => {
          transaction.update(checkoutRef, { status: 'ENQUIRY_READY', updatedAt: new Date().toISOString() });
        });
        return NextResponse.json({ success: true, bookingId: result.bookingId, requiresPayment: false });
      }

      try {
        const authorizationUrl = await initializePaystack({ secret: paystackSecret, email: customer.email, amount: result.booking.total, reference: result.reference, callbackUrl: paystackCallback('booking', result.bookingId), metadata: { bookingId: result.bookingId, type: 'booking', checkoutId } });
        await updateCheckoutReady(adminDb, checkoutRef, bookingRef, authorizationUrl);
        return NextResponse.json({ success: true, bookingId: result.bookingId, authorizationUrl });
      } catch (error) {
        await markInitializationFailed(adminDb, checkoutRef, bookingRef, 'booking', result.bookingId, result.reference, getErrorMessage(error));
        throw error;
      }
    }

    const deliveryOption = body.deliveryOption;
    if (deliveryOption !== 'pickup' && deliveryOption !== 'delivery') throw new CheckoutError('Please choose a fulfilment option.');
    const deliveryAddress = optionalString(body.deliveryAddress, 1000);
    if (deliveryOption === 'delivery' && deliveryAddress.length < 10) throw new CheckoutError('Please provide a complete delivery address.');
    const rawItems = body.items;
    if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 20) throw new CheckoutError('Your cart is empty or contains too many items.');
    const items = rawItems.map((item) => {
      if (!item || typeof item !== 'object') throw new CheckoutError('Your cart contains an invalid item.');
      const rawItem = item as Record<string, unknown>;
      const productType = rawItem.productType === 'material' ? 'material' : 'artwork';
      const productId = stringValue(rawItem.productId || rawItem.artworkId || rawItem.materialId, productType, 160);
      const quantity = Number((item as Record<string, unknown>).quantity);
      if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100) throw new CheckoutError('Item quantity must be between 1 and 100.');
      if (productType === 'artwork' && quantity !== 1) throw new CheckoutError('Original artworks can only be purchased one at a time.');
      return { productType, productId, quantity };
    });
    if (new Set(items.map((item) => `${item.productType}:${item.productId}`)).size !== items.length) throw new CheckoutError('Your cart contains a duplicate item.');

    const orderRef = adminDb.collection('orders').doc();
    const reference = `PSO-${randomUUID().replace(/-/g, '').slice(0, 20).toUpperCase()}`;
    const now = new Date();
    const reservationExpiresAt = new Date(now.getTime() + RESERVATION_MINUTES * 60 * 1000).toISOString();
    const requestSnap = await checkoutRef.get();
    if (requestSnap.exists) {
      const existing = requestSnap.data() || {};
      if (existing.status === 'READY' && typeof existing.authorizationUrl === 'string') return NextResponse.json({ success: true, orderId: existing.resourceId, authorizationUrl: existing.authorizationUrl });
      return errorResponse('This checkout is already being prepared. Please wait a moment and try again.', 409);
    }

    const productRefs = items.map((item) => adminDb.collection(item.productType === 'material' ? 'materials' : 'artworks').doc(item.productId));
    let createdOrder: Order;
    try {
      createdOrder = await adminDb.runTransaction(async (transaction) => {
        const [requestInTransaction, ...productSnapshots] = await Promise.all([transaction.get(checkoutRef), ...productRefs.map((ref) => transaction.get(ref))]);
        if (requestInTransaction.exists) throw new CheckoutError('This checkout is already being prepared. Please wait a moment and try again.', 409);
        const verifiedItems: Order['items'] = [];
        let subtotal = 0;
        for (let index = 0; index < productSnapshots.length; index += 1) {
          const snapshot = productSnapshots[index];
          const item = items[index];
          const label = item.productType === 'material' ? 'Material' : 'Artwork';
          if (!snapshot.exists) throw new CheckoutError(`${label} ${item.productId} was not found.`, 404);
          const productData = snapshot.data() || {};
          const product = { id: snapshot.id, ...productData } as Artwork | Material;
          if (!Number.isSafeInteger(product.price) || product.price < 0) throw new CheckoutError(`${label} "${product.title || 'Selected item'}" has an invalid price.`, 500);
          if (item.productType === 'material') {
            const material = product as Material;
            if (material.status === 'ARCHIVED' || !material.availableForSale || material.inventoryQty < item.quantity) throw new CheckoutError(`Material "${material.title || 'Selected item'}" is no longer available in the requested quantity.`, 409);
            verifiedItems.push({ productType: 'material', productId: snapshot.id || item.productId, title: material.title || 'Studio Material', price: material.price, quantity: item.quantity });
            subtotal += material.price * item.quantity;
          } else {
            const artwork = product as Artwork;
            const reservationActive = artwork.reservationId && artwork.reservationId !== orderRef.id && typeof artwork.reservationExpiresAt === 'string' && Date.parse(artwork.reservationExpiresAt) > now.getTime();
            const expiredReservation = artwork.status === 'RESERVED' && !reservationActive;
            if ((!expiredReservation && artwork.status !== 'AVAILABLE') || (!expiredReservation && !artwork.availableForSale) || artwork.inventoryQty < 1 || reservationActive) throw new CheckoutError(`Artwork "${artwork.title || 'Selected Artwork'}" is no longer available.`, 409);
            verifiedItems.push({ productType: 'artwork', productId: snapshot.id || item.productId, artworkId: snapshot.id || item.productId, title: artwork.title || 'Original Artwork', price: artwork.price, quantity: 1 });
            subtotal += artwork.price;
            transaction.update(productRefs[index], { status: 'RESERVED', availableForSale: false, reservationId: orderRef.id, reservationExpiresAt, updatedAt: now.toISOString() });
          }
        }
        const deliveryFee = deliveryOption === 'delivery' ? DELIVERY_FEE : 0;
        const order: Order = {
          id: orderRef.id,
          orderNumber: `PSO-${now.getFullYear()}-${randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()}`,
          ...(userId ? { userId } : {}),
          customerName: customer.customerName,
          email: customer.email,
          phone: customer.phone,
          deliveryOption,
          deliveryAddress: deliveryOption === 'delivery' ? deliveryAddress : '',
          orderNotes: optionalString(body.orderNotes, 2000),
          items: verifiedItems,
          subtotal,
          deliveryFee,
          total: subtotal + deliveryFee,
          currency: 'NGN',
          paymentStatus: 'PENDING',
          fulfilmentStatus: 'PENDING',
          paystackReference: reference,
          checkoutId,
          reservationExpiresAt,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };
        transaction.create(orderRef, removeUndefinedFields(order));
        transaction.create(checkoutRef, removeUndefinedFields({ id: checkoutId, type: 'order', resourceId: orderRef.id, reference, status: 'INITIALIZING', createdAt: now.toISOString(), updatedAt: now.toISOString() }));
        return order;
      });
    } catch (error) {
      if (error instanceof CheckoutError) return errorResponse(error.message, error.status);
      throw error;
    }

    try {
      const authorizationUrl = await initializePaystack({ secret: paystackSecret, email: customer.email, amount: createdOrder.total, reference, callbackUrl: paystackCallback('order', createdOrder.id), metadata: { orderId: createdOrder.id, type: 'order', checkoutId } });
      await updateCheckoutReady(adminDb, checkoutRef, orderRef, authorizationUrl);
      return NextResponse.json({ success: true, orderId: createdOrder.id, authorizationUrl, reservationExpiresAt });
    } catch (error) {
      await markInitializationFailed(adminDb, checkoutRef, orderRef, 'order', createdOrder.id, reference, getErrorMessage(error));
      throw error;
    }
  } catch (error: unknown) {
    if (error instanceof CheckoutError) return errorResponse(error.message, error.status);
    console.error('API checkout initialization error:', error);
    return errorResponse('We could not start the payment. Your cart was not charged. Please try again.', 500);
  }
}
