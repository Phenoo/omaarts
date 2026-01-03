"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import Image from "next/image";

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

    // Zoom out effect: Start scaled up, scale down to 1
    tl.fromTo(
      imageRef.current,
      { scale: 3 }, // Start zoomed in
      { scale: 1, ease: "none" } // Zoom out to natural size
    );

    // Text fade out or parallax
    tl.to(
      textRef.current,
      { opacity: 0, y: -100, ease: "power2.in" },
      0 // Start successfully with scale
    );

    return () => {
      // Cleanup not strictly necessary with GSAP context but good practice if needed
      // ScrollTrigger.getAll().forEach(t => t.kill());
      // Actually, in React 18+ cleanly handling this is better with useGSAP or contexts.
      // For now, simple cleanup:
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#F9F9F9]"
    >
      <div className="absolute inset-0 flex items-center justify-center z-0">
        {/* Container for the image to control scaling properly */}
        <div className="relative w-full h-full">
          <Image
            ref={imageRef}
            src="/images/artist-portrait.jpg"
            alt="Oma Achebe Portrait"
            fill
            className="object-cover  opacity-90 object-center"
            priority
          />
        </div>
      </div>

      <div
        ref={textRef}
        className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none "
      >
        <h1 className="text-9xl font-serif text-[#111] opacity-90 tracking-tighter text-center leading-[0.8] ">
          ARTS BY
          <br />
          OMA
        </h1>
        <p className="mt-8 text-xl font-mono text-[#111] tracking-widest uppercase bg-transparent border border-[#F9F9F9]/30 px-4 py-2 backdrop-blur-sm ">
          Nigerian Contemporary Artist
        </p>
      </div>

      <div className="absolute bottom-10 left-10 z-20 mix-blend-difference text-white font-mono text-sm">
        SCROLL TO EXPLORE
      </div>
    </section>
  );
}
