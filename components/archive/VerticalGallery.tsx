'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';

gsap.registerPlugin(ScrollTrigger);

// Fallback data if Sanity is not connected or empty
const FALLBACK_ARTWORKS = [
  { _id: '1', mainImage: { asset: { _ref: 'image-tbw' } }, src: '/images/archive-1.png', title: 'Lagos Heat', year: '2024', description: 'Exploration of geometric void and structure.', slug: { current: 'lagos-heat' } },
  { _id: '2', mainImage: { asset: { _ref: 'image-tbw' } }, src: '/images/archive-2.png', title: 'Indigo Dreams', year: '2025', description: 'Chaotic expressionism with neon accents.', slug: { current: 'indigo-dreams' } },
   { _id: '3', mainImage: { asset: { _ref: 'image-tbw' } }, src: '/images/hero-texture.png', title: 'Market Noise', year: '2023', description: 'Textural study of brutalist surfaces.', slug: { current: 'market-noise' } },
  { _id: '4', mainImage: { asset: { _ref: 'image-tbw' } }, src: '/images/archive-1.png', title: 'Ancestral', year: '2024', description: 'Recursive forms in monochrome.', slug: { current: 'ancestral' } },
];

export default function VerticalGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [artworks, setArtworks] = useState<any[]>([]);

  useEffect(() => {
    // Check if configured
    if (client.config().projectId === 'REPLACE_ME') {
        setArtworks(FALLBACK_ARTWORKS);
        return;
    }

    const fetchArt = async () => {
        try {
            const data = await client.fetch(`*[_type == "artwork"] | order(year desc)[0...4]`);
            if (data && data.length > 0) {
                setArtworks(data);
            } else {
                setArtworks(FALLBACK_ARTWORKS);
            }
        } catch (e) {
            console.error("Sanity fetch failed:", e);
            setArtworks(FALLBACK_ARTWORKS);
        }
    };
    fetchArt();
  }, []);

  // Animation logic handles both newly fetched and fallback data
  useEffect(() => {
    if (!containerRef.current || artworks.length === 0) return;

    // Small delay to ensure DOM is ready after state update
    const timer = setTimeout(() => {
        const ctx = gsap.context(() => {
            // ... (Same animation logic as before) ...
            itemsRef.current.forEach((item, i) => {
                if (!item) return;
                const imageWrapper = item.querySelector('.image-wrapper');
                const image = item.querySelector('img');
                const text = item.querySelector('.text-content');
                if(!imageWrapper || !text) return;

                gsap.fromTo(imageWrapper, 
                  { clipPath: 'inset(100% 0% 0% 0%)' }, 
                  { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power3.inOut', scrollTrigger: { trigger: item, start: 'top 80%', end: 'center center' }}
                );
                
                if(image) {
                     gsap.fromTo(image, { scale: 1.2, yPercent: -10 }, 
                     { scale: 1, yPercent: 10, ease: 'none', scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: true }} );
                }

                gsap.from(text, { y: 50, opacity: 0, duration: 1, scrollTrigger: { trigger: item, start: 'top 70%' } });
            });
        }, containerRef);
        return () => ctx.revert();
    }, 100);
    return () => clearTimeout(timer);
  }, [artworks]);

  return (
    <section ref={containerRef} className="relative w-full py-24 bg-[#121212]">
      <div className="max-w-[90vw] mx-auto flex flex-col gap-32">
        <div className="border-b border-[#333] pb-4 mb-12">
            <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--accent-orange)]">Selected Works</h2>
        </div>

        {artworks.map((art, i) => {
            const imageUrl = art.mainImage?.asset?._ref ? urlFor(art.mainImage).url() : art.src;
            return (
                <div 
                    key={art._id || i} 
                    ref={el => { itemsRef.current[i] = el; }}
                    className={clsx(
                        "flex flex-col md:flex-row gap-8 md:gap-24 items-center", 
                        i % 2 === 1 ? "md:flex-row-reverse" : ""
                    )}
                >
                    {/* Image Section */}
                    <div className="image-wrapper relative w-full md:w-1/2 aspect-[3/4] overflow-hidden bg-[#222] shadow-xl border border-[#333]">
                         <Image
                            src={imageUrl}
                            alt={art.title}
                            fill
                            className="object-cover"
                         />
                    </div>
    
                    {/* Text Section */}
                    <div className="text-content w-full md:w-1/2 flex flex-col gap-4">
                        <span className="font-mono text-xs text-white/40">0{i + 1} {'//'} {art.year}</span>
                        <h3 className="font-serif text-5xl md:text-7xl text-white leading-[0.85] tracking-tight">
                            {art.title}
                        </h3>
                        <p className="font-sans text-sm md:text-base max-w-sm mt-4 text-white/70 leading-relaxed">
                            {art.description}
                        </p>
                        <Link href={`/work/${art.slug?.current}`} className="mt-8 px-6 py-2 border border-[var(--accent-primary)] text-[var(--accent-primary)] rounded-full font-mono text-xs uppercase hover:bg-[var(--accent-primary)] hover:text-black transition-all duration-300 w-fit">
                            View Details
                        </Link>
                    </div>
                </div>
            );
        })}
        
        <div className="flex justify-center mt-12">
            <Link href="/shop" className="px-12 py-4 border border-white/20 text-white font-mono text-sm uppercase tracking-widest hover:bg-[var(--accent-secondary)] hover:border-[var(--accent-secondary)] hover:text-white transition-all duration-300">
                View All Projects
            </Link>
        </div>
      </div>
    </section>
  );
}
