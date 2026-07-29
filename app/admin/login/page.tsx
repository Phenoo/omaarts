'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { UserDoc } from '@/lib/types';
import { ShieldAlert, LogIn, Lock, Mail } from 'lucide-react';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorQuery = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle URL errors
  useEffect(() => {
    if (errorQuery === 'unauthorized') {
      setErrorMsg('Access denied. You do not have permissions to access the admin console.');
    } else if (errorQuery === 'no-profile') {
      setErrorMsg('No user record found in the database. Please contact a Super Admin.');
    }
  }, [errorQuery]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter email and password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Sign in with Firebase Auth
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const uid = credentials.user.uid;

      // 2. Fetch user profile from Firestore to verify role
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const profile = userSnap.data() as UserDoc;
        const role = profile.role;

        if (role === 'admin' || role === 'super_admin' || role === 'staff') {
          // Authorized: redirect to dashboard
          router.push('/admin');
        } else {
          // Not authorized: sign out
          await signOut(auth);
          setErrorMsg('Access Denied. You do not have administrator permissions.');
        }
      } else {
        // No doc: sign out
        await signOut(auth);
        setErrorMsg('User registration records not found in database. Contact Super Admin.');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      // Friendly messages for common Auth errors
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMsg('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg('Too many unsuccessful attempts. Access has been temporarily locked. Try again later.');
      } else {
        setErrorMsg(err.message || 'An unexpected authentication error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const credentials = await signInWithPopup(auth, provider);
      const uid = credentials.user.uid;

      // Check user profile in Firestore to verify role
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const profile = userSnap.data() as UserDoc;
        const role = profile.role;

        if (role === 'admin' || role === 'super_admin' || role === 'staff') {
          // Authorized: redirect to dashboard
          router.push('/admin');
        } else {
          // Not authorized: sign out
          await signOut(auth);
          setErrorMsg('Access Denied. Your Google account does not have administrator permissions.');
        }
      } else {
        // No doc: sign out
        await signOut(auth);
        setErrorMsg('Google account not registered as staff. Contact a Super Admin to register your profile.');
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err.message || 'An unexpected Google authentication error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--surface-strong)] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background visual graphics */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[var(--accent-purple)]/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[var(--accent-orange)]/15 blur-3xl" />

      <div className="w-full max-w-md bg-white/95 rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20 z-10">
        
        {/* Logo and title */}
        <div className="text-center flex flex-col items-center gap-4 mb-8">
          <div className="relative h-14 w-44 overflow-hidden block">
            <Image
              src="/images/oma-logo.jpg"
              alt="Arts by Oma"
              fill
              className="object-contain scale-[1.3] origin-center"
            />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-[var(--foreground)] font-semibold">Management Console</h1>
            <p className="font-sans text-xs text-[var(--text-muted)] mt-1">Sign in with authorized staff credentials</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 font-mono text-xs flex gap-2.5 items-start mb-6">
            <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5 text-sm text-[var(--foreground)]">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@artsybyoma.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-[var(--border-soft)] rounded-xl focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-[var(--border-soft)] rounded-xl focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-full font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all mt-3
              ${loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white'
              }
            `}
          >
            <LogIn size={16} />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center my-5">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-mono uppercase tracking-widest">or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3.5 px-4 border border-[var(--border-soft)] bg-white rounded-full text-[10px] font-mono uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-[var(--foreground)]"
        >
          <svg className="w-4.5 h-4.5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 15.01 1 12 1 7.24 1 3.23 3.73 1.34 7.72l3.88 3.01C6.14 7.76 8.84 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.71-4.92 3.71-8.6z"
            />
            <path
              fill="#FBBC05"
              d="M5.22 14.73c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.34 7.72C.48 9.54 0 11.58 0 13.7c0 2.12.48 4.16 1.34 5.98l3.88-3.01c-.24-.72-.38-1.49-.38-2.29z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.18.79-2.69 1.26-4.26 1.26-3.16 0-5.86-2.72-6.78-5.69L1.34 15.98C3.23 19.97 7.24 23 12 23z"
            />
          </svg>
          Google Sign In
        </button>

        <div className="mt-8 border-t border-[var(--border-soft)] pt-4 text-center">
          <Link href="/" className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent-purple)] transition-colors">
            &larr; Back to Public Website
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[var(--surface-strong)] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="w-full max-w-md bg-white/95 rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20 z-10 flex flex-col items-center justify-center min-h-[400px]">
          <p className="font-mono text-xs text-[var(--text-muted)] animate-pulse">Loading Admin Portal...</p>
        </div>
      </main>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
