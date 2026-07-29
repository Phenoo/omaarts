'use client';

import Image from 'next/image';

const SOCIALS = [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Twitter / X", href: "https://twitter.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "TikTok", href: "https://tiktok.com" },
    { label: "WhatsApp", href: "https://wa.me/2348167009545" },
    { label: "Email", href: "mailto:achebeoma963@gmail.com" },
];

export default function Footer() {
    return (
      <footer className="w-full py-16 bg-[var(--surface-strong)] text-white border-t border-[var(--accent-primary)]/25">
        <div className="max-w-[90vw] mx-auto flex flex-col gap-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                  <div className="relative h-14 md:h-16 w-[210px] md:w-[280px] overflow-hidden mb-3">
                    <Image
                      src="/images/oma-logo.jpg"
                      alt="Artsy by Oma logo"
                      fill
                      className="object-contain scale-[1.3] origin-left"
                    />
                  </div>
                  <p className="font-sans text-sm text-white/70 max-w-sm">
                      Vibrant narratives from the heart of Awka.
                  </p>
              </div>
              
              <div className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs uppercase tracking-widest">
                  {SOCIALS.map((social, i) => (
                      <a 
                          key={i} 
                          href={social.href} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[var(--accent-orange)] transition-colors"
                      >
                          {social.label}
                      </a>
                  ))}
              </div>
          </div>
  
          <div className="flex flex-col md:flex-row justify-between items-end border-t border-white/15 pt-8 gap-4">
              <span className="font-mono text-[10px] text-white/55">© {new Date().getFullYear()} ARTS BY OMA. ALL RIGHTS RESERVED.</span>
              <span className="font-mono text-[10px] text-white/55">
                  DESIGNED BY EZE
              </span>
          </div>
  
        </div>
      </footer>
    );
  }
