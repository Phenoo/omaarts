import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { createPageMetadata } from '@/lib/seo';
import { absoluteUrl, SITE } from '@/lib/site';

export const metadata: Metadata = createPageMetadata({
  title: 'About Oma Achebe',
  description: 'Meet Oma Achebe, a Nigerian contemporary artist working in acrylic and mixed media from Awka, Anambra.',
  pathname: '/about',
  image: '/images/about-me.jpg',
  imageAlt: 'Oma Achebe in her studio in Awka',
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE.url}/#artist`,
    name: SITE.artist,
    url: absoluteUrl('/about'),
    jobTitle: 'Contemporary artist and creative studio founder',
    description: 'Nigerian contemporary artist working in acrylic and mixed media from Awka, Anambra.',
    sameAs: Object.values(SITE.social),
    worksFor: { '@id': `${SITE.url}/#organization` },
  };

  return <><JsonLd data={person} />{children}</>;
}
