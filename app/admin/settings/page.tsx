'use client';

import React, { useEffect, useState } from 'react';
import { getSiteSettings, saveSiteSettings, getBlockedDates, addBlockedDate, removeBlockedDate, SiteSettings } from '@/lib/firebase/services/settings';
import { Calendar, ShieldAlert, Trash2, CheckCircle2 } from 'lucide-react';
import { BlockedDate } from '@/lib/types';

export default function AdminSettingsPage() {
  const [, setSettings] = useState<SiteSettings | null>(null);
  const [blockedDates, setBlockedDates] = useState<(BlockedDate & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  // Form sites
  const [damagePolicy, setDamagePolicy] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [studioAddress, setStudioAddress] = useState('');
  const [featuredAlertText, setFeaturedAlertText] = useState('');
  const [enableCheckoutAlert, setEnableCheckoutAlert] = useState(true);

  // New Blocked Date states
  const [blockDate, setBlockDate] = useState('');
  const [isFullClosure, setIsFullClosure] = useState(true);
  const [blockedSlotsText, setBlockedSlotsText] = useState(''); // comma-separated E.g. "12:00,14:00"

  // UI notifications
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [blockSuccess, setBlockSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const siteSet = await getSiteSettings();
      setSettings(siteSet);
      
      setDamagePolicy(siteSet.damagePolicy);
      setContactPhone(siteSet.contactPhone);
      setContactEmail(siteSet.contactEmail);
      setOpeningHours(siteSet.openingHours);
      setStudioAddress(siteSet.studioAddress);
      setFeaturedAlertText(siteSet.featuredAlertText || '');
      setEnableCheckoutAlert(siteSet.enableCheckoutAlert ?? true);

      const blockData = await getBlockedDates();
      setBlockedDates(blockData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    try {
      const payload: SiteSettings = {
        damagePolicy,
        contactPhone,
        contactEmail,
        openingHours,
        studioAddress,
        featuredAlertText,
        enableCheckoutAlert
      };

      await saveSiteSettings(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    }
  };

  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockSuccess(false);

    if (!blockDate) {
      alert('Please select a date.');
      return;
    }

    try {
      const slots = blockedSlotsText.split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await addBlockedDate({
        date: blockDate,
        isFullClosure,
        blockedSlots: isFullClosure ? [] : slots,
        reason: isFullClosure ? 'Full studio closure' : 'Blocked slots'
      });

      setBlockSuccess(true);
      setBlockDate('');
      setBlockedSlotsText('');
      setIsFullClosure(true);

      const refresh = await getBlockedDates();
      setBlockedDates(refresh);

      setTimeout(() => setBlockSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to block date.');
    }
  };

  const handleDeleteBlockedDate = async (id: string) => {
    if (window.confirm('Are you sure you want to unblock this calendar entry?')) {
      try {
        await removeBlockedDate(id);
        const refresh = await getBlockedDates();
        setBlockedDates(refresh);
      } catch (err) {
        console.error(err);
        alert('Failed to unblock date.');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-xs font-mono text-[var(--text-muted)] flex flex-col gap-2 items-center">
        <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-purple)] border-t-transparent animate-spin" />
        Configuring system utilities...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-[var(--foreground)]">
      
      {/* Welcome info */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold">Settings</h1>
        <p className="font-sans text-sm text-[var(--text-muted)] mt-1">Configure damage policies, contact parameters, and calendar blacklists.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Site settings form */}
        <form method="post" onSubmit={handleSaveSettings} className="bg-white border border-[var(--border-soft)] rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <h3 className="font-serif text-lg font-semibold text-[var(--foreground)] border-b border-[var(--border-soft)] pb-3">Site Configuration</h3>

          {saveSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-mono flex items-center gap-2">
              <CheckCircle2 size={16} />
              Configurations updated successfully.
            </div>
          )}

          {/* Contact Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Studio Phone</label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-sans text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Studio Email</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-sans text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Opening Hours</label>
            <input
              type="text"
              required
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              className="border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-sans text-xs"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Studio Address</label>
            <textarea
              required
              value={studioAddress}
              onChange={(e) => setStudioAddress(e.target.value)}
              rows={2}
              className="border border-[var(--border-soft)] rounded-xl py-2.5 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-sans text-xs resize-none"
            />
          </div>

          {/* Checkout alert banner */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-gray-50 border border-[var(--border-soft)]">
            <div className="flex items-center gap-2 font-mono text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={enableCheckoutAlert}
                onChange={(e) => setEnableCheckoutAlert(e.target.checked)}
                className="rounded text-[var(--accent-purple)] focus:ring-[var(--accent-purple)]"
              />
              <span>Enable Cart Alert Notification Banner</span>
            </div>
            
            {enableCheckoutAlert && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-gray-400 uppercase">Alert Banner Text</label>
                <input
                  type="text"
                  value={featuredAlertText}
                  onChange={(e) => setFeaturedAlertText(e.target.value)}
                  placeholder="E.g. Book early! Weekend slots fill up extremely fast."
                  className="border border-[var(--border-soft)] rounded-xl py-1.5 px-3 bg-white focus:outline-none focus:border-[var(--accent-purple)] text-xs"
                />
              </div>
            )}
          </div>

          {/* Damage Policy */}
          <div className="flex flex-col gap-1.5 border-t border-[var(--border-soft)] pt-6">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium flex items-center gap-1">
              <ShieldAlert size={14} className="text-[var(--accent-orange)]" />
              Studio Damage Policy
            </label>
            <textarea
              required
              value={damagePolicy}
              onChange={(e) => setDamagePolicy(e.target.value)}
              rows={4}
              className="border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] font-sans text-xs resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-xs uppercase tracking-widest font-bold rounded-full transition-colors cursor-pointer"
          >
            Save Site Configuration
          </button>
        </form>

        {/* Right Column: Blocked Calendar Dates */}
        <div className="flex flex-col gap-6 bg-white border border-[var(--border-soft)] rounded-2xl p-6 shadow-sm">
          <h3 className="font-serif text-lg font-semibold text-[var(--foreground)] border-b border-[var(--border-soft)] pb-3">Calendar Blacklists</h3>

          {/* Block Date Form */}
          <form method="post" onSubmit={handleAddBlockedDate} className="flex flex-col gap-4 bg-gray-50 border border-gray-100 p-4 rounded-xl font-mono text-xs">
            <h4 className="font-serif text-sm text-[var(--accent-purple)] font-bold normal-case">Add Calendar Block</h4>
            
            {blockSuccess && (
              <div className="p-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-[10px]">
                Date blocked successfully.
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 uppercase">Target Date</label>
              <input
                type="date"
                required
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-1.5 px-3 text-xs font-sans"
              />
            </div>

            <div className="flex items-center gap-4 py-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="blockType"
                  checked={isFullClosure}
                  onChange={() => setIsFullClosure(true)}
                  className="text-[var(--accent-purple)] focus:ring-[var(--accent-purple)]"
                />
                <span>Full Closure (All Day)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="blockType"
                  checked={!isFullClosure}
                  onChange={() => setIsFullClosure(false)}
                  className="text-[var(--accent-purple)] focus:ring-[var(--accent-purple)]"
                />
                <span>Block Specific Slots</span>
              </label>
            </div>

            {!isFullClosure && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 uppercase">Hourly Slots (Comma-separated, E.g. &quot;12:00, 14:00&quot;)</label>
                <input
                  type="text"
                  placeholder="11:00, 13:00, 16:00"
                  value={blockedSlotsText}
                  onChange={(e) => setBlockedSlotsText(e.target.value)}
                  className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-1.5 px-3 text-xs"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 bg-gray-800 text-white hover:bg-gray-700 rounded-xl uppercase tracking-wider font-semibold transition-colors mt-2"
            >
              Add Block Rule
            </button>
          </form>

          {/* List of currently blocked dates */}
          <div className="flex flex-col gap-3">
            <h4 className="font-serif text-sm text-[var(--foreground)] font-semibold flex items-center gap-1">
              <Calendar size={16} className="text-[var(--accent-purple)]" />
              Active Blacklisted Dates
            </h4>
            
            {blockedDates.length === 0 ? (
              <p className="font-sans text-xs text-[var(--text-muted)] italic py-4">No calendar dates or slots are currently blocked.</p>
            ) : (
              <div className="flex flex-col gap-2 font-mono text-xs">
                {blockedDates.map((b) => (
                  <div key={b.id} className="flex justify-between items-center p-3 rounded-lg border bg-gray-50/50">
                    <div>
                      <span className="font-bold text-[var(--foreground)]">{b.date}</span>
                      {b.isFullClosure ? (
                        <span className="block text-[10px] text-red-600 font-semibold uppercase mt-0.5">Full Closure</span>
                      ) : (
                        <span className="block text-[10px] text-amber-700 font-semibold uppercase mt-0.5">
                          Blocked Slots: {b.blockedSlots?.join(', ')}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteBlockedDate(b.id)}
                      className="p-1.5 hover:bg-red-50 text-red-500 rounded-full hover:text-red-700 cursor-pointer"
                      title="Delete Rule"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
export const dynamic = 'force-dynamic';
