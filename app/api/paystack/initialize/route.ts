import { NextResponse } from 'next/server';
import { adminDb, isConfigured } from '@/lib/firebase/admin';
import { calculateActivityPrice } from '@/lib/utils/pricing';
import { Activity, Artwork } from '@/lib/types';

function errorResponse(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Internal server error.';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    if (!isConfigured) {
      return errorResponse(
        'Firebase Admin credentials are not configured in your project settings. Please configure FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.',
        500
      );
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return errorResponse('Paystack is not configured on the server.', 500);
    }

    const origin = new URL(request.url).origin;

    if (type === 'booking') {
      const {
        firstName,
        lastName,
        email,
        phone,
        activityId,
        variantId,
        date,
        startTime,
        numberOfGuests,
        durationHours,
        specialRequests,
        bookingNotes,
      } = body;

      if (!activityId || !email || !firstName || !lastName || !phone || !date || !startTime) {
        return errorResponse('Missing required booking details.', 400);
      }

      // 1. Fetch activity from DB (trusted source)
      const actDoc = await adminDb.collection('activities').doc(activityId).get();
      if (!actDoc.exists) {
        return errorResponse('Activity not found.', 404);
      }
      const activity = { id: actDoc.id, ...actDoc.data() } as Activity;

      if (!activity.active || !activity.bookingEnabled) {
        return errorResponse('This activity is not currently available for booking.', 400);
      }

      // 2. Validate time slots & date availability (basic checks)
      const blockedDoc = await adminDb.collection('blockedDates')
        .where('date', '==', date)
        .get();
        
      if (!blockedDoc.empty) {
        const block = blockedDoc.docs[0].data();
        if (block.isFullClosure || (block.blockedSlots && block.blockedSlots.includes(startTime))) {
          return errorResponse('Selected date or time slot is unavailable.', 400);
        }
      }

      // 3. Find variant if applicable
      const variant = activity.variants.find((v) => v.id === variantId) || null;
      const isEnquiryOnly = activity.pricingModel === 'BOOKING_ONLY' || activity.pricingModel === 'CUSTOM_QUOTE';

      if (activity.pricingModel === 'VARIANT' && activity.variants.length > 0 && !variant) {
        return errorResponse('Please select a valid activity option before continuing.', 400);
      }

      // 4. Calculate price securely
      const priceResult = calculateActivityPrice(activity, variant, numberOfGuests, durationHours);
      const bookingTotal = priceResult.total;

      // 5. Generate transaction reference
      const reference = `PSB-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      // 6. Write pending booking to Firestore
      const bookingRef = adminDb.collection('bookings').doc();
      const bookingNumber = `PSB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const pendingBooking = {
        id: bookingRef.id,
        bookingNumber,
        customerName: `${firstName} ${lastName}`,
        email,
        phone,
        activityId,
        activitySnapshot: {
          name: activity.name,
          basePrice: activity.basePrice,
          pricingModel: activity.pricingModel,
        },
        variant,
        date,
        startTime,
        numberOfGuests,
        specialRequests: specialRequests || '',
        bookingNotes: bookingNotes || '',
        subtotal: priceResult.subtotal,
        total: bookingTotal,
        currency: 'NGN',
        paymentMode: isEnquiryOnly ? 'ENQUIRY' : 'PAYSTACK',
        paymentStatus: 'PENDING',
        bookingStatus: 'PENDING',
        paystackReference: isEnquiryOnly ? '' : reference,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await bookingRef.set(pendingBooking);

      if (isEnquiryOnly) {
        return NextResponse.json({
          success: true,
          bookingId: bookingRef.id,
          requiresPayment: false,
          message: 'Your booking enquiry has been received.',
        });
      }

      // 7. Request Paystack initialization
      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: bookingTotal * 100, // Paystack amount is in kobo (minor unit)
          reference,
          callback_url: `${origin}/checkout/confirmation?type=booking&id=${bookingRef.id}`,
          metadata: {
            bookingId: bookingRef.id,
            bookingNumber,
            type: 'booking',
          },
        }),
      });

      const paystackData = await paystackRes.json();
      if (!paystackRes.ok || !paystackData.status) {
        return errorResponse(paystackData.message || 'Paystack initialization failed.', 502);
      }

      return NextResponse.json({
        success: true,
        bookingId: bookingRef.id,
        authorizationUrl: paystackData.data.authorization_url,
      });

    } else if (type === 'order') {
      const {
        firstName,
        lastName,
        email,
        phone,
        deliveryOption,
        deliveryAddress,
        orderNotes,
        items, // array of { artworkId, quantity }
      } = body;

      if (!items || items.length === 0) {
        return errorResponse('No items in cart.', 400);
      }

      const verifiedItems = [];
      let subtotal = 0;

      // 1. Transactional check for artwork availability in Firestore
      // Run inside a database batch/read-write lock to verify availability
      for (const item of items) {
        const artworkDoc = await adminDb.collection('artworks').doc(item.artworkId).get();
        if (!artworkDoc.exists) {
          return errorResponse(`Artwork not found: ${item.artworkId}`, 404);
        }
        
        const artwork = artworkDoc.data() as Artwork;
        
        if (artwork.status !== 'AVAILABLE' || !artwork.availableForSale || artwork.inventoryQty < 1) {
          return errorResponse(`Artwork "${artwork.title}" is no longer available.`, 400);
        }

        verifiedItems.push({
          artworkId: item.artworkId,
          title: artwork.title,
          price: artwork.price,
          quantity: 1, // strictly 1-of-1
        });
        subtotal += artwork.price;
      }

      // 2. Add delivery fee
      const defaultDeliveryFee = 3000;
      const deliveryFee = deliveryOption === 'delivery' ? defaultDeliveryFee : 0;
      const grandTotal = subtotal + deliveryFee;

      // 3. Generate reference
      const reference = `PSO-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      // 4. Create pending order document
      const orderRef = adminDb.collection('orders').doc();
      const orderNumber = `PSO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const pendingOrder = {
        id: orderRef.id,
        orderNumber,
        customerName: `${firstName} ${lastName}`,
        email,
        phone,
        deliveryOption,
        deliveryAddress: deliveryOption === 'delivery' ? deliveryAddress : '',
        orderNotes: orderNotes || '',
        items: verifiedItems,
        subtotal,
        deliveryFee,
        total: grandTotal,
        currency: 'NGN',
        paymentStatus: 'PENDING',
        fulfilmentStatus: 'PENDING',
        paystackReference: reference,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await orderRef.set(pendingOrder);

      // 5. Query Paystack
      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: grandTotal * 100,
          reference,
          callback_url: `${origin}/checkout/confirmation?type=order&id=${orderRef.id}`,
          metadata: {
            orderId: orderRef.id,
            orderNumber,
            type: 'order',
          },
        }),
      });

      const paystackData = await paystackRes.json();
      if (!paystackRes.ok || !paystackData.status) {
        return errorResponse(paystackData.message || 'Paystack initialization failed.', 502);
      }

      return NextResponse.json({
        success: true,
        orderId: orderRef.id,
        authorizationUrl: paystackData.data.authorization_url,
      });

    } else {
      return errorResponse('Invalid checkout type.', 400);
    }
  } catch (error: unknown) {
    console.error('API checkout initialization error:', error);
    return errorResponse(getErrorMessage(error), 500);
  }
}
export const dynamic = 'force-dynamic';
