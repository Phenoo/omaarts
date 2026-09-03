'use client';

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !imageRef.current || !textRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let disposed = false;
    let tl: {
      kill: () => void;
      fromTo: (target: HTMLImageElement, from: object, to: object) => {
        to: (target: HTMLDivElement, vars: object, position?: number) => void;
      };
      to: (target: HTMLDivElement, vars: object, position?: number) => void;
    } | null = null;

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ default: gsap }, { default: ScrollTrigger }]) => {
      if (disposed || !containerRef.current || !imageRef.current || !textRef.current) return;

      gsap.registerPlugin(ScrollTrigger);
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          pin: true,
        },
      });

      tl.fromTo(imageRef.current, { scale: 1 }, { scale: 1.08, ease: "none" });
      tl.to(textRef.current, { opacity: 0, y: -80, ease: "power2.in" }, 0);
    });

    return () => {
      disposed = true;
      tl?.kill();
    };
  }, []);

  return (
    <section
      id="home-hero"
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-[#f7f1e8] pt-[4.5rem]"
    >
      <div className="relative h-full w-full">
        <Image
          ref={imageRef}
          src="/images/studio/IMG_0890.png"
          alt="The colorful mural inside the Artsy by Oma studio in Awka"
          fill
          sizes="100vw"
          className="object-cover object-[center_42%]"
          priority
        />
      </div>

      <div
        ref={textRef}
        className="absolute inset-x-4 bottom-4 z-10 bg-[#fffaf2] p-6 text-left pointer-events-none sm:inset-x-auto sm:bottom-8 sm:left-8 sm:w-[min(38rem,48vw)] sm:p-9 md:p-11"
      >
        <h1 className="font-serif text-[clamp(2.5rem,4.5vw,4rem)] font-black uppercase leading-[0.9] tracking-[-0.06em] text-[var(--foreground)] sm:whitespace-nowrap">
          Artsy by Oma
        </h1>
        <p className="mt-4 max-w-md font-sans text-base font-medium leading-relaxed text-[var(--foreground)] sm:text-lg md:text-xl">
          A creative studio in Awka for making, meeting and collecting.
        </p>

        <div className="mt-6 grid gap-3 pointer-events-auto sm:grid-cols-2">
          <Link
            href="/experiences"
            className="inline-flex min-h-14 items-center justify-center bg-[var(--foreground)] px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[var(--accent-purple)]"
          >
            Book a Session
          </Link>
          <Link
            href="/art"
            className="inline-flex min-h-14 items-center justify-center bg-[var(--accent-orange)] px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[var(--accent-purple)]"
          >
            View Art
          </Link>
        </div>
      </div>
    </section>
  );
}
