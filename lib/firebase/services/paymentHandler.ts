import { adminDb } from '../admin';
import { Transaction } from 'firebase-admin/firestore';
import { Booking, Order, Sale, InventoryMovement } from '../../types';

export async function processSuccessfulPayment(params: {
  type: 'booking' | 'order';
  id: string;
  reference: string;
  amount: number;
  channel?: string;
  paidAt?: string;
}) {
  const { type, id, reference, amount, channel, paidAt } = params;

  // Run inside Firestore transaction for atomic consistency
  return adminDb.runTransaction(async (transaction: Transaction) => {
    
    // 1. Log Payment document
    const paymentRef = adminDb.collection('payments').doc(reference);
    const paymentDoc = await transaction.get(paymentRef);
    if (paymentDoc.exists) {
      // Payment already processed, exit transaction gracefully
      return { alreadyProcessed: true };
    }

    if (type === 'booking') {
      const bookingRef = adminDb.collection('bookings').doc(id);
      const bookingSnap = await transaction.get(bookingRef);
      if (!bookingSnap.exists) {
        throw new Error(`Booking ${id} not found`);
      }
      
      const booking = bookingSnap.data() as Booking;
      if (booking.paymentStatus === 'PAID') {
        return { alreadyProcessed: true };
      }

      // Update Booking
      transaction.update(bookingRef, {
        paymentStatus: 'PAID',
        bookingStatus: 'CONFIRMED',
        paystackReference: reference,
        updatedAt: new Date().toISOString(),
      });

      // Write Sales Ledger entry
      const saleRef = adminDb.collection('sales').doc();
      const saleDoc: Sale = {
        id: saleRef.id,
        invoiceNumber: booking.bookingNumber,
        type: 'ONLINE',
        category: 'ACTIVITY',
        referenceId: id,
        description: `Booking: ${booking.activitySnapshot.name}${booking.variant ? ` (${booking.variant.name})` : ''} - ${booking.numberOfGuests} guests`,
        quantity: booking.numberOfGuests,
        unitPrice: booking.variant ? booking.variant.price : booking.activitySnapshot.basePrice,
        total: amount, // direct from verified Paystack total
        customer: {
          name: booking.customerName,
          email: booking.email,
          phone: booking.phone,
        },
        paymentMethod: 'PAYSTACK',
        recordedBy: 'SYSTEM',
        date: booking.date,
        createdAt: new Date().toISOString(),
      };
      transaction.set(saleRef, saleDoc);

    } else if (type === 'order') {
      const orderRef = adminDb.collection('orders').doc(id);
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists) {
        throw new Error(`Order ${id} not found`);
      }

      const order = orderSnap.data() as Order;
      if (order.paymentStatus === 'PAID') {
        return { alreadyProcessed: true };
      }

      // Update Order Status
      transaction.update(orderRef, {
        paymentStatus: 'PAID',
        fulfilmentStatus: 'PREPARING',
        paystackReference: reference,
        updatedAt: new Date().toISOString(),
      });

      // Process Artworks: Update status to SOLD and adjust inventory
      for (const item of order.items) {
        const artworkRef = adminDb.collection('artworks').doc(item.artworkId);
        const artworkSnap = await transaction.get(artworkRef);
        
        if (artworkSnap.exists) {
          const artwork = artworkSnap.data();
          // Decrease inventory, set status to SOLD
          transaction.update(artworkRef, {
            status: 'SOLD',
            inventoryQty: 0,
            availableForSale: false,
            updatedAt: new Date().toISOString(),
          });

          // Log inventory movement
          const movementRef = adminDb.collection('inventoryMovements').doc();
          const movementDoc: InventoryMovement = {
            id: movementRef.id,
            artworkId: item.artworkId,
            type: 'OUT',
            quantity: 1,
            reason: 'ONLINE_PURCHASE',
            description: `Sold in Order ${order.orderNumber}`,
            timestamp: new Date().toISOString(),
          };
          transaction.set(movementRef, movementDoc);
        }
      }

      // Write Sales Ledger entry
      const saleRef = adminDb.collection('sales').doc();
      const saleDoc: Sale = {
        id: saleRef.id,
        invoiceNumber: order.orderNumber,
        type: 'ONLINE',
        category: 'ARTWORK',
        referenceId: id,
        description: `Order Purchase: ${order.items.map((i) => i.title).join(', ')}`,
        quantity: order.items.length,
        unitPrice: amount / order.items.length, // Average price for sales audit
        total: amount,
        customer: {
          name: order.customerName,
          email: order.email,
          phone: order.phone,
        },
        paymentMethod: 'PAYSTACK',
        recordedBy: 'SYSTEM',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };
      transaction.set(saleRef, saleDoc);
    }

    // Set Payment entry to log success state
    const newPayment = {
      id: reference,
      reference,
      orderId: type === 'order' ? id : null,
      bookingId: type === 'booking' ? id : null,
      amount,
      currency: 'NGN',
      status: 'success',
      provider: 'paystack',
      channel: channel || 'card',
      paidAt: paidAt || new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    transaction.set(paymentRef, newPayment);

    return { success: true };
  });
}
