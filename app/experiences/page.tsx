import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import ExperienceFilters from '@/components/experience/ExperienceFilters';
import JsonLd from '@/components/JsonLd';
import { getPublicExperiences } from '@/lib/public-data';
import { absoluteUrl, SITE } from '@/lib/site';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Experiences | Creative Studio Sessions in Awka',
  description: 'Book guided paint, craft, and social studio experiences at Artsy by Oma in Awka, Nigeria.',
  alternates: { canonical: '/experiences' },
  openGraph: { title: 'Experiences | Artsy by Oma', description: 'Guided creative sessions and paint-and-sip experiences in Awka.', url: '/experiences', images: [{ url: '/images/studio/IMG_0887.png', alt: 'Paint-and-sip tables inside the Artsy by Oma studio' }] },
};

export default async function ExperiencesPage() {
  const experiences = await getPublicExperiences();
  const breadcrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') }, { '@type': 'ListItem', position: 2, name: 'Experiences', item: absoluteUrl('/experiences') }] };
  const itemList = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Creative Experiences at Artsy by Oma', url: absoluteUrl('/experiences'), provider: { '@type': 'Person', name: SITE.artist }, mainEntity: { '@type': 'ItemList', numberOfItems: experiences.length, itemListElement: experiences.map((experience, index) => ({ '@type': 'ListItem', position: index + 1, url: absoluteUrl(`/experiences/${experience.slug}`), name: experience.name })) } };

  return (
    <main id="main-content" className="site-main">
      <JsonLd data={breadcrumb} /><JsonLd data={itemList} />
      <div className="page-shell">
        <header className="page-intro"><p className="eyebrow">The studio</p><h1>Make something. Leave with a memory.</h1><p>Guided paint, craft, and social sessions for first-timers, friends, couples, teams, and curious groups. Every experience is hosted from our creative studio in Awka.</p><div className="page-intro__links"><Link href="/private-events" className="text-link">Plan a private event</Link><Link href="/contact" className="text-link">Ask a question</Link></div></header>
        <ExperienceFilters experiences={experiences} />
      </div>
      <Footer />
    </main>
  );
}
