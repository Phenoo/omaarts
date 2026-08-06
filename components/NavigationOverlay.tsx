'use client';

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { useCart } from "@/lib/context/CartContext";
import { useCustomerAuth } from "@/lib/context/CustomerAuthContext";
import { ShoppingCart, UserCircle } from "lucide-react";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Activities", href: "/activities" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Shop Art", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const SOCIALS = [
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@artsybyoma?_r=1&_t=ZS-98Rs73fvAJe",
    path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 1 0 1 7.6 6.83 6.83 0 0 0 6-6.8V4.63a8.77 8.77 0 0 0 5.22 1.5Z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/artsyby_oma?igsh=N3BrN3Y2cW5temZ5&utm_source=qr",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1GrxnpA1CX/?mibextid=wwXIfr",
    path: "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z",
  },
  {
    label: "Threads",
    href: "https://www.threads.com/@artsyby_oma?igshid=NTc4MTIwNjQ2YQ==",
    path: "M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.328 12.658c-1.69.002-2.865-1.118-3.328-2.658h-1.008c-.337 1.044-1.112 1.747-2.247 1.747-.992 0-1.826-.833-1.826-2.176 0-1.365 1.05-2.41 2.27-2.41.678 0 1.218.275 1.536.75l-.97.93c-.168-.225-.383-.33-.613-.33-.506 0-.816.682-.816 1.39 0 .71.665 1.127 1.53 1.127 1.48 0 2.553-1.132 2.553-3.125 0-2.193-1.502-3.518-3.518-3.518-2.28 0-4.22 1.597-4.22 4.18 0 2.675 1.924 4.22 4.22 4.22 1.21 0 2.198-.437 2.83-1.054v-.982c-.465.52-1.25.805-2.213.805-2.095 0-3.655-1.355-3.655-3.407 0-2.053 1.558-3.393 3.654-3.393 2.226 0 3.754 1.454 3.754 3.77 0 .245-.018.48-.064.707h-7.32c0 1.983 1.507 3.132 3.647 3.132.55 0 1.09-.067 1.624-.204v1.616c-.577.162-1.243.25-1.835.25-3.34 0-5.485-2.12-5.485-5.093 0-3.175 2.583-4.965 5.485-4.965 3.043 0 5.463 1.94 5.463 4.996 0 3.12-2.408 5.127-5.495 5.127z",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/2348167009545",
    path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z",
  },
  {
    label: "Email",
    href: "mailto:achebeoma963@gmail.com",
    path: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  },
];

export default function NavigationOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const socialsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const { cartCount } = useCart();
  const { isAuthenticated, profile } = useCustomerAuth();
  const pathname = usePathname();

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
        stagger: 0.08,
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

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header className="fixed top-0 left-0 w-full px-4 md:px-8 pt-5 z-[60] flex justify-between items-center text-[var(--foreground)] pointer-events-none">
        <Link
          href="/"
          className="pointer-events-auto relative block h-11 md:h-14 w-[170px] md:w-[250px] overflow-hidden"
        >
          <Image
            src="/images/oma-logo.jpg"
            alt="Artsy by Oma logo"
            fill
            className="object-contain scale-[1.35] origin-center drop-shadow-[0_8px_16px_rgba(74,37,152,0.18)]"
            priority
          />
        </Link>
        
        <div className="flex items-center gap-2.5 md:gap-4 pointer-events-auto">
          {/* Account Icon */}
          <Link
            href={isAuthenticated ? "/account" : "/account/login"}
            className="p-2.5 md:p-3 rounded-full border border-[var(--border-soft)] bg-white/75 backdrop-blur-md hover:bg-[var(--accent-purple)] hover:text-white transition-colors relative flex items-center justify-center cursor-pointer"
            title={isAuthenticated ? "My Account" : "Sign In"}
          >
            {isAuthenticated ? (
              <span className="w-4 h-4 rounded-full bg-[var(--accent-purple)] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                {profile?.displayName?.[0]?.toUpperCase() || '?'}
              </span>
            ) : (
              <UserCircle size={16} />
            )}
          </Link>

          {/* Cart Icon Link */}
          <Link
            href="/cart"
            className="p-2.5 md:p-3 rounded-full border border-[var(--border-soft)] bg-white/75 backdrop-blur-md hover:bg-[var(--accent-purple)] hover:text-white transition-colors relative flex items-center justify-center cursor-pointer"
            title="View Shopping Cart"
          >
            <ShoppingCart size={16} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent-orange)] text-white text-[10px] font-mono font-bold flex items-center justify-center border border-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Book Experience CTA */}
          <Link
            href="/activities"
            className="hidden md:inline-flex px-5 py-2.5 rounded-full bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer shadow-sm"
          >
            Book an Experience
          </Link>

          {/* Menu Trigger */}
          <button
            onClick={toggleMenu}
            className="font-mono text-sm md:text-base uppercase tracking-[0.15em] cursor-pointer px-4 py-2 rounded-full border border-[var(--border-soft)] bg-white/75 backdrop-blur-md hover:bg-[var(--accent-purple)] hover:text-white transition-colors"
          >
            {isOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      <div
        ref={containerRef}
        className="fixed inset-0 z-[50] bg-[var(--surface-strong)] flex items-center justify-center p-4 overflow-y-auto"
      >
        <div className="flex flex-col items-center gap-10 my-auto py-20">
          <nav className="flex flex-col items-center gap-4 md:gap-6">
            {LINKS.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                ref={(el) => {
                  linksRef.current[i] = el;
                }}
                className="font-serif text-4xl md:text-7xl text-white hover:text-[var(--accent-orange)] transition-all duration-300 tracking-tight"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/events"
            onClick={() => setIsOpen(false)}
            className="w-full max-w-2xl rounded-[1.75rem] border border-white/12 bg-white/8 p-5 text-white transition-colors hover:border-[var(--accent-orange)] hover:bg-white/12"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent-orange)]">
              Private Events
            </p>
            <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-serif text-2xl md:text-4xl tracking-tight">
                  Book the studio for groups and celebrations.
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/70">
                  Birthdays, team sessions, bridal groups, date nights, and space bookings.
                </p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
                View event details
              </span>
            </div>
          </Link>

          <div className="flex gap-6 mt-4">
            {SOCIALS.map((social, i) => (
              <a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                ref={(el) => {
                  socialsRef.current[i] = el;
                }}
                className="text-white/70 hover:text-[var(--accent-orange)] transition-colors hover:scale-110 duration-300"
                title={social.label}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
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
