'use client';

import Link from 'next/link';

import Image from 'next/image';

const SERVICES = [
    { title: 'Fine Art Commissions', description: 'Custom large-scale paintings tailored to residential or commercial spaces.', image: '/images/archive-1.png' },
    { title: 'Editorial Illustration', description: 'Visual storytelling for publications, brands, and digital media.', image: '/images/archive-2.png' },
    { title: 'Mural Installation', description: 'Immersive, site-specific art installations for public and private venues.', image: '/images/studio/IMG_0890.png' },
];

export default function ServicesSection() {
  return (
    <section className="w-full py-24 bg-[var(--surface-soft)] border-t border-[var(--border-soft)]">
      <div className="max-w-[90vw] mx-auto">
        <h2 className="font-mono text-sm uppercase tracking-widest mb-16 text-[var(--accent-orange)]">Services</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {SERVICES.map((service, i) => (
                <div key={i} className="flex flex-col gap-4 group cursor-default p-4 border border-[var(--border-soft)] hover:border-[var(--accent-primary)] hover:[box-shadow:0_0_20px_rgba(111,59,210,0.18)] transition-all duration-500 bg-white">
                    <div className="relative w-full aspect-video overflow-hidden mb-4 border border-[var(--border-soft)] group-hover:border-[var(--accent-primary)] transition-colors duration-500">
                         <Image 
                            src={service.image} 
                            alt={service.title}
                            fill
                            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                         />
                         <div className="absolute inset-0 bg-[var(--surface-strong)]/30 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                    <div className="w-12 h-1 bg-[var(--accent-primary)] group-hover:w-full transition-all duration-500" />
                    <h3 className="font-serif text-3xl mt-2 text-[var(--foreground)] group-hover:text-[var(--accent-primary)] transition-colors">{service.title}</h3>
                    <p className="font-sans text-base text-[var(--text-muted)] leading-relaxed group-hover:text-[var(--foreground)] transition-colors">
                        {service.description}
                    </p>
                </div>
            ))}
        </div>
        
        <div className="flex justify-center mt-16">
            <Link href="/private-events" className="px-12 py-4 border border-[var(--accent-primary)] text-[var(--accent-primary)] font-mono text-sm uppercase tracking-widest hover:bg-[var(--accent-primary)] hover:text-white transition-all duration-300">
                View Full Services
            </Link>
        </div>
      </div>
    </section>
  );
}
