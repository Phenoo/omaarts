'use client';

import React, { useEffect, useState } from 'react';
import { getCustomers, CustomerProfile } from '@/lib/firebase/services/adminOperations';
import { Users, Search, RefreshCw, Star, Mail, Phone, Calendar } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = customers.filter((c) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="flex flex-col gap-8 text-[var(--foreground)]">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold">Customers Directory</h1>
          <p className="font-sans text-sm text-[var(--text-muted)] mt-1">View client profiles, total spend ledger, and returning booking stats.</p>
        </div>
        <button onClick={loadCustomers} className="p-2.5 rounded-full border hover:bg-gray-100 cursor-pointer" title="Sync Customers">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="flex gap-4 items-center bg-white border border-[var(--border-soft)] p-4 rounded-2xl">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search directory by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-[var(--border-soft)] rounded-xl focus:outline-none focus:border-[var(--accent-purple)] font-sans text-xs"
          />
        </div>
      </div>

      {/* Directory Content */}
      {loading ? (
        <div className="text-center py-12 text-xs font-mono text-[var(--text-muted)] flex flex-col gap-2 items-center">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-purple)] border-t-transparent animate-spin" />
          Mapping client database records...
        </div>
      ) : error ? (
        <div className="text-center py-12 border border-red-100 rounded-2xl bg-white max-w-sm mx-auto flex flex-col gap-4 items-center">
          <p className="text-red-500 font-mono text-xs">Failed to fetch customer aggregated files.</p>
          <button onClick={loadCustomers} className="px-5 py-2 bg-[var(--accent-purple)] text-white rounded-full font-mono text-xs uppercase hover:bg-[var(--accent-orange)] transition-colors flex items-center gap-1.5 cursor-pointer">
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[var(--border-soft)] bg-white rounded-2xl">
          <Users className="mx-auto text-gray-300 mb-3" size={32} />
          <h3 className="font-serif text-lg">No clients found</h3>
          <p className="font-sans text-sm text-[var(--text-muted)] mt-1">No transaction records matches this criteria.</p>
        </div>
      ) : (
        <div className="bg-white border border-[var(--border-soft)] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm font-sans">
              <thead>
                <tr className="border-b border-[var(--border-soft)] font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] bg-gray-50/50">
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Contact Info</th>
                  <th className="p-4 font-semibold">Bookings</th>
                  <th className="p-4 font-semibold">Art Purchases</th>
                  <th className="p-4 font-semibold">Last Interaction</th>
                  <th className="p-4 text-right font-semibold">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/40">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {c.totalSpent >= 50000 && (
                          <span className="p-1 bg-amber-50 text-amber-600 rounded" title="VIP Customer (Spend > ₦50k)">
                            <Star size={12} fill="currentColor" />
                          </span>
                        )}
                        <span className="font-semibold text-sm text-[var(--foreground)]">{c.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-mono text-gray-500">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1"><Mail size={10} /> {c.email}</span>
                        {c.phone && <span className="flex items-center gap-1 mt-0.5"><Phone size={10} /> {c.phone}</span>}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs font-semibold">{c.bookingsCount} sessions</td>
                    <td className="p-4 font-mono text-xs font-semibold">{c.ordersCount} orders</td>
                    <td className="p-4 font-mono text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <Calendar size={12} />
                      {c.lastVisit}
                    </td>
                    <td className="p-4 text-right font-mono text-sm font-bold text-[var(--accent-orange)]">
                      ₦{c.totalSpent.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
export const dynamic = 'force-dynamic';
