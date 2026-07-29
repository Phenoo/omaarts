'use client';

import React, { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus } from '@/lib/firebase/services/adminOperations';
import { useAdminAuth } from '@/lib/context/AdminAuthContext';
import { Order, FulfilmentStatus, PaymentStatus } from '@/lib/types';
import { Search, ShoppingBag, RefreshCw, FileText, Check, Truck, CheckSquare, Coins, Ban, Plus } from 'lucide-react';

export default function AdminOrdersPage() {
  const { user } = useAdminAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | FulfilmentStatus>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentStatus>('all');

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openDetailModal = (o: Order) => {
    setSelectedOrder(o);
  };

  const handleUpdateStatus = async (status: FulfilmentStatus) => {
    if (!selectedOrder) return;
    try {
      const adminUid = user?.uid || 'anonymous';
      await updateOrderStatus(selectedOrder.id, { fulfilmentStatus: status }, adminUid);
      setSelectedOrder({ ...selectedOrder, fulfilmentStatus: status });
      loadOrders();
    } catch (e) {
      console.error(e);
      alert('Failed to update status.');
    }
  };

  const handleRecordManualPayment = async () => {
    if (!selectedOrder) return;
    if (window.confirm('Confirm offline payment verification? This marks the order as PAID and logs confirmation.')) {
      try {
        const adminUid = user?.uid || 'anonymous';
        await updateOrderStatus(selectedOrder.id, { paymentStatus: 'PAID', fulfilmentStatus: 'PREPARING' }, adminUid);
        setSelectedOrder({ ...selectedOrder, paymentStatus: 'PAID', fulfilmentStatus: 'PREPARING' });
        loadOrders();
      } catch (e) {
        console.error(e);
        alert('Failed to update payment status.');
      }
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    if (window.confirm('Are you sure you want to CANCEL this order? This will mark it as cancelled.')) {
      try {
        const adminUid = user?.uid || 'anonymous';
        await updateOrderStatus(selectedOrder.id, { fulfilmentStatus: 'CANCELLED' }, adminUid);
        setSelectedOrder({ ...selectedOrder, fulfilmentStatus: 'CANCELLED' });
        loadOrders();
      } catch (e) {
        console.error(e);
        alert('Failed to cancel order.');
      }
    }
  };

  // Filter computation
  const filtered = orders.filter((o) => {
    const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items.some((i) => i.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || o.fulfilmentStatus === statusFilter;
    const matchesPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="flex flex-col gap-8 text-[var(--foreground)]">
      
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold">Orders Desk</h1>
          <p className="font-sans text-sm text-[var(--text-muted)] mt-1">Fulfill artwork orders, track deliveries, and verify pending checks.</p>
        </div>
        <button onClick={loadOrders} className="p-2.5 rounded-full border hover:bg-gray-100 cursor-pointer" title="Sync Database">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Toolbar filters */}
      <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center bg-white border border-[var(--border-soft)] p-4 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-grow text-xs font-mono">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search by client or artwork..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-[var(--border-soft)] rounded-xl focus:outline-none focus:border-[var(--accent-purple)] font-sans text-xs"
            />
          </div>

          {/* Fulfillment Status */}
          <div className="flex items-center bg-gray-50 border border-[var(--border-soft)] rounded-xl px-2">
            <span className="text-[10px] text-gray-400 uppercase mr-1">Fulfill:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-transparent py-2 focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">All Orders</option>
              <option value="PENDING">PENDING</option>
              <option value="PREPARING">PREPARING</option>
              <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Payment Status */}
          <div className="flex items-center bg-gray-50 border border-[var(--border-soft)] rounded-xl px-2">
            <span className="text-[10px] text-gray-400 uppercase mr-1">Paid:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="w-full bg-transparent py-2 focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">All Payments</option>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12 text-xs font-mono text-[var(--text-muted)] flex flex-col gap-2 items-center">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-purple)] border-t-transparent animate-spin" />
          Loading store orders...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[var(--border-soft)] bg-white rounded-2xl">
          <ShoppingBag className="mx-auto text-gray-300 mb-3" size={32} />
          <h3 className="font-serif text-lg">No orders matched</h3>
          <p className="font-sans text-sm text-[var(--text-muted)] mt-1">No database documents match the query filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-[var(--border-soft)] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm font-sans">
              <thead>
                <tr className="border-b border-[var(--border-soft)] font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] bg-gray-50/50">
                  <th className="p-4 font-semibold">Order ID</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Items Count</th>
                  <th className="p-4 font-semibold">Total</th>
                  <th className="p-4 font-semibold">Payment</th>
                  <th className="p-4 font-semibold">Fulfillment</th>
                  <th className="p-4 text-right font-semibold">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/40">
                    <td className="p-4 font-mono text-xs font-bold text-[var(--foreground)]">{o.orderNumber}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{o.customerName}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{o.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-mono">{o.items.length} items</td>
                    <td className="p-4 font-mono text-xs font-bold text-[var(--foreground)]">
                      ₦{o.total.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-semibold
                        ${o.paymentStatus === 'PAID' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}
                      `}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-semibold
                        ${o.fulfilmentStatus === 'COMPLETED' ? 'bg-green-50 text-green-700 border border-green-200' : 
                          o.fulfilmentStatus === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          o.fulfilmentStatus === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}
                      `}>
                        {o.fulfilmentStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openDetailModal(o)}
                        className="px-3 py-1.5 border border-[var(--border-soft)] hover:border-[var(--accent-purple)] text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-[var(--surface-soft)]/20 transition-all cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto border border-gray-100">
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-soft)] flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="font-serif text-2xl text-[var(--accent-purple)] font-semibold">Order Details</h2>
                <span className="font-mono text-xs text-[var(--text-muted)] mt-1 block">Ref: {selectedOrder.orderNumber}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-full hover:bg-gray-200 cursor-pointer">
                <Plus className="rotate-45" size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-6 text-sm">
              {/* Customer */}
              <div className="flex flex-col gap-1.5 font-mono text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <span className="block text-[var(--text-muted)]">Customer Name</span>
                  <span className="font-sans text-xs font-semibold text-[var(--foreground)] mt-0.5 block">{selectedOrder.customerName}</span>
                </div>
                <div className="mt-2">
                  <span className="block text-[var(--text-muted)]">Email & Phone</span>
                  <span className="font-sans text-xs text-[var(--foreground)] mt-0.5 block">{selectedOrder.email} • {selectedOrder.phone}</span>
                </div>
                <div className="mt-2">
                  <span className="block text-[var(--text-muted)]">Fulfillment Type</span>
                  <span className="font-sans text-xs font-semibold text-[var(--foreground)] mt-0.5 block uppercase">
                    {selectedOrder.deliveryOption === 'delivery' ? 'Shipment Flat Rate' : 'Pickup at Awka Studio'}
                  </span>
                </div>
                {selectedOrder.deliveryOption === 'delivery' && (
                  <div className="mt-2 border-t border-gray-200 pt-2">
                    <span className="block text-[var(--text-muted)]">Shipping Location Address</span>
                    <span className="font-sans text-xs text-[var(--foreground)] mt-0.5 block italic">{selectedOrder.deliveryAddress}</span>
                  </div>
                )}
              </div>

              {/* Items list */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Artworks Ordered</span>
                <div className="flex flex-col gap-2.5 bg-gray-50/50 border border-gray-100 p-3.5 rounded-xl">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-serif font-bold text-[var(--foreground)]">{item.title}</span>
                        <span className="block text-[10px] text-[var(--text-muted)] font-mono mt-0.5">ID: {item.artworkId}</span>
                      </div>
                      <span className="font-mono font-semibold">₦{item.price.toLocaleString()}</span>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-200 pt-2 mt-1 flex justify-between items-baseline font-mono text-xs">
                    <span className="text-[var(--text-muted)]">Delivery Fee:</span>
                    <span>₦{selectedOrder.deliveryFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline font-mono">
                    <span className="font-serif font-bold">Total paid:</span>
                    <span className="text-sm font-bold text-[var(--accent-orange)]">₦{selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              {selectedOrder.orderNotes && (
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Client notes</span>
                  <p className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl font-sans text-xs italic text-[var(--foreground)]">
                    &ldquo;{selectedOrder.orderNotes}&rdquo;
                  </p>
                </div>
              )}

              {/* Fulfillment Actions */}
              <div className="flex flex-col gap-2 border-t border-[var(--border-soft)] pt-6">
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Fulfillment Status Actions</span>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.fulfilmentStatus === 'PENDING' && selectedOrder.paymentStatus === 'PAID' && (
                    <button
                      onClick={() => handleUpdateStatus('PREPARING')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-mono text-[10px] uppercase tracking-wider hover:bg-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <CheckSquare size={12} />
                      Start Preparing
                    </button>
                  )}
                  {selectedOrder.fulfilmentStatus === 'PREPARING' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.deliveryOption === 'delivery' ? 'SHIPPED' : 'READY_FOR_PICKUP')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl font-mono text-[10px] uppercase tracking-wider hover:bg-purple-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Truck size={12} />
                      {selectedOrder.deliveryOption === 'delivery' ? 'Mark Shipped' : 'Ready for Pickup'}
                    </button>
                  )}
                  {(selectedOrder.fulfilmentStatus === 'SHIPPED' || selectedOrder.fulfilmentStatus === 'READY_FOR_PICKUP') && (
                    <button
                      onClick={() => handleUpdateStatus('COMPLETED')}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl font-mono text-[10px] uppercase tracking-wider hover:bg-green-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={12} />
                      Mark Completed
                    </button>
                  )}
                  {selectedOrder.paymentStatus === 'PENDING' && (
                    <button
                      onClick={handleRecordManualPayment}
                      className="px-4 py-2 bg-orange-600 text-white rounded-xl font-mono text-[10px] uppercase tracking-wider hover:bg-orange-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Coins size={12} />
                      Record manual cash payment
                    </button>
                  )}
                  {selectedOrder.fulfilmentStatus !== 'COMPLETED' && selectedOrder.fulfilmentStatus !== 'CANCELLED' && (
                    <button
                      onClick={handleCancelOrder}
                      className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl font-mono text-[10px] uppercase tracking-wider hover:bg-red-100 flex items-center gap-1 cursor-pointer"
                    >
                      <Ban size={12} />
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export const dynamic = 'force-dynamic';
