'use client';

import React, { useEffect, useState } from 'react';
import { getActivities, archiveActivity } from '@/lib/firebase/services/activities';
import { useAdminAuth } from '@/lib/context/AdminAuthContext';
import { Activity } from '@/lib/types';
import { Paintbrush, Plus, Edit, Archive, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AdminActivitiesPage() {
  const { user } = useAdminAuth();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);



  const loadActivities = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getActivities(false); // fetch all, including inactive
      setActivities(data);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleArchive = async (id: string) => {
    if (window.confirm('Are you sure you want to archive this activity? Archiving keeps historical reports safe but hides the experience from the catalog.')) {
      try {
        const adminUid = user?.uid || 'anonymous';
        await archiveActivity(id, adminUid);
        loadActivities();
      } catch (err) {
        console.error(err);
        alert('Failed to archive activity.');
      }
    }
  };



  return (
    <div className="flex flex-col gap-8 text-[var(--foreground)]">
      
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold">Activities Panel</h1>
          <p className="font-sans text-sm text-[var(--text-muted)] mt-1">Manage packages, variants, pricing, and availability states.</p>
        </div>
        
        <Link
          href="/admin/activities/new"
          className="px-5 py-3 rounded-full bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-orange)] transition-colors font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus size={16} />
          Add Activity
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs font-mono text-[var(--text-muted)] flex flex-col gap-2 items-center">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-purple)] border-t-transparent animate-spin" />
          Loading activities...
        </div>
      ) : error ? (
        <div className="text-center py-12 border border-red-100 rounded-2xl bg-white max-w-sm mx-auto flex flex-col gap-4 items-center">
          <p className="text-red-500 font-mono text-xs">Failed to connect to database.</p>
          <button onClick={loadActivities} className="px-5 py-2 bg-[var(--accent-purple)] text-white rounded-full font-mono text-xs uppercase hover:bg-[var(--accent-orange)] transition-colors flex items-center gap-1.5 cursor-pointer">
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[var(--border-soft)] bg-white rounded-2xl">
          <Paintbrush className="mx-auto text-[var(--text-muted)] mb-3" size={32} />
          <h3 className="font-serif text-lg">No activities logged</h3>
          <p className="font-sans text-sm text-[var(--text-muted)] mt-1 mb-6">Database activities are empty. Trigger seeds or add manually.</p>
          <Link href="/admin/activities/new" className="inline-block px-6 py-2.5 bg-[var(--accent-purple)] text-white font-mono text-xs uppercase tracking-wider hover:bg-[var(--accent-orange)] transition-colors rounded-full cursor-pointer">
            Create First Activity
          </Link>
        </div>
      ) : (
        /* Table of activities */
        <div className="bg-white border border-[var(--border-soft)] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm font-sans">
              <thead>
                <tr className="border-b border-[var(--border-soft)] font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] bg-gray-50/50">
                  <th className="p-4 font-semibold">Activity</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Base Price</th>
                  <th className="p-4 font-semibold">Pricing Model</th>
                  <th className="p-4 font-semibold">Booking Status</th>
                  <th className="p-4 font-semibold">Active Catalog</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map((act) => (
                  <tr key={act.id} className="hover:bg-gray-50/40">
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-serif font-bold text-base text-[var(--foreground)]">{act.name}</span>
                        <span className="font-mono text-[9px] text-[var(--text-muted)]">Slug: {act.slug}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-semibold">{act.category}</td>
                    <td className="p-4 font-mono text-xs font-bold text-[var(--foreground)]">
                      ₦{act.basePrice.toLocaleString()}
                    </td>
                    <td className="p-4 font-mono text-[10px] font-semibold text-[var(--text-muted)]">
                      {act.pricingModel}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold
                        ${act.bookingEnabled ? 'text-green-700' : 'text-amber-700'}
                      `}>
                        {act.bookingEnabled ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {act.bookingEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold
                        ${act.active ? 'text-green-700' : 'text-gray-400'}
                      `}>
                        {act.active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {act.active ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/admin/activities/${act.id}`}
                          className="p-2 border border-[var(--border-soft)] hover:border-[var(--accent-purple)] text-gray-500 hover:text-[var(--accent-purple)] rounded-full hover:bg-[var(--surface-soft)]/20 transition-all cursor-pointer"
                          title="Edit Activity"
                        >
                          <Edit size={14} />
                        </Link>
                        {act.active && (
                          <button
                            onClick={() => handleArchive(act.id)}
                            className="p-2 border border-red-150 hover:border-red-500 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-all cursor-pointer"
                            title="Archive Activity"
                          >
                            <Archive size={14} />
                          </button>
                        )}
                      </div>
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
