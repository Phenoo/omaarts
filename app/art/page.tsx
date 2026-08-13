import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import ArtworkFilters from '@/components/art/ArtworkFilters';
import JsonLd from '@/components/JsonLd';
import { getPublicArtworks } from '@/lib/public-data';
import { absoluteUrl, SITE } from '@/lib/site';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Art | Original Contemporary Works by Oma Achebe',
  description: 'Browse original contemporary artwork and the wider portfolio of Oma Achebe, based in Awka, Anambra, Nigeria.',
  alternates: { canonical: '/art' },
  openGraph: { title: 'Art | Artsy by Oma', description: 'Original contemporary works by Oma Achebe.', url: '/art', images: [{ url: '/images/selected-works/IMG_8055.jpg', alt: 'Original artwork by Oma Achebe' }] },
};

export default async function ArtPage() {
  const artworks = await getPublicArtworks();
  const breadcrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') }, { '@type': 'ListItem', position: 2, name: 'Art', item: absoluteUrl('/art') }] };
  const collection = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Art | Artsy by Oma', url: absoluteUrl('/art'), about: { '@type': 'Person', name: SITE.artist }, mainEntity: { '@type': 'ItemList', numberOfItems: artworks.length, itemListElement: artworks.map((artwork, index) => ({ '@type': 'ListItem', position: index + 1, url: absoluteUrl(`/art/${artwork.slug}`), name: artwork.title })) } };

  return (
    <main id="main-content" className="site-main">
      <JsonLd data={breadcrumb} />
      <JsonLd data={collection} />
      <div className="page-shell">
        <header className="page-intro">
          <p className="eyebrow">The work</p>
          <h1>Original contemporary art, made in Awka.</h1>
          <p>Explore available works and the wider portfolio of Oma Achebe, whose acrylic and mixed-media practice moves through memory, identity, womanhood, and everyday life.</p>
          <div className="page-intro__links"><Link href="/art/commissions" className="text-link">Discuss a commission</Link><Link href="/about" className="text-link">Meet the artist</Link></div>
        </header>
        <ArtworkFilters artworks={artworks} />
      </div>
      <Footer />
    </main>
  );
}
