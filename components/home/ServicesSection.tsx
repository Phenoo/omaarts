'use client';

import Link from 'next/link';

const SERVICES = [
    { title: 'Fine Art Commissions', description: 'Custom large-scale paintings tailored to residential or commercial spaces.' },
    { title: 'Editorial Illustration', description: 'Visual storytelling for publications, brands, and digital media.' },
    { title: 'Mural Installation', description: 'Immersive, site-specific art installations for public and private venues.' },
];

export default function ServicesSection() {
  return (
    <section className="w-full py-24 bg-[#0a0a0a] border-t border-[#333]">
      <div className="max-w-[90vw] mx-auto">
        <h2 className="font-mono text-sm uppercase tracking-widest mb-16 text-[var(--accent-orange)]">Services</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {SERVICES.map((service, i) => (
                <div key={i} className="flex flex-col gap-4 group cursor-default p-6 border border-[#333] hover:border-[var(--accent-primary)] hover:[box-shadow:0_0_20px_var(--accent-primary)] transition-all duration-500 bg-[#121212]">
                    <div className="w-12 h-1 bg-[var(--accent-primary)] group-hover:w-full group-hover:[box-shadow:0_0_10px_var(--accent-primary)] transition-all duration-500" />
                    <h3 className="font-serif text-3xl mt-4 text-white group-hover:text-[var(--accent-primary)] group-hover:[text-shadow:0_0_10px_var(--accent-primary)] transition-colors">{service.title}</h3>
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
