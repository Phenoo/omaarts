"use client";

import Image from "next/image";

export default function AboutSnippet() {
  return (
    <section className="w-full py-24 text-[var(--foreground)]">
      <div className="max-w-[90vw] mx-auto section-shell noise-soft p-8 md:p-12 flex flex-col md:flex-row gap-16 items-center">
        <div className="w-full md:w-1/2">
          <h2 className="font-mono text-sm uppercase tracking-widest mb-6 text-[var(--accent-purple)]">
            About the Artist
          </h2>
          <h3 className="font-serif text-4xl md:text-5xl leading-tight mb-8">
            Colors that speak the language of heritage.
          </h3>
          <div className="space-y-4 font-sans text-lg leading-relaxed text-[var(--text-muted)]">
            <p>
              Oma Achebe is a Nigerian contemporary artist based in Awka,
              Anambra State. She works primarily with acrylics and mixed media,
              exploring cultural identity, womanhood, and resilience.
            </p>
            <p>
              Her work is inspired by Igbo traditions, everyday life, and the
              dialogue between history and modernity.
            </p>
          </div>
          <a
            href="/about"
            className="inline-flex mt-8 border border-[var(--accent-purple)] px-5 py-2 rounded-full font-mono text-xs uppercase tracking-[0.15em] text-[var(--accent-purple)] hover:bg-[var(--accent-purple)] hover:text-white transition-colors"
          >
            Read Full Bio
          </a>
        </div>

        <div className="w-full md:w-1/2 aspect-video relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)]">
          <Image
            src="/images/artist-portrait.jpg"
            alt="Oma Achebe Portrait"
            fill
            className="object-cover object-[center_18%] transition-all duration-700"
          />
        </div>
      </div>
    </section>
  );
}
