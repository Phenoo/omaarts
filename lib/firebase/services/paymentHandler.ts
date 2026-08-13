import { getAdminContext } from '../admin';
import { Transaction } from 'firebase-admin/firestore';
import { Booking, Order, Sale, InventoryMovement } from '../../types';

type PaymentTarget = 'booking' | 'order';

function sameMoney(left: number, right: number) {
  return Number.isSafeInteger(left) && Number.isSafeInteger(right) && left === right;
}

function getTargetCollection(type: PaymentTarget) {
  return type === 'booking' ? 'bookings' : 'orders';
}

export async function processSuccessfulPayment(params: {
  type: PaymentTarget;
  id: string;
  reference: string;
  amount: number;
  currency?: string;
  email?: string;
  channel?: string;
  paidAt?: string;
}) {
  const { type, id, reference, amount, currency = 'NGN', email, channel, paidAt } = params;
  const { adminDb } = getAdminContext();

  if (!adminDb) throw new Error('Firebase Admin database is not available.');
  if (currency !== 'NGN') throw new Error('Unsupported payment currency.');

  return adminDb.runTransaction(async (transaction: Transaction) => {
    const paymentRef = adminDb.collection('payments').doc(reference);
    const targetRef = adminDb.collection(getTargetCollection(type)).doc(id);
    const [paymentDoc, targetDoc] = await Promise.all([
      transaction.get(paymentRef),
      transaction.get(targetRef),
    ]);

    if (paymentDoc.exists) {
      const existing = paymentDoc.data() || {};
      if (existing.status === 'success') return { alreadyProcessed: true };
      throw new Error('This payment reference has already been recorded as failed.');
    }

    if (!targetDoc.exists) throw new Error(`${type === 'order' ? 'Order' : 'Booking'} ${id} not found.`);

    if (type === 'booking') {
      const booking = targetDoc.data() as Booking;
      if (booking.paystackReference !== reference) throw new Error('Payment reference does not match the booking.');
      if (!sameMoney(booking.total, amount)) throw new Error('Payment amount does not match the booking total.');
      if (email && booking.email.toLowerCase() !== email.toLowerCase()) throw new Error('Payment email does not match the booking.');
      if (booking.paymentStatus === 'PAID') return { alreadyProcessed: true };
      if (booking.paymentStatus === 'FAILED') throw new Error('This booking payment is no longer active.');

      transaction.update(targetRef, {
        paymentStatus: 'PAID',
        bookingStatus: 'CONFIRMED',
        updatedAt: new Date().toISOString(),
      });

      const saleRef = adminDb.collection('sales').doc();
      const saleDoc: Sale = {
        id: saleRef.id,
        invoiceNumber: booking.bookingNumber,
        type: 'ONLINE',
        category: 'ACTIVITY',
        referenceId: id,
        description: `Booking: ${booking.activitySnapshot.name}${booking.variant ? ` (${booking.variant.name})` : ''} - ${booking.numberOfGuests} guests`,
        quantity: booking.numberOfGuests,
        unitPrice: booking.numberOfGuests > 0 ? booking.total / booking.numberOfGuests : booking.total,
        total: booking.total,
        customer: { name: booking.customerName, email: booking.email, phone: booking.phone },
        paymentMethod: 'PAYSTACK',
        recordedBy: 'SYSTEM',
        date: booking.date,
        createdAt: new Date().toISOString(),
      };
      transaction.set(saleRef, saleDoc);
    } else {
      const order = targetDoc.data() as Order;
      if (order.paystackReference !== reference) throw new Error('Payment reference does not match the order.');
      if (!sameMoney(order.total, amount)) throw new Error('Payment amount does not match the order total.');
      if (email && order.email.toLowerCase() !== email.toLowerCase()) throw new Error('Payment email does not match the order.');
      if (order.paymentStatus === 'PAID') return { alreadyProcessed: true };
      if (order.paymentStatus === 'FAILED') throw new Error('This order payment is no longer active.');

      const artworkRefs = order.items.map((item) => adminDb.collection('artworks').doc(item.artworkId));
      const artworkSnapshots = await Promise.all(artworkRefs.map((ref) => transaction.get(ref)));
      for (let index = 0; index < order.items.length; index += 1) {
        const artworkSnapshot = artworkSnapshots[index];
        const item = order.items[index];
        if (!artworkSnapshot.exists) throw new Error(`Artwork ${item.artworkId} is no longer available.`);
        const artwork = artworkSnapshot.data() || {};
        // Keep honoring this order after the soft TTL if no other checkout has
        // claimed the artwork. A later reservation overwrites reservationId and
        // is the authoritative signal that the piece has moved on.
        const reservedForOrder = artwork.reservationId === id;
        if (!reservedForOrder) throw new Error(`Artwork "${item.title}" is no longer reserved for this order.`);
      }

      transaction.update(targetRef, {
        paymentStatus: 'PAID',
        fulfilmentStatus: 'PREPARING',
        updatedAt: new Date().toISOString(),
      });

      for (let index = 0; index < order.items.length; index += 1) {
        const artworkRef = artworkRefs[index];
        const item = order.items[index];
        transaction.update(artworkRef, {
          status: 'SOLD',
          inventoryQty: 0,
          availableForSale: false,
          reservationId: null,
          reservationExpiresAt: null,
          updatedAt: new Date().toISOString(),
        });

        const movementRef = adminDb.collection('inventoryMovements').doc();
        const movementDoc: InventoryMovement = {
          id: movementRef.id,
          artworkId: item.artworkId,
          type: 'OUT',
          quantity: item.quantity,
          reason: 'ONLINE_PURCHASE',
          description: `Sold in Order ${order.orderNumber}`,
          timestamp: new Date().toISOString(),
        };
        transaction.set(movementRef, movementDoc);
      }

      const saleRef = adminDb.collection('sales').doc();
      const saleDoc: Sale = {
        id: saleRef.id,
        invoiceNumber: order.orderNumber,
        type: 'ONLINE',
        category: 'ARTWORK',
        referenceId: id,
        description: `Order Purchase: ${order.items.map((item) => item.title).join(', ')}`,
        quantity: order.items.reduce((total, item) => total + item.quantity, 0),
        unitPrice: order.subtotal / Math.max(1, order.items.reduce((total, item) => total + item.quantity, 0)),
        total: order.total,
        customer: { name: order.customerName, email: order.email, phone: order.phone },
        paymentMethod: 'PAYSTACK',
        recordedBy: 'SYSTEM',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };
      transaction.set(saleRef, saleDoc);
    }

    transaction.set(paymentRef, {
      id: reference,
      reference,
      orderId: type === 'order' ? id : null,
      bookingId: type === 'booking' ? id : null,
      amount,
      currency: 'NGN',
      status: 'success',
      provider: 'paystack',
      channel: channel || 'unknown',
      paidAt: paidAt || new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  });
}

export async function markPaymentFailed(params: {
  type: PaymentTarget;
  id: string;
  reference: string;
  reason?: string;
}) {
  const { type, id, reference, reason = 'Payment was not completed.' } = params;
  const { adminDb } = getAdminContext();
  if (!adminDb) throw new Error('Firebase Admin database is not available.');

  return adminDb.runTransaction(async (transaction: Transaction) => {
    const paymentRef = adminDb.collection('payments').doc(reference);
    const targetRef = adminDb.collection(getTargetCollection(type)).doc(id);
    const [paymentDoc, targetDoc] = await Promise.all([
      transaction.get(paymentRef),
      transaction.get(targetRef),
    ]);

    if (paymentDoc.exists && paymentDoc.data()?.status === 'success') return { alreadyProcessed: true };
    if (!targetDoc.exists) throw new Error(`${type === 'order' ? 'Order' : 'Booking'} ${id} not found.`);

    if (type === 'booking') {
      const booking = targetDoc.data() as Booking;
      if (booking.paystackReference !== reference || booking.paymentStatus === 'PAID') return { ignored: true };
      transaction.update(targetRef, { paymentStatus: 'FAILED', bookingStatus: 'CANCELLED', paymentFailureReason: reason, updatedAt: new Date().toISOString() });
    } else {
      const order = targetDoc.data() as Order;
      if (order.paystackReference !== reference || order.paymentStatus === 'PAID') return { ignored: true };
      const artworkRefs = order.items.map((item) => adminDb.collection('artworks').doc(item.artworkId));
      const artworkSnapshots = await Promise.all(artworkRefs.map((ref) => transaction.get(ref)));
      transaction.update(targetRef, { paymentStatus: 'FAILED', fulfilmentStatus: 'CANCELLED', paymentFailureReason: reason, updatedAt: new Date().toISOString() });
      artworkSnapshots.forEach((snapshot, index) => {
        if (!snapshot.exists) return;
        const artwork = snapshot.data() || {};
        if (artwork.reservationId === id) {
          transaction.update(artworkRefs[index], {
            status: 'AVAILABLE',
            inventoryQty: 1,
            availableForSale: true,
            reservationId: null,
            reservationExpiresAt: null,
            updatedAt: new Date().toISOString(),
          });
        }
      });
    }

    transaction.set(paymentRef, {
      id: reference,
      reference,
      orderId: type === 'order' ? id : null,
      bookingId: type === 'booking' ? id : null,
      currency: 'NGN',
      status: 'failed',
      provider: 'paystack',
      failureReason: reason,
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    return { failed: true };
  });
}
