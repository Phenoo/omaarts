'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getActivities } from '@/lib/firebase/services/activities';
import { Activity } from '@/lib/types';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function FeaturedActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const all = await getActivities(true);
        // Take featured first, fallback to sorted list
        const featured = all.filter((a) => a.featured).slice(0, 6);
        if (featured.length > 0) {
          setActivities(featured);
        } else {
          setActivities(all.slice(0, 6));
        }
      } catch (e) {
        console.error('Failed to load featured activities:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading || activities.length === 0) {
    return null; // Silent load on home page
  }

  return (
    <section className="w-full py-24 bg-[var(--surface-soft)] border-t border-b border-[var(--border-soft)]">
      <div className="max-w-[90vw] mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent-orange)] mb-2">Experiences</p>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight text-[var(--foreground)]">
              Popular Activities
            </h2>
          </div>
          <Link
            href="/activities"
            className="font-mono text-xs uppercase tracking-widest text-[var(--accent-purple)] hover:text-[var(--accent-orange)] transition-colors flex items-center gap-1"
          >
            View All Activities
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((act) => {
            let startPriceText = '';
            if (act.pricingModel === 'BOOKING_ONLY') {
              startPriceText = 'Booking only';
            } else if (act.pricingModel === 'CUSTOM_QUOTE') {
              startPriceText = 'Enquiry only';
            } else {
              const base = act.variants.length > 0
                ? Math.min(...act.variants.map((v) => v.price))
                : act.basePrice;
              startPriceText = `₦${base.toLocaleString()}`;
            }

            return (
              <div
                key={act.id}
                className="flex flex-col justify-between gap-4 p-4 border border-[var(--border-soft)] rounded-2xl bg-white hover:[box-shadow:var(--shadow-soft)] hover:border-[var(--accent-primary)] transition-all duration-500 group"
              >
                <div>
                  {/* Image */}
                  <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-[var(--border-soft)] mb-4 bg-[var(--surface-soft)]">
                    <Image
                      src={act.images?.[0] || '/images/artist-studio.png'}
                      alt={act.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {act.featured && (
                      <div className="absolute top-2 left-2 bg-white/95 text-[9px] font-mono uppercase tracking-wider font-semibold text-[var(--accent-secondary)] px-2 py-0.5 rounded-full border border-[var(--border-soft)] shadow-sm flex items-center gap-0.5">
                        <Sparkles size={10} className="text-[var(--accent-orange)]" />
                        Popular
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-serif text-2xl text-[var(--foreground)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1">
                    {act.name}
                  </h3>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--accent-orange)] mt-1 mb-3">
                    {act.category} • {act.duration}
                  </p>
                  <p className="font-sans text-sm text-[var(--text-muted)] leading-relaxed line-clamp-2">
                    {act.shortDescription || act.description}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-[var(--border-soft)] pt-4 mt-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-sans uppercase tracking-widest text-[var(--text-muted)]">Starting from</span>
                    <span className="font-mono text-sm font-semibold text-[var(--foreground)]">{startPriceText}</span>
                  </div>
                  <Link
                    href={`/activities/${act.slug}`}
                    className="px-4 py-2 bg-[var(--accent-purple)] text-white font-mono text-[10px] uppercase tracking-widest rounded-full hover:bg-[var(--accent-orange)] transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
export const dynamic = 'force-dynamic';
