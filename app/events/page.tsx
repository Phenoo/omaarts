'use client';

import Link from 'next/link';

export default function EventsPage() {
  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-[90vw] mx-auto pb-24">
        
        {/* HERO */}
        <div className="mb-24 border-b border-[#333] pb-12">
            <h1 className="font-serif text-6xl md:text-8xl text-[var(--accent-orange)] tracking-tight leading-[0.9] mb-8">
                WORKSHOPS &<br/>
                EXHIBITIONS
            </h1>
            <p className="font-sans text-xl opacity-70 max-w-2xl">
                Join our vibrant community. From casual evenings of wine and art to intensive masterclasses and gallery openings.
            </p>
        </div>

        {/* FEATURED EVENTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-32">
            
            {/* Event Type 1: Sip & Paint */}
            <div className="relative group">
                <div className="aspect-video bg-[#222] mb-6 overflow-hidden border border-[#333] group-hover:border-[var(--accent-purple)] transition-colors">
                     {/* Placeholder for event image */}
                     <div className="w-full h-full bg-gradient-to-br from-[#222] to-[#111] group-hover:scale-105 transition-transform duration-700" />
                </div>
                <h3 className="font-serif text-4xl mb-2 text-white group-hover:text-[var(--accent-purple)] transition-colors">Sip & Paint</h3>
                <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent-orange)] mb-4">Every Friday • 7PM - 10PM</p>
                <p className="font-sans opacity-70 mb-6 max-w-md">
                    Unwind with a glass of prosecco and a palette knife. No experience needed—just a willingness to get messy and have fun. Canvas and supplies provided.
                </p>
                <Link href="/contact" className="inline-block border-b border-white/30 pb-1 hover:border-[var(--accent-purple)] hover:text-[var(--accent-purple)] transition-colors">
                    Book a Spot →
                </Link>
            </div>

            {/* Event Type 2: Art Lessons */}
            <div className="relative group">
                <div className="aspect-video bg-[#222] mb-6 overflow-hidden border border-[#333] group-hover:border-[var(--accent-purple)] transition-colors">
                     {/* Placeholder for event image */}
                      <div className="w-full h-full bg-gradient-to-br from-[#222] to-[#111] group-hover:scale-105 transition-transform duration-700" />
                </div>
                <h3 className="font-serif text-4xl mb-2 text-white group-hover:text-[var(--accent-purple)] transition-colors">Studio Masterclass</h3>
                <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent-orange)] mb-4">Weekends • 10AM - 2PM</p>
                <p className="font-sans opacity-70 mb-6 max-w-md">
                    Intensive technical guidance on oil painting and mixed media textures. Designed for intermediate artists looking to refine their voice.
                </p>
                <Link href="/contact" className="inline-block border-b border-white/30 pb-1 hover:border-[var(--accent-purple)] hover:text-[var(--accent-purple)] transition-colors">
                    View Syllabus →
                </Link>
            </div>

        </div>

        {/* UPCOMING CALENDAR */}
        <section className="mb-32 max-w-4xl">
            <h2 className="font-mono text-sm uppercase tracking-widest text-[var(--accent-purple)] mb-12">Upcoming Dates</h2>
            <div className="space-y-4">
                {/* Item */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#333] pb-6 hover:bg-[#1A1A1A] transition-colors p-4 -mx-4 rounded-lg group">
                    <div>
                        <span className="block font-mono text-xs text-[var(--accent-orange)] mb-1">OCT 12</span>
                        <h4 className="font-serif text-2xl group-hover:text-[var(--accent-purple)] transition-colors">Lagos Heat: Opening Night</h4>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-8 items-center">
                        <span className="font-mono text-xs opacity-50">Exhibition</span>
                        <button className="px-6 py-2 border border-white/20 rounded-full font-mono text-xs uppercase hover:bg-white hover:text-black transition-colors">RSVP</button>
                    </div>
                </div>

                {/* Item */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#333] pb-6 hover:bg-[#1A1A1A] transition-colors p-4 -mx-4 rounded-lg group">
                    <div>
                        <span className="block font-mono text-xs text-[var(--accent-orange)] mb-1">OCT 15</span>
                        <h4 className="font-serif text-2xl group-hover:text-[var(--accent-purple)] transition-colors">Sip & Paint: Abstract Forms</h4>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-8 items-center">
                        <span className="font-mono text-xs opacity-50">Workshop</span>
                        <button className="px-6 py-2 border border-white/20 rounded-full font-mono text-xs uppercase hover:bg-white hover:text-black transition-colors">Book $45</button>
                    </div>
                </div>

                {/* Item */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#333] pb-6 hover:bg-[#1A1A1A] transition-colors p-4 -mx-4 rounded-lg group">
                    <div>
                        <span className="block font-mono text-xs text-[var(--accent-orange)] mb-1">NOV 01</span>
                        <h4 className="font-serif text-2xl group-hover:text-[var(--accent-purple)] transition-colors">Texture Masterclass (Day 1)</h4>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-8 items-center">
                        <span className="font-mono text-xs opacity-50">Lesson</span>
                        <button className="px-6 py-2 border border-white/20 rounded-full font-mono text-xs uppercase hover:bg-white hover:text-black transition-colors">Waitlist</button>
                    </div>
                </div>
            </div>
        </section>

      </div>
    </main>
  );
}
