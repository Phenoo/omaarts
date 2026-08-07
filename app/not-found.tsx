import React from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Home, Palette, Paintbrush, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <div className="max-w-[90vw] md:max-w-4xl mx-auto py-16 px-4 w-full flex-grow flex flex-col justify-center items-center text-center">
        
        {/* Decorative Badge */}
        <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--surface-soft)] border border-[var(--border-soft)] font-mono text-xs uppercase tracking-widest text-[var(--accent-purple)] mb-6">
          Error 404 &bull; Missing Frame
        </span>

        {/* Hero Title */}
        <h1 className="font-serif text-7xl md:text-9xl tracking-tighter text-[var(--accent-purple)] mb-6 leading-none">
          404
        </h1>

        <h2 className="font-serif text-2xl md:text-4xl text-[var(--foreground)] mb-4">
          Canvas Not Found
        </h2>

        <p className="font-sans text-base md:text-lg text-[var(--text-muted)] max-w-xl mb-12 leading-relaxed">
          The artwork, activity, or page you are looking for may have been relocated, renamed, or never painted in this gallery space.
        </p>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mb-12">
          <Link
            href="/"
            className="section-shell p-6 flex flex-col items-center justify-center gap-3 hover:border-[var(--accent-purple)] hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--surface-soft)] text-[var(--accent-purple)] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Home size={20} />
            </div>
            <span className="font-serif text-base text-[var(--foreground)]">Home</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Main Studio</span>
          </Link>

          <Link
            href="/portfolio"
            className="section-shell p-6 flex flex-col items-center justify-center gap-3 hover:border-[var(--accent-purple)] hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--surface-soft)] text-[var(--accent-purple)] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Palette size={20} />
            </div>
            <span className="font-serif text-base text-[var(--foreground)]">Portfolio</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Fine Art Collection</span>
          </Link>

          <Link
            href="/activities"
            className="section-shell p-6 flex flex-col items-center justify-center gap-3 hover:border-[var(--accent-purple)] hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--surface-soft)] text-[var(--accent-purple)] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Paintbrush size={20} />
            </div>
            <span className="font-serif text-base text-[var(--foreground)]">Paint &amp; Sip</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Experiences &amp; Events</span>
          </Link>

          <Link
            href="/shop"
            className="section-shell p-6 flex flex-col items-center justify-center gap-3 hover:border-[var(--accent-purple)] hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--surface-soft)] text-[var(--accent-purple)] flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag size={20} />
            </div>
            <span className="font-serif text-base text-[var(--foreground)]">Shop</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Original Works</span>
          </Link>
        </div>

        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--accent-purple)] hover:text-[var(--accent-orange)] transition-colors"
        >
          <ArrowLeft size={16} />
          Return to Studio Homepage
        </Link>
      </div>

      <Footer />
    </main>
  );
}
