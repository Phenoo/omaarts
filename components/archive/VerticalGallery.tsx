'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { SELECTED_WORKS } from '@/lib/selectedWorks';

gsap.registerPlugin(ScrollTrigger);

export default function VerticalGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const featuredWorks = SELECTED_WORKS.slice(0, 5);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      itemsRef.current.forEach((item) => {
        if (!item) return;
        
        const imageWrapper = item.querySelector('.image-wrapper');
        const image = item.querySelector('img');
        const text = item.querySelector('.text-content');

        // Reveal animation (Curtain effect)
        gsap.fromTo(imageWrapper, 
          { clipPath: 'inset(100% 0% 0% 0%)' }, 
          { 
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.5,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: item,
              start: 'top 80%',
              end: 'center center',
            }
          }
        );

        // Parallax effect for image inside wrapper
        gsap.fromTo(image,
          { scale: 1.2, yPercent: -10 },
          { 
            scale: 1, 
            yPercent: 10,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            }
          }
        );

        // Text subtle fade and slide
        gsap.from(text, {
          y: 50,
          opacity: 0,
          duration: 1,
          scrollTrigger: {
            trigger: item,
            start: 'top 70%',
          }
        });

      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full py-24 bg-white">
      <div className="max-w-[90vw] mx-auto flex flex-col gap-24 md:gap-32">
        <div className="section-shell p-8 md:p-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-sm font-mono uppercase tracking-[0.16em] text-[var(--accent-orange)] mb-4">Selected Works</p>
              <h2 className="font-serif text-4xl md:text-6xl leading-[0.9] tracking-tight text-[var(--foreground)]">
                A curated body of work rooted in culture, womanhood, and contemporary expression.
              </h2>
            </div>
            <p className="font-sans text-sm md:text-base max-w-md text-[var(--text-muted)] leading-relaxed">
              Each piece explores memory through texture, movement, and color, blending Igbo influence with a modern visual voice.
            </p>
        </div>

        {featuredWorks.map((art, i) => (
            <div 
                key={art.id}
                ref={el => { itemsRef.current[i] = el; }}
                className={clsx(
                    "section-shell p-6 md:p-8 flex flex-col md:flex-row gap-8 md:gap-14 items-center", 
                    i % 2 === 1 ? "md:flex-row-reverse" : ""
                )}
            >
                {/* Image Section */}
                <div className="image-wrapper relative w-full md:w-1/2 aspect-[4/5] overflow-hidden bg-[var(--surface-soft)] rounded-2xl border border-[var(--border-soft)]">
                     <Image
                        src={art.image}
                        alt={art.title}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                     />
                     <div className="absolute inset-0 bg-[var(--surface-strong)]/12" />
                     <div className="absolute top-4 left-4 rounded-full bg-white/85 backdrop-blur-sm px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--accent-secondary)]">
                        0{i + 1}
                     </div>
                </div>

                {/* Text Section */}
                <div className="text-content w-full md:w-1/2 flex flex-col gap-5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--accent-purple)]">{art.year}</span>
                      <span className="h-1 w-1 rounded-full bg-[var(--accent-orange)]" />
                      <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)]">{art.medium}</span>
                    </div>
                    <h3 className="font-serif text-4xl md:text-6xl text-[var(--foreground)] leading-[0.9] tracking-tight">
                        {art.title}
                    </h3>
                    <p className="font-sans text-sm md:text-base max-w-lg text-[var(--text-muted)] leading-relaxed">
                        {art.description}
                    </p>
                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                      <Link href="/art" className="px-6 py-2.5 border border-[var(--accent-primary)] text-[var(--accent-primary)] rounded-full font-mono text-xs uppercase tracking-[0.14em] hover:bg-[var(--accent-primary)] hover:text-white transition-all duration-300 w-fit">
                          View Details
                      </Link>
                      <Link href="/contact" className="px-6 py-2.5 border border-[var(--border-soft)] text-[var(--text-muted)] rounded-full font-mono text-xs uppercase tracking-[0.14em] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] transition-all duration-300 w-fit">
                          Inquire
                      </Link>
                    </div>
                </div>
            </div>
        ))}
        
        <div className="flex justify-center mt-2">
            <Link href="/art" className="px-10 md:px-12 py-4 border border-[var(--accent-secondary)] text-[var(--accent-secondary)] rounded-full font-mono text-sm uppercase tracking-[0.16em] hover:bg-[var(--accent-secondary)] hover:border-[var(--accent-secondary)] hover:text-white transition-all duration-300">
                See More
            </Link>
        </div>
      </div>
    </section>
  );
}
