'use client';

import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="w-full py-40 bg-[#121212] flex flex-col items-center justify-center text-center border-t border-[#333]">
      <h2 className="font-serif text-6xl md:text-8xl text-white tracking-tight mb-8">
        Let&apos;s work together.
      </h2>
      <p className="font-sans text-lg text-white/60 max-w-lg mb-12 leading-relaxed">
        Available for commissions, collaborations, and exhibitions for the 2026 season.
      </p>
      <Link 
        href="/contact" 
        className="px-8 py-4 bg-[var(--accent-purple)] text-white font-mono text-sm uppercase tracking-widest hover:bg-white hover:text-[var(--accent-purple)] transition-colors rounded-full"
      >
        Get in Touch
      </Link>
    </section>
  );
}
