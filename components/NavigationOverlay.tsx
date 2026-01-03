"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import Link from "next/link";

const LINKS = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/contact" },
  { label: "Events", href: "/events" },
];

export default function NavigationOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    // Initial State
    if (containerRef.current) {
      gsap.set(containerRef.current, { yPercent: -100 });
    }
    // Initialize links state
    linksRef.current.forEach((link) => {
      if (link) {
        gsap.set(link, { y: 100, opacity: 0 });
      }
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Filter out null refs
    const validLinks = linksRef.current.filter(
      (link) => link !== null
    ) as HTMLAnchorElement[];

    if (isOpen) {
      gsap.to(containerRef.current, {
        yPercent: 0,
        duration: 0.8,
        ease: "expo.inOut",
        overwrite: "auto",
      });
      gsap.to(validLinks, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.2,
        ease: "power3.out",
        overwrite: "auto",
      });
    } else {
      // Animate links out first, then container
      gsap.to(validLinks, {
        y: 100,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power3.in",
        overwrite: "auto",
      });
      gsap.to(containerRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: "expo.inOut",
        delay: 0.2,
        overwrite: "auto",
      });
    }
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <header className="fixed top-0 left-0 w-full p-8 z-[60] flex justify-between items-center text-white mix-blend-difference pointer-events-none">
        <Link href="/" className="font-serif text-xl md:text-2xl tracking-tight hover:scale-105 transition-transform pointer-events-auto hover:[text-shadow:0_0_10px_var(--accent-primary)]">
            ARTS BY OMA
        </Link>
        <button 
            onClick={toggleMenu}
            className="font-mono text-xs uppercase tracking-widest hover:scale-110 transition-transform cursor-pointer pointer-events-auto"
        >
            {isOpen ? 'Close' : 'Menu'}
        </button>
      </header>

      <div
        ref={containerRef}
        className="fixed inset-0 z-[50] bg-[#121212] flex items-center justify-center"
      >
        <nav className="flex flex-col items-center gap-8">
          {LINKS.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              ref={(el) => {
                linksRef.current[i] = el;
              }}
              className="font-serif text-5xl md:text-8xl text-[var(--foreground)] hover:text-[var(--accent-primary)] hover:[text-shadow:0_0_30px_var(--accent-primary)] transition-all duration-300 tracking-tight"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
