'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getArtworks } from '@/lib/firebase/services/artworks';
import { Artwork } from '@/lib/types';
import { ArrowRight, Eye } from 'lucide-react';

export default function FeaturedArtworks() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const all = await getArtworks();
        // Load featured items
        const featured = all.filter((art) => art.featured).slice(0, 3);
        if (featured.length > 0) {
          setArtworks(featured);
        } else {
          setArtworks(all.slice(0, 3));
        }
      } catch (e) {
        console.error('Failed to load featured artworks:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading || artworks.length === 0) {
    return null; // Silent hide during loading on homepage
  }

  const getStatusLabel = (art: Artwork) => {
    switch (art.status) {
      case 'AVAILABLE':
        return 'Available';
      case 'SOLD':
        return 'Sold';
      case 'COMMISSIONED':
        return 'Commissioned';
      case 'RESERVED':
        return 'Reserved';
      case 'PORTFOLIO_ONLY':
      default:
        return 'Exhibition';
    }
  };

  return (
    <section className="w-full py-24 bg-white">
      <div className="max-w-[90vw] mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent-orange)] mb-2">Art Shop</p>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight text-[var(--foreground)]">
              Featured Artworks
            </h2>
          </div>
          <Link
            href="/art"
            className="font-mono text-xs uppercase tracking-widest text-[var(--accent-purple)] hover:text-[var(--accent-orange)] transition-colors flex items-center gap-1"
          >
            Explore Full Gallery
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artworks.map((art) => (
            <article
              key={art.id}
              className="section-shell p-5 flex flex-col gap-4 bg-[var(--background)] hover:[box-shadow:var(--shadow-soft)] transition-all duration-500 group"
            >
              {/* Image Container */}
              <Link
                href={`/art/${art.slug}`}
                className="block relative aspect-[4/5] overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)]"
              >
                <Image
                  src={art.images?.[0] || '/images/artist-studio.png'}
                  alt={art.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-wider font-semibold border shadow-sm
                    ${art.status === 'AVAILABLE' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                    }
                  `}>
                    {getStatusLabel(art)}
                  </span>
                </div>
              </Link>

              {/* Text */}
              <div className="flex justify-between items-baseline gap-2">
                <h3 className="font-serif text-2xl truncate group-hover:text-[var(--accent-purple)] transition-colors">
                  <Link href={`/art/${art.slug}`}>{art.title}</Link>
                </h3>
                <span className="font-mono text-xs text-[var(--text-muted)]">{art.year}</span>
              </div>

              <p className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] -mt-2">
                {art.medium}
              </p>

              {/* Price & Action */}
              <div className="flex justify-between items-center border-t border-[var(--border-soft)] pt-4 mt-2">
                <span className="font-mono text-sm font-semibold text-[var(--foreground)]">
                  {art.status === 'AVAILABLE' ? `₦${art.price.toLocaleString()}` : 'Price on request'}
                </span>
                
                <Link
                  href={`/art/${art.slug}`}
                  className="px-4 py-2 border border-[var(--accent-primary)] text-[var(--accent-primary)] font-mono text-[10px] uppercase tracking-widest rounded-full hover:bg-[var(--accent-primary)] hover:text-white transition-all flex items-center gap-1"
                >
                  <Eye size={12} />
                  View Artwork
                </Link>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
export const dynamic = 'force-dynamic';
