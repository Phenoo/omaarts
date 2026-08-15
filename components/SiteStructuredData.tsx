import JsonLd from '@/components/JsonLd';
import { absoluteUrl, SITE } from '@/lib/site';

export default function SiteStructuredData() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'ArtGallery'],
        '@id': `${SITE.url}/#organization`,
        name: SITE.name,
        url: SITE.url,
        logo: absoluteUrl('/images/oma-logo.jpg'),
        image: absoluteUrl('/images/studio/IMG_0889.png'),
        description: SITE.description,
        email: SITE.email,
        telephone: SITE.phoneDisplay,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Awka',
          addressRegion: 'Anambra',
          addressCountry: 'NG',
        },
        areaServed: { '@type': 'City', name: 'Awka' },
        sameAs: Object.values(SITE.social),
      },
      {
        '@type': 'Person',
        '@id': `${SITE.url}/#artist`,
        name: SITE.artist,
        url: absoluteUrl('/about'),
        jobTitle: 'Contemporary artist and creative studio founder',
        worksFor: { '@id': `${SITE.url}/#organization` },
        homeLocation: { '@type': 'City', name: 'Awka' },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.name,
        description: SITE.description,
        publisher: { '@id': `${SITE.url}/#organization` },
        inLanguage: 'en-NG',
      },
    ],
  };

  return <JsonLd data={graph} />;
}
