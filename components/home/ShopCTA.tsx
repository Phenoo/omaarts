'use client';

import Link from 'next/link';

export default function ShopCTA() {
  return (
    <section className="w-full py-32 bg-white">
      <div className="max-w-[90vw] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* TEXT */}
        <div className="flex flex-col gap-8 order-2 md:order-1">
            <h2 className="font-serif text-6xl md:text-8xl text-[var(--foreground)] tracking-tight leading-[0.9]">
                COLLECT<br/>
                <span className="text-[var(--accent-purple)]">ORIGINALS</span>
            </h2>
            <p className="font-sans text-lg text-[var(--text-muted)] max-w-md leading-relaxed">
                Own a piece of the narrative. From large-scale canvas works to limited edition prints, each piece is a fragment of the chaotic beauty we explore.
            </p>
            <div className="mt-4">
                <Link href="/shop" className="inline-block px-12 py-4 bg-[var(--accent-purple)] text-white font-mono text-sm uppercase tracking-widest hover:bg-[var(--accent-orange)] transition-all duration-300 rounded-full">
                    Visit Shop
                </Link>
            </div>
        </div>

        {/* IMAGE */}
        <div className="relative aspect-square w-full order-1 md:order-2 group overflow-hidden border border-[var(--border-soft)]">
             <div className="absolute inset-0 bg-[var(--surface-strong)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-white/35 text-9xl animate-pulse">SHOP</span>
             </div>
        </div>

      </div>
    </section>
  );
}
