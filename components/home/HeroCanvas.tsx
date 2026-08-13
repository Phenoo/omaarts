'use client';

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import Image from "next/image";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function HeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !imageRef.current || !textRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        pin: true,
      },
    });

    tl.fromTo(imageRef.current, { scale: 1 }, { scale: 1.08, ease: "none" });
    tl.to(
      textRef.current,
      { opacity: 0, y: -80, ease: "power2.in" },
      0
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section
      id="home-hero"
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[var(--background)]"
    >
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="relative w-full h-full">
          <Image
            ref={imageRef}
            src="/images/artist-portrait.jpg"
            alt="Oma Achebe Portrait"
            fill
            className="object-cover object-[center_18%]"
            priority
          />
          <div className="absolute inset-0 bg-black/25" />
        </div>
      </div>

      <div
        ref={textRef}
        className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-4 text-center"
      >
        <h1 className="text-5xl md:text-8xl font-serif text-white tracking-tight leading-[0.95] drop-shadow-md max-w-4xl">
          Create. Sip. Connect<span className="text-[var(--accent-orange)]">.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-sm md:text-lg font-sans text-white/90 drop-shadow-sm leading-relaxed">
          Creative experiences, original art, unforgettable moments.
        </p>

        <div className="mt-8 flex gap-4 pointer-events-auto">
          <Link
            href="/activities"
            className="px-8 py-3.5 rounded-full bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-orange)] transition-colors font-mono text-xs uppercase tracking-widest shadow-lg cursor-pointer font-bold"
          >
            Book an Experience
          </Link>
          <Link
            href="/portfolio"
            className="px-8 py-3.5 rounded-full backdrop-blur-sm border border-white/35 text-black bg-white text-[var(--foreground)] transition-all font-mono text-xs uppercase tracking-widest shadow-lg cursor-pointer"
          >
            Explore Art
          </Link>
        </div>
      </div>

      <div className="absolute bottom-10 left-8 md:left-10 z-20 text-white/70 font-mono text-[10px] tracking-[0.18em] uppercase">
        SCROLL TO EXPLORE
      </div>
    </section>
  );
}
