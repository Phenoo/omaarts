'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const EVENTS = [
  { location: 'STUDIO', date: 'EVERY FRI', name: 'SIP & PAINT' },
  { location: 'BERLIN', date: 'OCT 12 — NOV 04', name: 'THE VOID STARING BACK' },
  { location: 'ONLINE', date: 'WEEKENDS', name: 'ART LESSONS' },
  { location: 'NEW YORK', date: 'JAN 15 — FEB 10', name: 'ACID HORIZON' },
];

export default function EventsTicker() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackRef.current) return;

    // Clone content for seamless loop
    // Or just use a long enough list and animate x percent
    // GSAP infinite loop helper is ideal, but simple tweens work too.
    
    // Simple infinite marquee
    const track = trackRef.current;
    
    const totalWidth = track.scrollWidth;
    const parentWidth = track.parentElement?.offsetWidth || 0;
    
    // If content is not wide enough, we might need duplication, but assuming it is for now or just standard marquee
    // Let's create a basic loop
    
    gsap.to(track, {
      xPercent: -50, // Move by half its width if we duplicated content
      ease: "none",
      duration: 20,
      repeat: -1,
    });

  }, []);

  return (
    <section className="relative w-full py-12 bg-[#0a0a0a] overflow-hidden border-t-2 border-[var(--accent-purple)]">
      <div className="flex whitespace-nowrap" ref={wrapperRef}>
         <div ref={trackRef} className="flex gap-16 text-[#F9F9F9] font-mono text-4xl uppercase tracking-tighter">
            {/* Render items twice for loop */}
            {[...EVENTS, ...EVENTS, ...EVENTS].map((event, i) => (
                <div key={i} className="flex items-center gap-4">
                    <span className="text-[var(--accent-orange)]">•</span>
                    <span>{event.name}</span>
                    <span className="opacity-50 text-base align-top">[{event.location} {'//'} {event.date}]</span>
                </div>
            ))}
         </div>
      </div>
    </section>
  );
}
