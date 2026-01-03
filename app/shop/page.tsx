'use client';

import Link from 'next/link';
import Image from 'next/image';

const ARTWORKS = [
    { id: 'lagos-heat', title: 'Lagos Heat', price: '$4,500', image: '/images/archive-1.png', category: 'Painting' },
    { id: 'indigo-dreams', title: 'Indigo Dreams', price: '$3,200', image: '/images/archive-2.png', category: 'Mixed Media' },
    { id: 'market-noise', title: 'Market Noise', price: '$5,000', image: '/images/hero-texture.png', category: 'Painting' },
    { id: 'ancestral', title: 'Ancestral', price: '$8,000', image: '/images/artist-studio.png', category: 'Installation' },
];

export default function ShopPage() {
  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-[90vw] mx-auto">
        <div className="flex justify-between items-end mb-16 border-b border-[#333] pb-8">
            <h1 className="font-serif text-6xl md:text-8xl text-[var(--accent-purple)] tracking-tight">
                Collection
            </h1>
            <div className="font-mono text-sm uppercase tracking-widest hidden md:block opacity-60">
                {ARTWORKS.length} Works Available
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {ARTWORKS.map((art) => (
                <Link href={`/work/${art.id}`} key={art.id} className="group block">
                    <div className="aspect-[3/4] relative overflow-hidden bg-[#222] mb-4">
                        <Image 
                            src={art.image} 
                            alt={art.title} 
                            fill 
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-4 right-4 bg-[var(--accent-orange)] text-white font-mono text-xs px-2 py-1 opacity-100">
                            VIEW DETAILS
                        </div>
                    </div>
                    <div className="flex justify-between items-baseline border-t border-[#333] pt-4 group-hover:border-[var(--accent-purple)] transition-colors">
                        <h3 className="font-serif text-2xl group-hover:text-[var(--accent-purple)] transition-colors">{art.title}</h3>
                        <span className="font-mono text-sm opacity-60">{art.price}</span>
                    </div>
                    <p className="font-mono text-xs uppercase tracking-widest opacity-40 mt-1">{art.category}</p>
                </Link>
            ))}
        </div>
      </div>
    </main>
  );
}
