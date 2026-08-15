'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getActivities } from '@/lib/firebase/services/activities';
import { Activity } from '@/lib/types';
import { Search, Filter, RefreshCw, Sparkles, MapPin } from 'lucide-react';
import Footer from '@/components/Footer';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchListings = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getActivities(true); // only active
      setActivities(data);
    } catch (e) {
      console.error('Failed to load activities:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const categories = ['all', 'Painting', 'Crafts', 'Sculpting', 'Body Art', 'Entertainment'];

  const filtered = activities.filter((act) => {
    const matchesSearch = act.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || act.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <div className="max-w-[90vw] mx-auto pb-24 w-full flex-grow">
        
        {/* Page Header */}
        <div className="section-shell p-8 md:p-10 mb-12 bg-white/70">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--accent-orange)] mb-3">
            Experiences
          </p>
          <h1 className="font-serif text-5xl md:text-7xl tracking-tight leading-[0.9]">
            Creative Activities
          </h1>
          <p className="mt-5 max-w-2xl text-[var(--text-muted)] text-base md:text-lg leading-relaxed">
            Discover creative sessions, custom art castings, bead stringing, and entertainment experiences at ABO Gallery. Fully led by Oma and our studio instructors.
          </p>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex flex-col md:flex-row gap-5 justify-between items-center mb-12 bg-white/50 border border-[var(--border-soft)] p-4 rounded-2xl">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search experiences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[var(--border-soft)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent-purple)] font-sans"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 justify-center w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider border transition-all cursor-pointer
                  ${selectedCategory === cat 
                    ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)] font-bold' 
                    : 'bg-white text-[var(--text-muted)] border-[var(--border-soft)] hover:border-[var(--accent-purple)] hover:text-[var(--accent-purple)]'
                  }
                `}
              >
                {cat === 'all' ? 'All Activities' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="section-shell p-5 flex flex-col gap-4 animate-pulse bg-white/50">
                <div className="aspect-video w-full bg-gray-200 rounded-xl" />
                <div className="h-6 w-3/4 bg-gray-200 rounded-md" />
                <div className="h-4 w-1/2 bg-gray-200 rounded-md" />
                <div className="h-10 w-full bg-gray-200 rounded-full mt-2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="section-shell p-12 text-center max-w-md mx-auto my-12 bg-white flex flex-col gap-4 items-center">
            <p className="text-red-500 font-mono text-sm">Failed to connect to the database.</p>
            <button
              onClick={fetchListings}
              className="px-6 py-2 bg-[var(--accent-purple)] text-white rounded-full font-mono text-xs uppercase tracking-widest hover:bg-[var(--accent-orange)] flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={14} />
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filtered.length === 0 && (
          <div className="section-shell p-16 text-center max-w-md mx-auto my-12 bg-white flex flex-col gap-4 items-center">
            <h2 className="font-serif text-2xl">No experiences found</h2>
            <p className="font-sans text-sm text-[var(--text-muted)]">No active activities match your selected query or filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-6 py-2.5 border border-[var(--accent-purple)] text-[var(--accent-purple)] rounded-full font-mono text-xs uppercase tracking-widest hover:bg-[var(--accent-purple)] hover:text-white transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Activities Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((act) => {
              // Calculate "starting from" price
              let startingPriceText = '';
              if (act.pricingModel === 'BOOKING_ONLY') {
                startingPriceText = 'Booking Only';
              } else if (act.pricingModel === 'CUSTOM_QUOTE') {
                startingPriceText = 'Enquiry Only';
              } else {
                const base = act.variants.length > 0 
                  ? Math.min(...act.variants.map((v) => v.price)) 
                  : act.basePrice;
                startingPriceText = `₦${base.toLocaleString()}${act.priceUnit ? ` / ${act.priceUnit}` : ''}`;
              }

              return (
                <article
                  key={act.id}
                  className="section-shell p-5 flex flex-col justify-between gap-5 bg-white/80 hover:[box-shadow:var(--shadow-soft)] transition-all duration-500 group"
                >
                  <div className="flex flex-col gap-4">
                    {/* Image */}
                    <Link href={`/activities/${act.slug}`} className="block relative aspect-[4/3] rounded-xl overflow-hidden border border-[var(--border-soft)] bg-[var(--surface-soft)]">
                      <Image
                        src={act.images && act.images[0] ? act.images[0] : '/images/studio/IMG_0890.png'}
                        alt={act.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {act.featured && (
                        <div className="absolute top-3 left-3 bg-white/95 text-[var(--accent-secondary)] px-2.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-wider font-semibold border border-[var(--border-soft)] shadow-sm flex items-center gap-1">
                          <Sparkles size={10} className="text-[var(--accent-orange)]" />
                          Popular
                        </div>
                      )}
                    </Link>

                    {/* Metadata */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <h2 className="font-serif text-2xl leading-tight group-hover:text-[var(--accent-purple)] transition-colors">
                          {act.name}
                        </h2>
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)] bg-[var(--surface-soft)] px-2 py-0.5 rounded-full">
                          {act.duration}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent-orange)]">
                        {act.category}
                      </span>
                    </div>

                    <p className="font-sans text-sm text-[var(--text-muted)] leading-relaxed line-clamp-3">
                      {act.shortDescription || act.description}
                    </p>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex justify-between items-center border-t border-[var(--border-soft)] pt-4 mt-2">
                    <div className="flex flex-col">
                      <span className="font-sans text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Starting From</span>
                      <span className="font-sans text-xl md:text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
                        {startingPriceText}
                      </span>
                    </div>
                    <Link
                      href={`/activities/${act.slug}`}
                      className="px-5 py-2.5 rounded-full bg-[var(--accent-purple)] text-white font-mono text-[10px] uppercase tracking-widest font-black hover:bg-[var(--accent-orange)] hover:scale-105 transition-all shadow-sm"
                    >
                      Book Now
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
      <Footer />
    </main>
  );
}
export const dynamic = 'force-dynamic';
