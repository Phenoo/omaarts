'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { AlertCircle, RefreshCw, Home, Mail } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to error reporting service
    console.error('Unhandled runtime error in application:', error);
  }, [error]);

  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <div className="max-w-[90vw] md:max-w-2xl mx-auto py-16 px-4 w-full flex-grow flex flex-col justify-center items-center text-center">
        
        {/* Error Badge */}
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-6 shadow-sm">
          <AlertCircle size={32} />
        </div>

        <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--surface-soft)] border border-[var(--border-soft)] font-mono text-xs uppercase tracking-widest text-[var(--accent-purple)] mb-4">
          Unexpected Studio Interruption
        </span>

        {/* Title */}
        <h1 className="font-serif text-3xl md:text-5xl text-[var(--foreground)] mb-4 tracking-tight">
          Something went wrong
        </h1>

        <p className="font-sans text-base text-[var(--text-muted)] max-w-md mb-6 leading-relaxed">
          An unhandled glitch occurred while rendering this canvas. Our system has logged the details.
        </p>

        {/* Digest snippet if available */}
        {error?.digest && (
          <div className="mb-8 p-3 rounded-lg bg-black/5 font-mono text-[11px] text-[var(--text-muted)] max-w-lg overflow-x-auto">
            Reference Digest: {error.digest}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center mb-12">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-xs uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <RefreshCw size={16} />
            Try Again
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-[var(--border-soft)] bg-white/70 hover:bg-white text-[var(--foreground)] font-mono text-xs uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Home size={16} />
            Return Home
          </Link>

          <Link
            href="/contact"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-[var(--border-soft)] bg-white/70 hover:bg-white text-[var(--foreground)] font-mono text-xs uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Mail size={16} />
            Report Issue
          </Link>
        </div>

      </div>

      <Footer />
    </main>
  );
}
