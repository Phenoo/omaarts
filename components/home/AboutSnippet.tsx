"use client";

import Image from "next/image";

export default function AboutSnippet() {
  return (
    <section className="w-full py-24 bg-[#F9F9F9] text-[#1A1A1A]">
      <div className="max-w-[90vw] mx-auto flex flex-col md:flex-row gap-16 items-center">
        <div className="w-full md:w-1/2">
          <h2 className="font-mono text-sm uppercase tracking-widest mb-6 text-[var(--accent-purple)]">
            About the Artist
          </h2>
          <h3 className="font-serif text-4xl md:text-5xl leading-tight mb-8">
            Colors that speak the language of heritage.
          </h3>
          <div className="space-y-4 font-sans text-lg leading-relaxed text-[#1A1A1A]/80">
            <p>
              Oma Achebe is a Nigerian artist whose work vibrates with the
              energy of Lagos. Her palette is a celebration of life, blending
              traditional motifs with contemporary abstraction.
            </p>
            <p>
              She explores themes of identity and joy through bold, unapologetic
              color.
            </p>
          </div>
          <a
            href="/about"
            className="inline-block mt-8 border-b border-[#1A1A1A] pb-1 font-mono text-xs uppercase hover:text-[var(--accent-orange)] hover:border-[var(--accent-orange)] transition-colors"
          >
            Read Full Bio
          </a>
        </div>

        <div className="w-full md:w-1/2 aspect-video relative overflow-hidden bg-gray-200">
          <Image
            src="/images/artist-studio.png"
            alt="Oma Achebe Studio"
            fill
            className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
          />
        </div>
      </div>
    </section>
  );
}
