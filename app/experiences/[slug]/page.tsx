import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import BookingForm from '@/components/ui/BookingForm';
import JsonLd from '@/components/JsonLd';
import { getPublicExperience, getPublicExperiences } from '@/lib/public-data';
import { absoluteUrl, formatNaira, SITE } from '@/lib/site';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const experiences = await getPublicExperiences();
  return experiences.map((experience) => ({ slug: experience.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const experience = await getPublicExperience(slug);
  if (!experience) return { title: 'Experience not found', robots: { index: false, follow: true } };
  return { title: experience.name, description: `${experience.shortDescription || experience.description} Hosted in Awka by Artsy by Oma.`, alternates: { canonical: `/experiences/${experience.slug}` }, openGraph: { title: `${experience.name} | Artsy by Oma`, description: experience.shortDescription || experience.description, url: `/experiences/${experience.slug}`, images: [{ url: experience.images[0] || '/images/studio/IMG_0890.png', alt: `${experience.name} at Artsy by Oma` }] } };
}

export default async function ExperienceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const experience = await getPublicExperience(slug);
  if (!experience) notFound();
  const experiences = await getPublicExperiences();
  const related = experiences.filter((item) => item.id !== experience.id && item.category === experience.category).slice(0, 3);
  const price = experience.pricingModel === 'BOOKING_ONLY' || experience.pricingModel === 'CUSTOM_QUOTE' ? 'Enquire for pricing' : `${formatNaira(experience.variants.length > 0 ? Math.min(...experience.variants.map((variant) => variant.price)) : experience.basePrice)} / ${experience.priceUnit || 'person'}`;
  const breadcrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') }, { '@type': 'ListItem', position: 2, name: 'Experiences', item: absoluteUrl('/experiences') }, { '@type': 'ListItem', position: 3, name: experience.name, item: absoluteUrl(`/experiences/${experience.slug}`) }] };
  const service = { '@context': 'https://schema.org', '@type': 'Service', name: experience.name, description: experience.description, provider: { '@type': 'Person', name: SITE.artist }, areaServed: { '@type': 'City', name: 'Awka' }, offers: experience.basePrice > 0 ? { '@type': 'Offer', priceCurrency: 'NGN', price: experience.basePrice, url: absoluteUrl(`/experiences/${experience.slug}`) } : undefined };

  return (
    <main id="main-content" className="site-main">
      <JsonLd data={breadcrumb} /><JsonLd data={service} />
      <div className="page-shell">
        <Link href="/experiences" className="back-link">← All experiences</Link>
        <div className="experience-detail">
          <header className="mb-8 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent-orange)] font-semibold">{experience.category} · {experience.duration}</p>
            <h1 className="mt-3 font-serif text-5xl md:text-7xl tracking-tight leading-[0.9] text-[var(--accent-purple)]">{experience.name}</h1>
          </header>
          <div className="experience-detail__hero"><Image src={experience.images[0] || '/images/studio/IMG_0890.png'} alt={`${experience.name} at Artsy by Oma`} fill sizes="(max-width: 900px) 92vw, 62vw" priority className="object-cover" /></div>
          {experience.images.length > 1 && <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3" aria-label={`${experience.name} gallery`}>{experience.images.map((image, index) => <div key={image} className="relative aspect-square overflow-hidden rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface-soft)]"><Image src={image} alt={`${experience.name} example ${index + 1}`} fill sizes="(max-width: 640px) 45vw, 30vw" className="object-cover" /></div>)}</section>}
          <div className="experience-detail__grid">
            <article><p className="lede">{experience.description}</p><div className="detail-list"><div><strong>What happens</strong><span>Oma or a studio host guides the session step by step. No previous experience is needed.</span></div><div><strong>What is included</strong><span>{experience.complimentaryItems.join(', ') || 'Materials and guided instruction.'}</span></div><div><strong>Who it is for</strong><span>Friends, couples, first-timers, teams, and small groups.</span></div><div><strong>Where</strong><span>Artsy by Oma studio, Awka. Exact directions are shared with confirmed bookings.</span></div><div><strong>Bring</strong><span>Comfortable clothes and any snacks or cake you would like to share.</span></div><div><strong>Changes</strong><span>Contact the studio as early as possible to request rescheduling. Final cancellation terms are confirmed at booking.</span></div></div><div className="prose-block"><h2>Good to know</h2><p>Food, cake, and drinks can be brought for private sessions. Tell us about accessibility, dietary, or group needs when you enquire so we can prepare the studio thoughtfully.</p></div></article>
            <aside id="booking-form" className="booking-panel scroll-mt-24"><div className="booking-panel__price"><p className="eyebrow">Starting from</p><p className="font-sans text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--accent-orange)]">{price}</p></div><BookingForm activity={experience} /></aside>
          </div>
        </div>
        {related.length > 0 && <section className="related-section"><div className="section-heading"><p className="eyebrow">More from the studio</p><h2>You might also enjoy</h2></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <Link key={item.id} href={`/experiences/${item.slug}`} className="experience-card"><div className="experience-card__image"><Image src={item.images[0] || '/images/studio/IMG_0890.png'} alt={item.name} fill sizes="30vw" className="object-cover" /></div><h3 className="mt-4 font-serif text-2xl">{item.name}</h3></Link>)}</div></section>}
      </div>
      <a href="#booking-form" className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-full bg-[var(--accent-purple)] px-6 py-4 text-center font-mono text-xs uppercase tracking-[0.14em] text-white font-black shadow-[0_12px_30px_rgba(58,30,112,0.3)] transition-colors hover:bg-[var(--accent-orange)]">
        Book this experience
      </a>
      <Footer />
    </main>
  );
}
