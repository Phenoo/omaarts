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

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com",
    path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    path: "M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h5v-8.306c0-4.613 5.48-4.515 5.48 0v8.306h5v-10.515c0-8.59-10.33-7.792-10.512-3.818v-1.673z",
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 1 0 1 7.6 6.83 6.83 0 0 0 6-6.8V4.63a8.77 8.77 0 0 0 5.22 1.5Z",
  },
  {
    label: "WhatsApp",
    href: "https://whatsapp.com",
    path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z",
  },
  {
    label: "Email",
    href: "mailto:hello@artsbyoma.com",
    path: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  },
];

export default function NavigationOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const socialsRef = useRef<(HTMLAnchorElement | null)[]>([]);

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
    // Initialize socials state
    socialsRef.current.forEach((social) => {
      if (social) {
        gsap.set(social, { y: 50, opacity: 0 });
      }
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Filter out null refs
    const validLinks = linksRef.current.filter(
      (link) => link !== null
    ) as HTMLAnchorElement[];

    const validSocials = socialsRef.current.filter(
      (social) => social !== null
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
      gsap.to(validSocials, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.05,
        delay: 0.5,
        ease: "power3.out",
        overwrite: "auto",
      });
    } else {
      // Animate links out first, then container
      gsap.to(validSocials, {
        y: 50,
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "power3.in",
        overwrite: "auto",
      });
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
        <Link
          href="/"
          className="font-serif text-xl md:text-2xl tracking-tight hover:scale-105 transition-transform pointer-events-auto hover:[text-shadow:0_0_10px_var(--accent-primary)]"
        >
          ARTS BY OMA
        </Link>
        <button
          onClick={toggleMenu}
          className="font-mono text-xl uppercase tracking-widest hover:scale-110 transition-transform cursor-pointer pointer-events-auto"
        >
          {isOpen ? "Close" : "Menu"}
        </button>
      </header>

      <div
        ref={containerRef}
        className="fixed inset-0 z-[50] bg-[#121212] flex items-center justify-center p-4"
      >
        <div className="flex flex-col items-center gap-12">
          <nav className="flex flex-col items-center gap-6">
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

          <div className="flex gap-8 mt-8">
            {SOCIALS.map((social, i) => (
              <a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                ref={(el) => {
                  socialsRef.current[i] = el;
                }}
                className="text-white/50 hover:text-[var(--accent-secondary)] transition-colors hover:scale-110 duration-300"
                title={social.label}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
