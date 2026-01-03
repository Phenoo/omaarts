'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function ServicesPage() {
  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-[90vw] mx-auto pb-24">
        
        {/* HERO */}
        <div className="mb-24 border-b border-[#333] pb-12">
            <h1 className="font-serif text-6xl md:text-8xl text-[var(--accent-purple)] tracking-tight leading-[0.9] mb-8">
                SERVICES &<br/>
                COMMISSIONS
            </h1>
            <p className="font-sans text-xl opacity-70 max-w-2xl">
                Collaborate with Oma to bring aggressive color and vibrant narratives into your space. 
                From intimate residential pieces to monumental public installations.
            </p>
        </div>

        {/* SERVICE OFFERINGS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {/* Service 1 */}
            <div className="border border-[#333] p-8 hover:border-[var(--accent-orange)] transition-colors group">
                <div className="w-12 h-12 bg-[var(--accent-purple)] rounded-full mb-6 group-hover:bg-[var(--accent-orange)] transition-colors" />
                <h3 className="font-serif text-3xl mb-4">Private Commissions</h3>
                <p className="font-sans opacity-70 mb-6 leading-relaxed">
                    Bespoke paintings tailored to your specific narrative and space. We work together to select palettes and dimensions that resonate with your personal collection.
                </p>
                <ul className="font-mono text-xs uppercase tracking-widest opacity-60 space-y-2">
                    <li>• Oil & Acrylic on Canvas</li>
                    <li>• Custom Sizing</li>
                    <li>• Certificate of Authenticity</li>
                </ul>
            </div>

            {/* Service 2 */}
            <div className="border border-[#333] p-8 hover:border-[var(--accent-orange)] transition-colors group">
                <div className="w-12 h-12 bg-[var(--accent-purple)] rounded-full mb-6 group-hover:bg-[var(--accent-orange)] transition-colors" />
                <h3 className="font-serif text-3xl mb-4">Murals & Installations</h3>
                <p className="font-sans opacity-70 mb-6 leading-relaxed">
                    Immersive, site-specific art for corporate offices, restaurants, and public venues. Transform static walls into dynamic storytelling experiences.
                </p>
                <ul className="font-mono text-xs uppercase tracking-widest opacity-60 space-y-2">
                    <li>• Indoor & Outdoor</li>
                    <li>• Site Analysis</li>
                    <li>• Durable Materials</li>
                </ul>
            </div>

            {/* Service 3 */}
            <div className="border border-[#333] p-8 hover:border-[var(--accent-orange)] transition-colors group">
                <div className="w-12 h-12 bg-[var(--accent-purple)] rounded-full mb-6 group-hover:bg-[var(--accent-orange)] transition-colors" />
                <h3 className="font-serif text-3xl mb-4">Brand Collaboration</h3>
                <p className="font-sans opacity-70 mb-6 leading-relaxed">
                    Partner with Arts by Oma for limited edition product drops, licensing, or creative direction. Infuse your brand with authentic cultural vibrancy.
                </p>
                <ul className="font-mono text-xs uppercase tracking-widest opacity-60 space-y-2">
                    <li>• Asset Licensing</li>
                    <li>• Packaging Design</li>
                    <li>• Event Activations</li>
                </ul>
            </div>
        </section>

        {/* THE PROCESS */}
        <section className="mb-32">
            <h2 className="font-mono text-sm uppercase tracking-widest text-[var(--accent-orange)] mb-12">The Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="relative pl-8 border-l border-[#333]">
                    <span className="absolute -left-[5px] top-0 w-2 h-2 bg-[var(--accent-purple)] rounded-full" />
                    <h4 className="font-serif text-2xl mb-2">01. Consult</h4>
                    <p className="font-sans text-sm opacity-60">We discuss your vision, space, and budget to define the scope.</p>
                </div>
                <div className="relative pl-8 border-l border-[#333]">
                    <span className="absolute -left-[5px] top-0 w-2 h-2 bg-[var(--accent-purple)] rounded-full" />
                    <h4 className="font-serif text-2xl mb-2">02. Proposal</h4>
                    <p className="font-sans text-sm opacity-60">I send sketches and a color palette for your approval.</p>
                </div>
                <div className="relative pl-8 border-l border-[#333]">
                    <span className="absolute -left-[5px] top-0 w-2 h-2 bg-[var(--accent-purple)] rounded-full" />
                    <h4 className="font-serif text-2xl mb-2">03. Creation</h4>
                    <p className="font-sans text-sm opacity-60">The work begins. Regular updates with photos and videos.</p>
                </div>
                <div className="relative pl-8 border-l border-[#333]">
                    <span className="absolute -left-[5px] top-0 w-2 h-2 bg-[var(--accent-purple)] rounded-full" />
                    <h4 className="font-serif text-2xl mb-2">04. Delivery</h4>
                    <p className="font-sans text-sm opacity-60">White-glove shipping and installation assistance.</p>
                </div>
            </div>
        </section>

        {/* FAQ */}
        <section className="mb-32 max-w-4xl">
            <h2 className="font-mono text-sm uppercase tracking-widest text-[var(--accent-orange)] mb-12">Common Questions</h2>
            <div className="space-y-8">
                <div className="border-b border-[#333] pb-6">
                    <h4 className="font-serif text-xl mb-2">What is the typical turnaround time?</h4>
                    <p className="font-sans opacity-60">For standard canvas commissions, allow 4-6 weeks. Large-scale murals may require 2-3 months planning and execution.</p>
                </div>
                <div className="border-b border-[#333] pb-6">
                    <h4 className="font-serif text-xl mb-2">Do you ship internationally?</h4>
                    <p className="font-sans opacity-60">Yes, we work with specialized art logistics partners to ship safely to anywhere in the world.</p>
                </div>
                <div className="border-b border-[#333] pb-6">
                    <h4 className="font-serif text-xl mb-2">Can I request specific colors?</h4>
                    <p className="font-sans opacity-60">Absolutely. While I maintain my artistic style, I am happy to work with a palette that harmonizes with your interior.</p>
                </div>
            </div>
        </section>

        {/* CTA */}
        <div className="w-full bg-[var(--accent-purple)] text-white p-16 md:p-24 rounded-2xl text-center">
            <h2 className="font-serif text-5xl md:text-7xl mb-8 leading-none">Ready to start?</h2>
            <p className="font-sans text-xl opacity-90 mb-12 max-w-xl mx-auto">
                Let’s create something that defines your space. Slots for 2026 are filling up fast.
            </p>
            <Link href="/contact" className="inline-block px-12 py-4 bg-white text-[var(--accent-purple)] font-mono text-xs uppercase tracking-widest hover:bg-[#121212] hover:text-white transition-colors rounded-full">
                Inquire Now
            </Link>
        </div>

      </div>
    </main>
  );
}
