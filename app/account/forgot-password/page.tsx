'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCustomerAuth } from '@/lib/context/CustomerAuthContext';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import Footer from '@/components/Footer';

export default function ForgotPasswordPage() {
  const { resetPassword } = useCustomerAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          setError('No account found with this email.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        default:
          setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-28 min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent-orange)] mb-3">
              Account Recovery
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-[var(--accent-purple)] tracking-tight">
              Reset Password
            </h1>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {/* Card */}
          <div className="section-shell p-8 md:p-10 bg-white/80">
            {success ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h2 className="font-serif text-2xl text-[var(--foreground)]">Check your email</h2>
                <p className="text-sm text-[var(--text-muted)]">
                  We&apos;ve sent a password reset link to <strong>{email}</strong>. 
                  Check your inbox and follow the instructions.
                </p>
                <Link
                  href="/account/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-xs uppercase tracking-widest transition-all duration-300 mt-4 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <form method="post" onSubmit={handleReset} className="space-y-5">
                {error && (
                  <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] block mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border-soft)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]/30 focus:border-[var(--accent-purple)] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                <p className="text-center text-sm text-[var(--text-muted)] mt-6">
                  <Link
                    href="/account/login"
                    className="text-[var(--accent-purple)] font-medium hover:text-[var(--accent-orange)] transition-colors inline-flex items-center gap-1"
                  >
                    <ArrowLeft size={14} />
                    Back to Sign In
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
