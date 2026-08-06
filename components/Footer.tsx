'use client';

import Image from 'next/image';
import Link from 'next/link';

const SOCIALS = [
    { label: "TikTok", href: "https://www.tiktok.com/@artsybyoma?_r=1&_t=ZS-98Rs73fvAJe" },
    { label: "Instagram", href: "https://www.instagram.com/artsyby_oma?igsh=N3BrN3Y2cW5temZ5&utm_source=qr" },
    { label: "Facebook", href: "https://www.facebook.com/share/1GrxnpA1CX/?mibextid=wwXIfr" },
    { label: "Threads", href: "https://www.threads.com/@artsyby_oma?igshid=NTc4MTIwNjQ2YQ==" },
    { label: "WhatsApp", href: "https://wa.me/2348167009545" },
    { label: "Email", href: "mailto:achebeoma963@gmail.com" },
];

const EXPLORE_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'My Account', href: '/account' },
];

const BOOKING_LINKS = [
  { label: 'Activities', href: '/activities' },
  { label: 'Private Events', href: '/events' },
  { label: 'Services', href: '/services' },
  { label: 'Contact', href: '/contact' },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--accent-primary)]/20 bg-[var(--surface-strong)] py-16 text-white">
      <div className="mx-auto flex max-w-[90vw] flex-col gap-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
          <div>
            <div className="relative mb-4 h-14 w-[210px] overflow-hidden md:h-16 md:w-[280px]">
              <Image
                src="/images/oma-logo.jpg"
                alt="Artsy by Oma logo"
                fill
                className="origin-left object-contain scale-[1.3]"
              />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/72">
              Original works, private studio experiences, and commissioned pieces by Oma Achebe in Awka.
            </p>
            <div className="mt-5 space-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
              <p>Awka, Nigeria</p>
              <p>0816 700 9545</p>
              <p>achebeoma963@gmail.com</p>
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent-orange)]">
              Explore
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {EXPLORE_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-serif text-2xl tracking-tight text-white transition-colors hover:text-[var(--accent-orange)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent-orange)]">
              Bookings
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {BOOKING_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-serif text-2xl tracking-tight text-white transition-colors hover:text-[var(--accent-orange)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent-orange)]">
              Social
            </p>
            <div className="mt-4 flex flex-col gap-3 font-serif text-2xl tracking-tight">
              {SOCIALS.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[var(--accent-orange)]"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/15 pt-8 md:flex-row md:items-end md:justify-between">
          <span className="font-mono text-[10px] text-white/55">
            © {new Date().getFullYear()} ARTSY BY OMA. ALL RIGHTS RESERVED.
          </span>
        </div>
      </div>
    </footer>
  );
}
