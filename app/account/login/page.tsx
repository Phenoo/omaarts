'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/lib/context/CustomerAuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const { login, loginWithGoogle, isAuthenticated, loading: authLoading } = useCustomerAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/account');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/account');
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      switch (firebaseError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Invalid email or password. Please try again.');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Please try again later.');
          break;
        default:
          setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push('/account');
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      if (firebaseError.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
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
              Welcome Back
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-[var(--accent-purple)] tracking-tight">
              Sign In
            </h1>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              Access your orders, bookings, and saved artworks.
            </p>
          </div>

          {/* Card */}
          <div className="section-shell p-8 md:p-10 bg-white/80">
            {/* Google Sign-In */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-full border border-[var(--border-soft)] bg-white hover:bg-[var(--surface-soft)] transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-7">
              <div className="flex-1 h-px bg-[var(--border-soft)]" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                or
              </span>
              <div className="flex-1 h-px bg-[var(--border-soft)]" />
            </div>

            {/* Email/Password Form */}
            <form method="post" onSubmit={handleEmailLogin} className="space-y-5">
              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] block mb-2">
                  Email
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

              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] block mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-[var(--border-soft)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]/30 focus:border-[var(--accent-purple)] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/account/forgot-password"
                  className="text-xs text-[var(--accent-purple)] hover:text-[var(--accent-orange)] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* Signup Link */}
            <p className="text-center text-sm text-[var(--text-muted)] mt-8">
              Don&apos;t have an account?{' '}
              <Link
                href="/account/signup"
                className="text-[var(--accent-purple)] font-medium hover:text-[var(--accent-orange)] transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
