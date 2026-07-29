import { db } from '../config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  updateDoc,
  addDoc,
  writeBatch
} from 'firebase/firestore';
import { Booking, Order, Sale, AuditLog } from '../../types';

// ==========================================
// 1. BOOKINGS OPERATIONS
// ==========================================

export async function getBookings(filterStatus?: string): Promise<Booking[]> {
  try {
    const colRef = collection(db, 'bookings');
    let q = query(colRef, orderBy('date', 'desc'), orderBy('startTime', 'desc'));
    
    if (filterStatus && filterStatus !== 'all') {
      q = query(colRef, where('bookingStatus', '==', filterStatus), orderBy('date', 'desc'), orderBy('startTime', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
}

export async function updateBookingStatus(
  id: string,
  updates: { bookingStatus?: Booking['bookingStatus']; paymentStatus?: Booking['paymentStatus']; internalNotes?: string },
  adminUid: string
): Promise<void> {
  try {
    const docRef = doc(db, 'bookings', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error(`Booking ${id} not found`);

    const beforeData = snap.data() as Booking;
    const batch = writeBatch(db);

    batch.update(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    // Write audit log
    const auditRef = doc(collection(db, 'auditLogs'));
    const auditLogDoc: AuditLog = {
      id: auditRef.id,
      adminUid,
      action: 'BOOKING_CANCELLED', // mapped for cancels or updates
      resourceType: 'booking',
      resourceId: id,
      beforeInfo: beforeData as any,
      afterInfo: { ...beforeData, ...updates } as any,
      timestamp: new Date().toISOString()
    };
    batch.set(auditRef, auditLogDoc);

    await batch.commit();
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
}

// ==========================================
// 2. ORDERS OPERATIONS
// ==========================================

export async function getOrders(filterStatus?: string): Promise<Order[]> {
  try {
    const colRef = collection(db, 'orders');
    let q = query(colRef, orderBy('createdAt', 'desc'));
    
    if (filterStatus && filterStatus !== 'all') {
      q = query(colRef, where('fulfilmentStatus', '==', filterStatus), orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

export async function updateOrderStatus(
  id: string,
  updates: { fulfilmentStatus?: Order['fulfilmentStatus']; paymentStatus?: Order['paymentStatus'] },
  adminUid: string
): Promise<void> {
  try {
    const docRef = doc(db, 'orders', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error(`Order ${id} not found`);

    const beforeData = snap.data() as Order;
    const batch = writeBatch(db);

    batch.update(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    // Audit log
    const auditRef = doc(collection(db, 'auditLogs'));
    const auditLogDoc: AuditLog = {
      id: auditRef.id,
      adminUid,
      action: 'ORDER_UPDATED',
      resourceType: 'order',
      resourceId: id,
      beforeInfo: beforeData as any,
      afterInfo: { ...beforeData, ...updates } as any,
      timestamp: new Date().toISOString()
    };
    batch.set(auditRef, auditLogDoc);

    await batch.commit();
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

// ==========================================
// 3. SALES LEDGER & MANUAL ENTRIES
// ==========================================

export async function getSales(): Promise<Sale[]> {
  try {
    const colRef = collection(db, 'sales');
    const q = query(colRef, orderBy('date', 'desc'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Sale[];
  } catch (error) {
    console.error('Error fetching sales ledger:', error);
    throw error;
  }
}

export async function createManualSale(
  data: Omit<Sale, 'id' | 'type' | 'invoiceNumber' | 'createdAt'>,
  adminUid: string
): Promise<string> {
  try {
    const colRef = collection(db, 'sales');
    const invoiceNumber = `PSM-${Date.now().toString().slice(-6)}`;
    
    const saleDoc = {
      ...data,
      type: 'MANUAL' as const,
      invoiceNumber,
      createdAt: new Date().toISOString()
    };

    const batch = writeBatch(db);
    const docRef = doc(colRef);
    batch.set(docRef, saleDoc);

    // Audit log
    const auditRef = doc(collection(db, 'auditLogs'));
    const auditLogDoc: AuditLog = {
      id: auditRef.id,
      adminUid,
      action: 'MANUAL_SALE_CREATED',
      resourceType: 'sale',
      resourceId: docRef.id,
      afterInfo: saleDoc as any,
      timestamp: new Date().toISOString()
    };
    batch.set(auditRef, auditLogDoc);

    await batch.commit();
    return docRef.id;
  } catch (error) {
    console.error('Error creating manual sale:', error);
    throw error;
  }
}

// ==========================================
// 4. CUSTOMERS LEDGER
// ==========================================

export interface CustomerProfile {
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  bookingsCount: number;
  ordersCount: number;
  lastVisit: string;
}

export async function getCustomers(): Promise<CustomerProfile[]> {
  try {
    // Customers profiles are aggregated from bookings + orders histories in Firestore
    const bookingsCol = collection(db, 'bookings');
    const bookingsSnap = await getDocs(bookingsCol);
    const bookings = bookingsSnap.docs.map(d => d.data() as Booking);

    const ordersCol = collection(db, 'orders');
    const ordersSnap = await getDocs(ordersCol);
    const orders = ordersSnap.docs.map(d => d.data() as Order);

    const customersMap: Record<string, CustomerProfile> = {};

    bookings.forEach((b) => {
      const email = b.email.toLowerCase().trim();
      if (!email) return;

      if (!customersMap[email]) {
        customersMap[email] = {
          name: b.customerName,
          email,
          phone: b.phone,
          totalSpent: 0,
          bookingsCount: 0,
          ordersCount: 0,
          lastVisit: b.date,
        };
      }

      if (b.paymentStatus === 'PAID') {
        customersMap[email].totalSpent += b.total;
      }
      customersMap[email].bookingsCount++;
      if (b.date > customersMap[email].lastVisit) {
        customersMap[email].lastVisit = b.date;
      }
    });

    orders.forEach((o) => {
      const email = o.email.toLowerCase().trim();
      if (!email) return;

      if (!customersMap[email]) {
        customersMap[email] = {
          name: o.customerName,
          email,
          phone: o.phone,
          totalSpent: 0,
          bookingsCount: 0,
          ordersCount: 0,
          lastVisit: o.createdAt.split('T')[0],
        };
      }

      if (o.paymentStatus === 'PAID') {
        customersMap[email].totalSpent += o.total;
      }
      customersMap[email].ordersCount++;
      const orderDate = o.createdAt.split('T')[0];
      if (orderDate > customersMap[email].lastVisit) {
        customersMap[email].lastVisit = orderDate;
      }
    });

    return Object.values(customersMap).sort((a, b) => b.totalSpent - a.totalSpent);
  } catch (error) {
    console.error('Error fetching customer profiles:', error);
    throw error;
  }
}
