import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPublicArtwork } from '@/lib/public-data';
import { formatNaira } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function ArtworkPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const art = await getPublicArtwork(id);

    if (!art) {
        notFound();
    }

    return (
        <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            <div className="max-w-[90vw] mx-auto flex flex-col lg:flex-row gap-16 mb-24">
                
                {/* Image Section */}
                <div className="w-full lg:w-2/3 h-[80vh] relative bg-[#222]">
                    <Image 
                        src={art.images?.[0] || '/images/artist-studio.png'} 
                        alt={art.title} 
                        fill 
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Details Section */}
                <div className="w-full lg:w-1/3 flex flex-col justify-end pb-8">
                    <h1 className="font-serif text-5xl md:text-7xl mb-8 text-[var(--accent-purple)] leading-none">{art.title}</h1>
                    
                    <div className="space-y-6 font-mono text-sm border-t border-[#333] pt-8">
                        <div className="flex justify-between">
                            <span className="opacity-50">Year</span>
                            <span>{art.year}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="opacity-50">Medium</span>
                            <span>{art.medium}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="opacity-50">Size</span>
                            <span>{art.dimensions}</span>
                        </div>
                        <div className="flex justify-between text-[var(--accent-orange)]">
                            <span className="opacity-50">Price</span>
                            <span>{art.status === 'AVAILABLE' && art.price > 0 ? formatNaira(art.price) : 'Price on request'}</span>
                        </div>
                    </div>

                    <p className="font-sans text-lg mt-12 mb-12 opacity-80 leading-relaxed">
                        {art.description}
                    </p>

                    <Link href="/contact" className="w-full py-4 bg-[var(--accent-purple)] text-[#121212] text-center font-mono uppercase tracking-widest hover:bg-white transition-colors">
                        Inquire to Purchase
                    </Link>
                </div>
            </div>
        </main>
    );
}
