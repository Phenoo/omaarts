'use client';

import React, { useState } from 'react';
import { useCustomerAuth } from '@/lib/context/CustomerAuthContext';
import { Loader2, Save, CheckCircle, User, Mail, Phone, MapPin } from 'lucide-react';
import Footer from '@/components/Footer';

export default function ProfilePage() {
  const { profile, updateProfile, user } = useCustomerAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [defaultAddress, setDefaultAddress] = useState(profile?.defaultAddress || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await updateProfile({
        displayName: displayName.trim(),
        phone: phone.trim(),
        defaultAddress: defaultAddress.trim(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6 max-w-2xl">
        <h2 className="font-serif text-3xl tracking-tight">Profile Settings</h2>

        {/* Profile Card */}
        <div className="section-shell p-6 md:p-8 bg-white/80">
          {/* Avatar & Email (read-only) */}
          <div className="flex items-center gap-4 pb-6 border-b border-[var(--border-soft)]">
            <div className="w-16 h-16 rounded-full bg-[var(--accent-purple)] flex items-center justify-center text-white font-serif text-2xl shrink-0">
              {profile?.displayName?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-medium">{profile?.displayName || 'Customer'}</p>
              <p className="text-sm text-[var(--text-muted)] flex items-center gap-1.5">
                <Mail size={13} />
                {user?.email}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent-purple)] mt-1">
                {profile?.role}
              </p>
            </div>
          </div>

          {/* Edit Form */}
          <form method="post" onSubmit={handleSave} className="space-y-5 pt-6">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                <CheckCircle size={16} />
                Profile updated successfully!
              </div>
            )}

            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] block mb-2">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border-soft)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]/30 focus:border-[var(--accent-purple)] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] block mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0816 700 9545"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border-soft)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]/30 focus:border-[var(--accent-purple)] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] block mb-2">
                Default Delivery Address
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-4 text-[var(--text-muted)]" />
                <textarea
                  value={defaultAddress}
                  onChange={(e) => setDefaultAddress(e.target.value)}
                  placeholder="Your default delivery address"
                  rows={3}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border-soft)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]/30 focus:border-[var(--accent-purple)] transition-all resize-none"
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                This will be pre-filled during checkout.
              </p>
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] block mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border-soft)] bg-gray-50 text-sm text-[var(--text-muted)] cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Email cannot be changed.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Save size={14} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="section-shell p-6 bg-white/80">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Account Info
          </p>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-[var(--text-muted)]">Member since:</span>{' '}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </p>
            <p>
              <span className="text-[var(--text-muted)]">Account ID:</span>{' '}
              <span className="font-mono text-xs">{user?.uid?.slice(0, 12)}...</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Footer />
      </div>
    </>
  );
}
