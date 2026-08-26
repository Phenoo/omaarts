'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCustomerAuth } from '@/lib/context/CustomerAuthContext';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ShoppingBag, Loader2, Package } from 'lucide-react';
import Footer from '@/components/Footer';

interface OrderItem {
  productType?: 'artwork' | 'material';
  productId?: string;
  artworkId?: string;
  title: string;
  price: number;
  quantity: number;
}

interface OrderDoc {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryOption: 'pickup' | 'delivery';
  paymentStatus: string;
  fulfilmentStatus: string;
  createdAt: string;
}

export default function OrdersPage() {
  const { user } = useCustomerAuth();
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as OrderDoc)));
      } catch (e) {
        console.error('Error fetching orders:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PREPARING':
      case 'READY_FOR_PICKUP':
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-[var(--accent-purple)]" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl tracking-tight">Order History</h2>
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="section-shell p-12 text-center bg-white/80">
            <div className="w-16 h-16 rounded-full bg-[var(--surface-soft)] flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-[var(--accent-purple)]" />
            </div>
            <h3 className="font-serif text-2xl mb-2">No orders yet</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Browse our art collection and studio materials to place your first order.
            </p>
            <Link
              href="/art"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-xs uppercase tracking-widest transition-all cursor-pointer"
            >
              <ShoppingBag size={14} />
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="section-shell p-6 bg-white/80"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <p className="font-mono text-sm font-semibold">{order.orderNumber}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-mono uppercase px-3 py-1 rounded-full border ${getStatusColor(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-3 py-1 rounded-full border ${getStatusColor(
                        order.fulfilmentStatus
                      )}`}
                    >
                      {order.fulfilmentStatus}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2 border-t border-[var(--border-soft)] pt-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--foreground)]">{item.title} <small className="text-[var(--text-muted)]">× {item.quantity}</small></span>
                      <span className="font-mono text-[var(--text-muted)]">
                        ₦{(item.price * item.quantity)?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="border-t border-[var(--border-soft)] pt-4 mt-4 flex items-center justify-between">
                  <div className="text-xs text-[var(--text-muted)]">
                    <span className="capitalize">{order.deliveryOption}</span>
                    {order.deliveryFee > 0 && (
                      <span> · Delivery: ₦{order.deliveryFee.toLocaleString()}</span>
                    )}
                  </div>
                  <p className="font-mono font-semibold text-lg">
                    ₦{order.total?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12">
        <Footer />
      </div>
    </>
  );
}
