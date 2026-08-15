'use client';

import Image from 'next/image';
import Link from 'next/link';
import { STUDIO_IMAGES } from '@/lib/studioImages';

export default function AboutPage() {
  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-[800px] mx-auto px-6 pb-24">
        
        {/* 1. Intro / Artist Statement */}
        <section className="mb-20 text-center">
            <h1 className="font-serif text-5xl md:text-7xl mb-8 text-[var(--foreground)] tracking-tighter">
                I am a Nigerian contemporary artist exploring cultural identity, womanhood, and resilience through bold color and layered texture.
            </h1>
            <p className="font-mono text-sm uppercase tracking-widest opacity-60">
                Acrylic • Mixed Media • Contemporary Practice
            </p>
        </section>

        {/* 2. Portrait */}
        <section className="mb-20">
            <div className="aspect-[4/3] relative w-full overflow-hidden mb-4">
                <Image
                    src="/images/about-me.jpg"
                    alt="Oma Achebe Portrait"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
            <p className="font-mono text-xs text-center opacity-50">Photographed in Awka Studio, 2025</p>
        </section>

        {/* 3. Studio */}
        <section className="mb-20">
            <div className="mb-8">
                <p className="font-mono text-sm uppercase tracking-widest text-[var(--accent-orange)]">The Studio</p>
                <h2 className="mt-3 font-serif text-4xl tracking-tight md:text-5xl">Come into the room where it happens.</h2>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed opacity-80">Artsy by Oma is a colorful, welcoming creative studio in Awka for original work, guided sessions, and private gatherings.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl md:row-span-2">
                    <Image src={STUDIO_IMAGES.primary} alt="Colorful mural and art materials in the Artsy by Oma studio" fill sizes="(max-width: 768px) 92vw, 45vw" className="object-cover" />
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image src={STUDIO_IMAGES.front} alt="Paint-and-sip seating at the Artsy by Oma studio" fill sizes="(max-width: 768px) 92vw, 35vw" className="object-cover" />
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image src={STUDIO_IMAGES.room} alt="Artwork and seating inside the Artsy by Oma studio" fill sizes="(max-width: 768px) 92vw, 35vw" className="object-cover" />
                </div>
            </div>
        </section>

        {/* 4. Longer Bio (The Story) */}
        <section className="mb-20">
            <h2 className="font-mono text-sm uppercase tracking-widest text-[var(--accent-orange)] mb-8">The Story</h2>
            <div className="space-y-6 font-sans text-lg leading-relaxed opacity-90">
                <p>
                    Oma Achebe is a Nigerian contemporary artist based in Awka, Anambra State. She works primarily with acrylics and mixed media, building images through layered textures, movement, and expressive color.
                </p>
                <p>
                    Her work draws inspiration from Igbo traditions, everyday life, and the dialogue between history and modernity. Across each piece, she examines themes of cultural identity, womanhood, and resilience.
                </p>
                <p>
                    Through this practice, Oma continues to create work that bridges heritage and contemporary expression while reflecting her journey as both artist and entrepreneur.
                </p>
            </div>
        </section>

        {/* 4. Artistic Process */}
        <section className="mb-20">
            <h2 className="font-mono text-sm uppercase tracking-widest text-[var(--accent-purple)] mb-8">The Process</h2>
            <div className="space-y-6 font-sans text-lg leading-relaxed opacity-90">
                <p>
                    Oma&apos;s process combines intuitive mark-making with deliberate layering. She builds surfaces gradually, allowing color, texture, and shape to carry both emotional energy and cultural memory.
                </p>
                <p>
                    Working mostly in acrylics and mixed media, she moves between experimentation and structure to produce pieces that feel grounded in place yet open to contemporary interpretation.
                </p>
            </div>
        </section>

        {/* 5. Experience / Highlights */}
        <section className="mb-20">
            <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500 mb-8">Experience</h2>
            <ul className="space-y-4 font-mono text-sm">
                <li className="flex flex-col md:flex-row md:justify-between border-b border-[var(--border-soft)] pb-4">
                    <span className="text-[var(--accent-purple)]">Community Art Showcases</span>
                    <span className="opacity-60">Featured in local and community art events</span>
                </li>
                <li className="flex flex-col md:flex-row md:justify-between border-b border-[var(--border-soft)] pb-4">
                    <span className="text-[var(--accent-purple)]">Paint and Splash Fiesta</span>
                    <span className="opacity-60">Host of an interactive art experience in Awka</span>
                </li>
            </ul>
        </section>

        {/* 6. Services / Availability */}
        <section className="mb-20 bg-[var(--surface-soft)] p-8 -mx-8 md:rounded-lg">
            <h2 className="font-mono text-sm uppercase tracking-widest text-[var(--accent-orange)] mb-4">Availability</h2>
            <p className="font-sans text-lg mb-6 opacity-90">
                I accept a limited number of commissions per year, focusing on large-scale residential pieces and brand collaborations that align with my ethos.
            </p>
            <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-[var(--accent-purple)] rounded-full animate-pulse"></div>
                <span className="font-mono text-xs uppercase tracking-widest">Booking Late 2026</span>
            </div>
            <Link href="/contact" className="inline-block mt-8 text-[var(--accent-orange)] border-b border-[var(--accent-orange)] font-mono text-sm uppercase tracking-widest hover:text-[var(--accent-purple)] hover:border-[var(--accent-purple)] transition-colors">
                Let&apos;s Discuss a Project
            </Link>
        </section>

        {/* 7. Personal Touch */}
        <section className="mb-12">
            <h2 className="font-mono text-sm uppercase tracking-widest text-[var(--accent-purple)] mb-8">Beyond the Canvas</h2>
            <p className="font-sans text-lg leading-relaxed opacity-90">
                Through collaborative events and interactive experiences, Oma invites diverse audiences into her creative world and expands how people engage with contemporary art.
            </p>
        </section>

      </div>
    </main>
  );
}
