'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getSales, createManualSale } from '@/lib/firebase/services/adminOperations';
import { useAdminAuth } from '@/lib/context/AdminAuthContext';
import { Sale } from '@/lib/types';
import { Coins, Plus, Download, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AdminSalesPage() {
  const { user, loading: authLoading } = useAdminAuth();

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Manual Sale Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<'ARTWORK' | 'ACTIVITY'>('ACTIVITY');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'POS' | 'TRANSFER'>('CASH');
  
  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // UI States
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const loadSales = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getSales();
      setSales(data);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      loadSales();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user, loadSales]);

  const handleExportCSV = () => {
    if (sales.length === 0) return;
    
    // Construct CSV Header
    let csvContent = "Invoice,Date,Category,Customer,Total (NGN),Method,Recorded By,Description\n";
    
    // Map rows
    sales.forEach((s) => {
      const customer = s.customer?.name || "Walk-in";
      const desc = s.description.replace(/"/g, '""'); // escape double quotes
      csvContent += `"${s.invoiceNumber}","${s.date}","${s.category}","${customer}",${s.total},"${s.paymentMethod}","${s.recordedBy}","${desc}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `abo_sales_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateManualSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!description.trim() || unitPrice <= 0 || quantity <= 0) {
      setSubmitError('Please enter description, quantity, and unit price.');
      return;
    }

    try {
      const adminUid = user?.uid || 'anonymous';
      const grandTotal = unitPrice * quantity;
      
      await createManualSale({
        category,
        description: description.trim(),
        quantity,
        unitPrice,
        total: grandTotal,
        paymentMethod,
        recordedBy: user?.email || 'STAFF',
        date: new Date().toISOString().split('T')[0],
        customer: customerName.trim() ? {
          name: customerName.trim(),
          email: customerEmail.trim() || undefined,
          phone: customerPhone.trim() || undefined
        } : undefined
      }, adminUid);

      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        loadSales();
      }, 1500);

      // Reset fields
      setDescription('');
      setQuantity(1);
      setUnitPrice(0);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
    } catch (err: unknown) {
      console.error(err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to log manual sale.');
    }
  };

  return (
    <div className="flex flex-col gap-8 text-[var(--foreground)]">
      
      {/* Top controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold">Sales Ledger</h1>
          <p className="font-sans text-sm text-[var(--text-muted)] mt-1">Audit transactions, record manual cash sales, and download CSV spreadsheet reports.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={sales.length === 0}
            className="px-5 py-3 rounded-full border border-[var(--border-soft)] hover:bg-gray-50 font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2 cursor-pointer bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Export CSV
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-full bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-orange)] transition-colors font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus size={16} />
            Log POS/Cash Sale
          </button>
        </div>
      </div>

      {/* Ledger list */}
      {loading ? (
        <div className="text-center py-12 text-xs font-mono text-[var(--text-muted)] flex flex-col gap-2 items-center">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-purple)] border-t-transparent animate-spin" />
          Querying transaction books...
        </div>
      ) : error ? (
        <div className="text-center py-12 border border-red-100 rounded-2xl bg-white max-w-sm mx-auto flex flex-col gap-4 items-center">
          <p className="text-red-500 font-mono text-xs">Failed to connect to database.</p>
          <button onClick={loadSales} className="px-5 py-2 bg-[var(--accent-purple)] text-white rounded-full font-mono text-xs uppercase hover:bg-[var(--accent-orange)] transition-colors flex items-center gap-1.5 cursor-pointer">
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[var(--border-soft)] bg-white rounded-2xl">
          <Coins className="mx-auto text-gray-300 mb-3" size={32} />
          <h3 className="font-serif text-lg">No sales documented</h3>
          <p className="font-sans text-sm text-[var(--text-muted)] mt-1">Transaction database accounts are empty.</p>
        </div>
      ) : (
        <div className="bg-white border border-[var(--border-soft)] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm font-sans">
              <thead>
                <tr className="border-b border-[var(--border-soft)] font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] bg-gray-50/50">
                  <th className="p-4 font-semibold">Invoice ID</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Client Name</th>
                  <th className="p-4 font-semibold">Total Price</th>
                  <th className="p-4 font-semibold">Pay Method</th>
                  <th className="p-4 font-semibold">Description</th>
                  <th className="p-4 text-right font-semibold">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/40">
                    <td className="p-4 font-mono text-xs font-bold text-[var(--foreground)]">{sale.invoiceNumber}</td>
                    <td className="p-4 font-mono text-xs">{sale.date}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-semibold
                        ${sale.category === 'ARTWORK' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}
                      `}>
                        {sale.category}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-semibold">{sale.customer?.name || 'Walk-in'}</td>
                    <td className="p-4 font-mono text-xs font-bold text-[var(--foreground)]">
                      ₦{sale.total.toLocaleString()}
                    </td>
                    <td className="p-4 font-mono text-[10px] text-gray-500 font-semibold">{sale.paymentMethod}</td>
                    <td className="p-4 text-xs truncate max-w-[200px]" title={sale.description}>{sale.description}</td>
                    <td className="p-4 text-right font-mono text-[10px] text-[var(--text-muted)]">{sale.recordedBy.split('@')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MANUAL TRANSACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto border border-gray-100">
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-soft)] flex justify-between items-center bg-gray-50">
              <h2 className="font-serif text-2xl text-[var(--accent-purple)] font-semibold">Log Offline Transaction</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-200 cursor-pointer">
                <Plus className="rotate-45" size={20} />
              </button>
            </div>

            {/* Content Form */}
            <form onSubmit={handleCreateManualSale} className="p-6 overflow-y-auto flex flex-col gap-6 text-sm text-[var(--foreground)]">
              {success ? (
                <div className="py-8 text-center flex flex-col items-center gap-4 text-green-600 font-serif">
                  <CheckCircle2 size={40} className="text-green-500" />
                  <span className="text-xl">Transaction Documented!</span>
                </div>
              ) : (
                <>
                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-mono">
                      {submitError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Category */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as typeof category)}
                        className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] cursor-pointer"
                      >
                        <option value="ACTIVITY">Paint Session / Event</option>
                        <option value="ARTWORK">Original Artwork Sold</option>
                      </select>
                    </div>

                    {/* Method */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                        className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] cursor-pointer"
                      >
                        <option value="CASH">CASH PAID</option>
                        <option value="POS">POS TERMINAL</option>
                        <option value="TRANSFER">BANK TRANSFER</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Sale Description</label>
                    <input
                      type="text"
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="E.g. Group Paint: 5 seats for Cap Painting"
                      className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Unit Price */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Unit Price (NGN)</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
                        className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs"
                      />
                    </div>
                    {/* Qty */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                        className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Total calculator */}
                  <div className="p-3 bg-gray-50 border rounded-xl flex justify-between font-mono text-xs">
                    <span>Gross Total:</span>
                    <span className="font-bold text-[var(--accent-orange)]">₦{(unitPrice * quantity).toLocaleString()}</span>
                  </div>

                  {/* Customer (Optional) */}
                  <div className="border-t border-[var(--border-soft)] pt-4 flex flex-col gap-4">
                    <h4 className="font-serif text-sm text-[var(--accent-purple)] font-semibold">Customer Details (Optional)</h4>
                    
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Customer Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full border border-[var(--border-soft)] rounded-xl py-1.5 px-3 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Email</label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="john@example.com"
                          className="w-full border border-[var(--border-soft)] rounded-xl py-1.5 px-3 text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Phone</label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="08167009545"
                          className="w-full border border-[var(--border-soft)] rounded-xl py-1.5 px-3 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 justify-end border-t border-[var(--border-soft)] pt-6 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-2.5 border border-[var(--border-soft)] text-[var(--text-muted)] hover:bg-gray-50 rounded-full font-mono text-xs uppercase tracking-widest cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-2.5 bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-orange)] rounded-full font-mono text-xs uppercase tracking-widest font-bold cursor-pointer"
                    >
                      Log Ledger Entry
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
export const dynamic = 'force-dynamic';
