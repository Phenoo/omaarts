'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-[800px] mx-auto px-6 pb-24">
        
        {/* 1. Intro / Artist Statement */}
        <section className="mb-20 text-center">
            <h1 className="font-serif text-5xl md:text-7xl mb-8 text-[var(--accent-purple)] tracking-tighter mix-blend-screen">
                I am a multidisciplinary artist exploring memory, identity, and the vibrant chaos of Lagos through mixed media and aggressive color.
            </h1>
            <p className="font-mono text-sm uppercase tracking-widest opacity-60">
                Oil • Acrylic • Digital • Installation
            </p>
        </section>

        {/* 2. Portrait */}
        <section className="mb-20">
            <div className="aspect-[4/3] relative w-full overflow-hidden mb-4">
                <Image
                    src="/images/artist-portrait.jpg"
                    alt="Oma Achebe Portrait"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
            <p className="font-mono text-xs text-center opacity-50">Photographed in Lagos Studio, 2025</p>
        </section>

        {/* 3. Longer Bio (The Story) */}
        <section className="mb-20">
            <h2 className="font-mono text-sm uppercase tracking-widest text-[var(--accent-orange)] mb-8">The Story</h2>
            <div className="space-y-6 font-sans text-lg leading-relaxed opacity-90">
                <p>
                    I was born in 1998 in Lagos, Nigeria, a city that assaults the senses in the most beautiful way. Growing up, I was surrounded by the rhythmic clash of traditional pattern and modern concrete. This duality became the foundation of my visual language.
                </p>
                <p>
                    After training at the Slade School of Fine Art in London, I returned home to reclaim my narrative. My earlier work was quiet and minimalist, a result of academic conditioning. But Lagos doesn&apos;t whisper. It screams.
                </p>
                <p>
                    Today, my work embraces <strong>radical vibrancy</strong>. I use color not just as decoration, but as a political statement—a reclaiming of space, joy, and visibility in a world that often demands silence.
                </p>
            </div>
        </section>

        {/* 4. Artistic Process */}
        <section className="mb-20">
            <h2 className="font-mono text-sm uppercase tracking-widest text-[var(--accent-purple)] mb-8">The Process</h2>
            <div className="space-y-6 font-sans text-lg leading-relaxed opacity-90">
                <p>
                    My process is a physical dialogue with the canvas. It often begins with chaotic, gestural charcoal sketches—capturing the raw energy of a fleeting thought.
                </p>
                <p>
                    From there, I layer oil and acrylics, scraping back paint to reveal the history underneath. I treat digital tools the same way, breaking pixels to find the ghost in the machine. It&apos;s about finding the balance between control and surrender.
                </p>
            </div>
        </section>

        {/* 5. Experience / Highlights */}
        <section className="mb-20">
            <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500 mb-8">Experience</h2>
            <ul className="space-y-4 font-mono text-sm">
                <li className="flex flex-col md:flex-row md:justify-between border-b border-[#333] pb-4">
                    <span className="text-[var(--accent-purple)]">2025 — Neon Ancestors</span>
                    <span className="opacity-60">Serpentine Gallery, London (Solo)</span>
                </li>
                <li className="flex flex-col md:flex-row md:justify-between border-b border-[#333] pb-4">
                    <span className="text-[var(--accent-purple)]">2024 — Lagos Noise</span>
                    <span className="opacity-60">Rele Gallery, Lagos (Solo)</span>
                </li>
                <li className="flex flex-col md:flex-row md:justify-between border-b border-[#333] pb-4">
                    <span className="text-[var(--accent-purple)]">2023 — Digital Masquerade</span>
                    <span className="opacity-60">1-54 Art Fair, New York (Group)</span>
                </li>
            </ul>
        </section>

        {/* 6. Services / Availability */}
        <section className="mb-20 bg-[#1A1A1A] p-8 -mx-8 md:rounded-lg">
            <h2 className="font-mono text-sm uppercase tracking-widest text-[var(--accent-orange)] mb-4">Availability</h2>
            <p className="font-sans text-lg mb-6 opacity-90">
                I accept a limited number of commissions per year, focusing on large-scale residential pieces and brand collaborations that align with my ethos.
            </p>
            <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-[var(--accent-purple)] rounded-full animate-pulse"></div>
                <span className="font-mono text-xs uppercase tracking-widest">Booking Late 2026</span>
            </div>
            <Link href="/contact" className="inline-block mt-8 text-[var(--accent-orange)] border-b border-[var(--accent-orange)] font-mono text-sm uppercase tracking-widest hover:text-white hover:border-white transition-colors">
                Let&apos;s Discuss a Project
            </Link>
        </section>

        {/* 7. Personal Touch */}
        <section className="mb-12">
            <h2 className="font-mono text-sm uppercase tracking-widest text-[var(--accent-purple)] mb-8">Beyond the Canvas</h2>
            <p className="font-sans text-lg leading-relaxed opacity-90">
                When I&apos;m not in the studio covered in paint, you can find me hunting for vintage Afrobeat vinyls in Yaba or hiking the hills of Idanre. I believe that to create honest art, you must live a life worth documenting.
            </p>
        </section>

      </div>
    </main>
  );
}
