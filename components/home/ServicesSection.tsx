'use client';

import Link from 'next/link';

import Image from 'next/image';

const SERVICES = [
    { title: 'Fine Art Commissions', description: 'Custom large-scale paintings tailored to residential or commercial spaces.', image: '/images/archive-1.png' },
    { title: 'Editorial Illustration', description: 'Visual storytelling for publications, brands, and digital media.', image: '/images/archive-2.png' },
    { title: 'Mural Installation', description: 'Immersive, site-specific art installations for public and private venues.', image: '/images/artist-studio.png' },
];

export default function ServicesSection() {
  return (
    <section className="w-full py-24 bg-[#0a0a0a] border-t border-[#333]">
      <div className="max-w-[90vw] mx-auto">
        <h2 className="font-mono text-sm uppercase tracking-widest mb-16 text-[var(--accent-orange)]">Services</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {SERVICES.map((service, i) => (
                <div key={i} className="flex flex-col gap-4 group cursor-default p-4 border border-[#333] hover:border-[var(--accent-primary)] hover:[box-shadow:0_0_20px_var(--accent-primary)] transition-all duration-500 bg-[#121212]">
                    <div className="relative w-full aspect-video overflow-hidden mb-4 border border-white/10 group-hover:border-[var(--accent-primary)] transition-colors duration-500">
                         <Image 
                            src={service.image} 
                            alt={service.title}
                            fill
                            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                         />
                         <div className="absolute inset-0 bg-black/50 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                    <div className="w-12 h-1 bg-[var(--accent-primary)] group-hover:w-full group-hover:[box-shadow:0_0_10px_var(--accent-primary)] transition-all duration-500" />
                    <h3 className="font-serif text-3xl mt-2 text-white group-hover:text-[var(--accent-primary)] group-hover:[text-shadow:0_0_10px_var(--accent-primary)] transition-colors">{service.title}</h3>
                    <p className="font-sans text-base text-gray-400 leading-relaxed group-hover:text-gray-200 transition-colors">
                        {service.description}
                    </p>
                </div>
            ))}
        </div>
        
        <div className="flex justify-center mt-16">
            <Link href="/services" className="px-12 py-4 border border-white/20 text-white font-mono text-sm uppercase tracking-widest hover:bg-[var(--accent-primary)] hover:border-[var(--accent-primary)] hover:text-black transition-all duration-300">
                View Full Services
            </Link>
        </div>
      </div>
    </section>
  );
}
