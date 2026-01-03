'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function ShopCTA() {
  return (
    <section className="w-full py-32 bg-[#121212]">
      <div className="max-w-[90vw] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* TEXT */}
        <div className="flex flex-col gap-8 order-2 md:order-1">
            <h2 className="font-serif text-6xl md:text-8xl text-white tracking-tight leading-[0.9]">
                COLLECT<br/>
                <span className="text-[var(--accent-secondary)] [text-shadow:0_0_20px_var(--accent-secondary)]">ORIGINALS</span>
            </h2>
            <p className="font-sans text-lg text-white/60 max-w-md leading-relaxed">
                Own a piece of the narrative. From large-scale canvas works to limited edition prints, each piece is a fragment of the chaotic beauty we explore.
            </p>
            <div className="mt-4">
                <Link href="/shop" className="inline-block px-12 py-4 bg-[var(--accent-secondary)] text-white font-mono text-sm uppercase tracking-widest hover:bg-white hover:text-[var(--accent-secondary)] hover:[box-shadow:0_0_20px_var(--accent-secondary)] transition-all duration-300 rounded-full">
                    Visit Shop
                </Link>
            </div>
        </div>

        {/* IMAGE */}
        <div className="relative aspect-square w-full order-1 md:order-2 group overflow-hidden border border-[#333]">
             {/* Placeholder for shop image - using a colored div or existing asset */}
             <div className="absolute inset-0 bg-gradient-to-br from-[#222] to-[#000]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-white/20 text-9xl animate-pulse">SHOP</span>
             </div>
        </div>

      </div>
    </section>
  );
}
