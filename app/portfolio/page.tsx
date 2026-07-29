'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getArtworks, getArtworkCategories } from '@/lib/firebase/services/artworks';
import { Artwork, Category } from '@/lib/types';
import { Filter, Eye, RefreshCw, ShoppingCart } from 'lucide-react';
import Footer from '@/components/Footer';

export default function PortfolioPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const artData = await getArtworks();
      setArtworks(artData);
      const catData = await getArtworkCategories();
      setCategories(catData);
    } catch (e) {
      console.error('Failed to load portfolio items:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = artworks.filter((art) => {
    const matchesCat = selectedCategory === 'all' || art.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'available' && art.status === 'AVAILABLE') ||
      (selectedStatus === 'sold' && art.status === 'SOLD') ||
      (selectedStatus === 'commissioned' && art.status === 'COMMISSIONED') ||
      (selectedStatus === 'portfolio' && art.status === 'PORTFOLIO_ONLY');
    return matchesCat && matchesStatus;
  });

  const getStatusBadgeClass = (status: Artwork['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'SOLD':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'COMMISSIONED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'RESERVED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PORTFOLIO_ONLY':
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <div className="max-w-[90vw] mx-auto pb-24 w-full flex-grow">
        
        {/* Header */}
        <div className="section-shell p-8 md:p-10 mb-12 bg-white/70">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--accent-orange)] mb-3">
            Studio Portfolio
          </p>
          <h1 className="font-serif text-5xl md:text-7xl tracking-tight leading-[0.9]">
            Interior Artworks
          </h1>
          <p className="mt-5 max-w-2xl text-[var(--text-muted)] text-base md:text-lg leading-relaxed">
            A premium collection of original paintings and mixed media works by Oma Achebe. Open any piece to view the story, specifications, and purchase details.
          </p>
        </div>

        {/* Filters control bar */}
        <div className="flex flex-col md:flex-row gap-5 justify-between items-start md:items-center mb-12 bg-white/50 border border-[var(--border-soft)] p-5 rounded-2xl">
          {/* Categories */}
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
              <Filter size={10} />
              Category
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider border transition-all cursor-pointer
                  ${selectedCategory === 'all' 
                    ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)] font-bold' 
                    : 'bg-white text-[var(--text-muted)] border-[var(--border-soft)] hover:border-[var(--accent-purple)] hover:text-[var(--accent-purple)]'
                  }
                `}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider border transition-all cursor-pointer
                    ${selectedCategory === cat.id 
                      ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)] font-bold' 
                      : 'bg-white text-[var(--text-muted)] border-[var(--border-soft)] hover:border-[var(--accent-purple)] hover:text-[var(--accent-purple)]'
                    }
                  `}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Availability</span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', name: 'All Works' },
                { id: 'available', name: 'For Sale' },
                { id: 'sold', name: 'Sold' },
                { id: 'commissioned', name: 'Commissioned' },
                { id: 'portfolio', name: 'Exhibition' }
              ].map((status) => (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => setSelectedStatus(status.id)}
                  className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider border transition-all cursor-pointer
                    ${selectedStatus === status.id 
                      ? 'bg-[var(--accent-orange)] text-white border-[var(--accent-orange)] font-bold' 
                      : 'bg-white text-[var(--text-muted)] border-[var(--border-soft)] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)]'
                    }
                  `}
                >
                  {status.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="section-shell p-5 flex flex-col gap-4 animate-pulse bg-white/50">
                <div className="aspect-[4/5] w-full bg-gray-200 rounded-xl" />
                <div className="h-6 w-3/4 bg-gray-200 rounded-md" />
                <div className="h-4 w-1/4 bg-gray-200 rounded-md" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="section-shell p-12 text-center max-w-md mx-auto my-12 bg-white flex flex-col gap-4 items-center">
            <p className="text-red-500 font-mono text-sm">Failed to connect to the database.</p>
            <button
              onClick={loadData}
              className="px-6 py-2 bg-[var(--accent-purple)] text-white rounded-full font-mono text-xs uppercase tracking-widest hover:bg-[var(--accent-orange)] flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={14} />
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="section-shell p-16 text-center max-w-md mx-auto my-12 bg-white flex flex-col gap-4 items-center">
            <h2 className="font-serif text-2xl">No artwork found</h2>
            <p className="font-sans text-sm text-[var(--text-muted)]">No portfolio entries match the current filter selection.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="px-6 py-2 border border-[var(--accent-purple)] text-[var(--accent-purple)] rounded-full font-mono text-xs uppercase tracking-widest hover:bg-[var(--accent-purple)] hover:text-white transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Artworks Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((art) => (
              <article
                key={art.id}
                className="section-shell p-5 flex flex-col gap-4 bg-white/80 hover:[box-shadow:var(--shadow-soft)] transition-all duration-500 group"
              >
                {/* Image */}
                <Link href={`/portfolio/${art.slug}`} className="block relative aspect-[4/5] overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)]">
                  <Image
                    src={art.images && art.images[0] ? art.images[0] : '/images/artist-studio.png'}
                    alt={art.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Status Overlay */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-wider font-semibold border shadow-sm ${getStatusBadgeClass(art.status)}`}>
                      {art.status.replace('_', ' ')}
                    </span>
                  </div>
                </Link>

                {/* Details */}
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-serif text-2xl leading-tight group-hover:text-[var(--accent-purple)] transition-colors truncate">
                    {art.title}
                  </h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)] flex-shrink-0">
                    {art.year}
                  </span>
                </div>

                <p className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider -mt-2">
                  {art.medium}
                </p>

                {/* Price and Action */}
                <div className="flex justify-between items-center border-t border-[var(--border-soft)] pt-4 mt-2">
                  <span className="font-mono text-sm font-semibold text-[var(--foreground)]">
                    {art.status === 'AVAILABLE' ? `₦${art.price.toLocaleString()}` : 'Price on Request'}
                  </span>
                  
                  <Link
                    href={`/portfolio/${art.slug}`}
                    className="px-4 py-2 border border-[var(--accent-primary)] text-[var(--accent-primary)] font-mono text-[10px] uppercase tracking-[0.14em] rounded-full hover:bg-[var(--accent-primary)] hover:text-white hover:scale-105 transition-all flex items-center gap-1.5"
                  >
                    <Eye size={12} />
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
      <Footer />
    </main>
  );
}
export const dynamic = 'force-dynamic';
