import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import ArtworkActions from '@/components/art/ArtworkActions';
import ArtworkCard from '@/components/art/ArtworkCard';
import JsonLd from '@/components/JsonLd';
import { getPublicArtwork, getPublicArtworks } from '@/lib/public-data';
import { absoluteUrl, formatNaira, SITE } from '@/lib/site';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const artworks = await getPublicArtworks();
  return artworks.map((artwork) => ({ slug: artwork.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getPublicArtwork(slug);
  if (!artwork) return { title: 'Artwork not found', robots: { index: false, follow: true } };
  return {
    title: `${artwork.title} (${artwork.year}) by Oma Achebe`,
    description: `${artwork.title}, ${artwork.medium}, ${artwork.year}. View the story, dimensions, availability, and enquiry details for this original work by Oma Achebe.`,
    alternates: { canonical: `/art/${artwork.slug}` },
    openGraph: { title: `${artwork.title} by Oma Achebe`, description: artwork.description, url: `/art/${artwork.slug}`, images: [{ url: artwork.images[0], alt: `${artwork.title} by Oma Achebe` }] },
  };
}

export default async function ArtDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artwork = await getPublicArtwork(slug);
  if (!artwork) notFound();

  const allArtworks = await getPublicArtworks();
  const related = allArtworks.filter((item) => item.id !== artwork.id && (item.categoryId === artwork.categoryId || item.medium === artwork.medium)).slice(0, 3);
  const purchasable = artwork.status === 'AVAILABLE' && artwork.availableForSale && artwork.price > 0;
  const breadcrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') }, { '@type': 'ListItem', position: 2, name: 'Art', item: absoluteUrl('/art') }, { '@type': 'ListItem', position: 3, name: artwork.title, item: absoluteUrl(`/art/${artwork.slug}`) }] };
  const product = purchasable ? { '@context': 'https://schema.org', '@type': 'Product', name: artwork.title, image: artwork.images.map(absoluteUrl), description: artwork.description, brand: { '@type': 'Brand', name: SITE.name }, offers: { '@type': 'Offer', url: absoluteUrl(`/art/${artwork.slug}`), priceCurrency: artwork.currency, price: artwork.price, availability: artwork.inventoryQty > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', itemCondition: 'https://schema.org/NewCondition' } } : null;

  return (
    <main id="main-content" className="site-main">
      <JsonLd data={breadcrumb} />
      {product && <JsonLd data={product} />}
      <div className="page-shell">
        <Link href="/art" className="back-link">← Back to art</Link>
        <div className="art-detail">
          <div className="art-detail__media">
            {artwork.images.map((image, index) => <div key={image} className="art-detail__image"><Image src={image} alt={`${artwork.title} detail ${index + 1}`} fill sizes="(max-width: 900px) 92vw, 62vw" priority={index === 0} className="object-contain" /></div>)}
          </div>
          <article className="art-detail__copy">
            <p className="eyebrow">{artwork.availabilityLabel}</p>
            <h1>{artwork.title}</h1>
            <p className="lede">{artwork.description}</p>
            <dl className="detail-list"><div><dt>Artist</dt><dd>{artwork.artist || SITE.artist}</dd></div><div><dt>Year</dt><dd>{artwork.year}</dd></div><div><dt>Medium</dt><dd>{artwork.medium}</dd></div><div><dt>Dimensions</dt><dd>{artwork.dimensions}</dd></div><div><dt>Format</dt><dd>Original artwork</dd></div><div><dt>Framing</dt><dd>Confirm with studio</dd></div></dl>
            {artwork.story && <div className="prose-block"><h2>The work</h2><p>{artwork.story}</p></div>}
            <div className="purchase-panel"><p className="eyebrow">{purchasable ? formatNaira(artwork.price) : 'Price on request'}</p><p className="text-sm text-[var(--text-muted)]">Shipping, pickup, framing, and certificate-of-authenticity details are confirmed with the studio before purchase.</p><ArtworkActions artwork={artwork} /></div>
          </article>
        </div>
        {related.length > 0 && <section className="related-section"><div className="section-heading"><p className="eyebrow">Continue looking</p><h2>Related works</h2></div><div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <ArtworkCard key={item.id} artwork={item} />)}</div></section>}
      </div>
      <Footer />
    </main>
  );
}
