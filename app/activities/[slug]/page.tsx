'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getActivityBySlug, getActivities } from '@/lib/firebase/services/activities';
import { Activity } from '@/lib/types';
import BookingForm from '@/components/ui/BookingForm';
import { ArrowLeft, Clock, Gift, ShieldAlert, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import Footer from '@/components/Footer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ActivityDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [similar, setSimilar] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      setError(false);
      try {
        const item = await getActivityBySlug(slug);
        if (item) {
          setActivity(item);
          // Fetch similar activities
          const all = await getActivities(true);
          const others = all.filter((a) => a.id !== item.id).slice(0, 3);
          setSimilar(others);
        } else {
          setActivity(null);
        }
      } catch (e) {
        console.error('Failed to load activity detail:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-32 min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center font-mono text-xs uppercase tracking-widest text-[var(--text-muted)] flex flex-col gap-4 items-center">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-purple)] border-t-transparent animate-spin" />
          Loading activity details...
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
        <div className="max-w-[90vw] mx-auto pb-24 w-full flex-grow flex items-center justify-center">
          <div className="section-shell p-10 text-center max-w-md bg-white">
            <ShieldAlert className="mx-auto text-red-500 mb-4" size={40} />
            <h2 className="font-serif text-2xl mb-2">Activity Not Found</h2>
            <p className="font-sans text-sm text-[var(--text-muted)] mb-6">
              The requested experience does not exist or has been archived.
            </p>
            <Link href="/activities" className="px-6 py-2.5 bg-[var(--accent-purple)] text-white rounded-full font-mono text-xs uppercase tracking-widest hover:bg-[var(--accent-orange)] transition-colors">
              Return to Catalog
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <div className="max-w-[90vw] mx-auto pb-24 w-full flex-grow">
        
        {/* Navigation */}
        <Link href="/activities" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent-purple)] transition-colors mb-8">
          <ArrowLeft size={14} />
          All Experiences
        </Link>

        {/* Hero Banner */}
        <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden border border-[var(--border-soft)] mb-12 bg-[var(--surface-soft)]">
          <Image
            src={activity.images && activity.images[0] ? activity.images[0] : '/images/artist-studio.png'}
            alt={activity.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent-orange)] font-semibold bg-black/45 px-3 py-1 rounded-full w-fit">
              {activity.category}
            </span>
            <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-none drop-shadow-md">
              {activity.name}
            </h1>
          </div>
        </div>

        {/* Two Column details & form */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start mb-24">
          
          {/* Left info column */}
          <div className="lg:col-span-3 flex flex-col gap-10">
            {/* Description */}
            <div className="flex flex-col gap-4">
              <h2 className="font-serif text-3xl text-[var(--accent-purple)]">The Experience</h2>
              <p className="font-sans text-base md:text-lg text-[var(--foreground)]/80 leading-relaxed">
                {activity.description}
              </p>
            </div>

            {/* Quick specifications */}
            <div className="grid grid-cols-2 gap-4 border-y border-[var(--border-soft)] py-6 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
              <div className="flex items-center gap-2.5">
                <Clock className="text-[var(--accent-orange)]" size={18} />
                <div>
                  <span className="block text-[9px] opacity-60">Duration</span>
                  <span className="text-sm font-semibold text-[var(--foreground)] mt-0.5 block">{activity.duration}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Gift className="text-[var(--accent-orange)]" size={18} />
                <div>
                  <span className="block text-[9px] opacity-60">Included Extras</span>
                  <span className="text-sm font-semibold text-[var(--foreground)] mt-0.5 block">Complimentary drinks</span>
                </div>
              </div>
            </div>

            {/* What's Included */}
            {activity.complimentaryItems && activity.complimentaryItems.length > 0 && (
              <div className="flex flex-col gap-4">
                <h3 className="font-serif text-2xl text-[var(--accent-purple)]">What&apos;s Included</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {activity.complimentaryItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-[var(--foreground)]/80">
                      <CheckCircle2 size={16} className="text-[var(--accent-orange)] mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Complimentary terms */}
            {activity.complimentaryText && (
              <div className="p-5 rounded-2xl border border-[var(--border-soft)] bg-white/70 flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-[var(--surface-soft)] flex items-center justify-center text-[var(--accent-purple)] flex-shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <span className="block font-serif text-base font-semibold">{activity.complimentaryText}</span>
                  <span className="block font-sans text-xs text-[var(--text-muted)]">Enjoy complimentary drinks, background jams, and card games alongside your session.</span>
                </div>
              </div>
            )}

            {/* Expectations / FAQs */}
            <div className="flex flex-col gap-6">
              <h3 className="font-serif text-2xl text-[var(--accent-purple)]">What to Expect</h3>
              <div className="space-y-4 text-sm text-[var(--text-muted)] leading-relaxed font-sans">
                <p>
                  <strong>Do I need painting experience?</strong> No experience is required! Our resident artist Oma or our class helpers guide you step-by-step to paint a masterpiece.
                </p>
                <p>
                  <strong>What should I wear?</strong> We provide protective aprons, but acrylic paint does not wash out of clothes easily. We recommend wearing comfortable clothes you don&apos;t mind getting dirty.
                </p>
                <p>
                  <strong>Can I bring snacks?</strong> Absolutely! We support bringing personal bites or sharing finger foods with your booking party.
                </p>
              </div>
            </div>
          </div>

          {/* Right booking form column */}
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <BookingForm activity={activity} />
          </div>

        </div>

        {/* Similar Experiences */}
        {similar.length > 0 && (
          <section className="border-t border-[var(--border-soft)] pt-16">
            <h2 className="font-serif text-3xl mb-8 text-[var(--accent-purple)]">Other Creative Experiences</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similar.map((sim) => (
                <Link
                  href={`/activities/${sim.slug}`}
                  key={sim.id}
                  className="section-shell p-4 bg-white/80 hover:[box-shadow:var(--shadow-soft)] transition-all duration-300 group flex flex-col gap-4"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-[var(--border-soft)]">
                    <Image src={sim.images?.[0] || '/images/artist-studio.png'} alt={sim.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-serif text-lg font-semibold truncate group-hover:text-[var(--accent-purple)] transition-colors">{sim.name}</h3>
                    <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="font-sans text-xs text-[var(--text-muted)] line-clamp-2">{sim.shortDescription || sim.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
      <Footer />
    </main>
  );
}
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
