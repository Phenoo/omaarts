import Link from 'next/link';
import Image from 'next/image';

// Mock data lookup (ideally fetched from CMS/API)
const ARTWORKS: Record<string, { title: string; year: string; medium: string; dimensions: string; price: string; description: string; image: string }> = {
    'lagos-heat': {
        title: 'Lagos Heat',
        year: '2024',
        medium: 'Oil and Acrylic on Canvas',
        dimensions: '150 x 200 cm',
        price: '$4,500',
        description: 'A study of the frenetic energy of Balogun market at noon. The red hues symbolize the heat and passion of the city.',
        image: '/images/archive-1.png'
    },
    'indigo-dreams': {
        title: 'Indigo Dreams',
        year: '2023',
        medium: 'Adire fabric and Mixed Media',
        dimensions: '120 x 120 cm',
        price: '$3,200',
        description: 'Inspired by the traditional dyeing pits of Kano. A meditation on heritage and fading memory.',
        image: '/images/archive-2.png'
    },
    'market-noise': {
        title: 'Market Noise',
        year: '2025',
        medium: 'Textured Acrylic',
        dimensions: '180 x 180 cm',
        price: '$5,000',
        description: 'Visualizing sound through aggressive brushstrokes and heavy impasto.',
        image: '/images/hero-texture.png'
    },
    'ancestral': {
        title: 'Ancestral',
        year: '2024',
        medium: 'Installation / Photography',
        dimensions: 'Variable',
        price: '$8,000',
        description: 'A contemporary reimagining of ancestral shrines using industrial materials.',
        image: '/images/artist-studio.png'
    }
};

export function generateStaticParams() {
  return Object.keys(ARTWORKS).map((id) => ({ id }));
}

export default async function ArtworkPage({ params }: { params: Promise<{ id: string }> }) { // Updated for Next.js 15
    const { id } = await params;
    const art = ARTWORKS[id];

    if (!art) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">
                <h1 className="font-mono text-xl">Artwork Not Found</h1>
            </div>
        );
    }

    return (
        <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            <div className="max-w-[90vw] mx-auto flex flex-col lg:flex-row gap-16 mb-24">
                
                {/* Image Section */}
                <div className="w-full lg:w-2/3 h-[80vh] relative bg-[#222]">
                    <Image 
                        src={art.image} 
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
                            <span>{art.price}</span>
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
