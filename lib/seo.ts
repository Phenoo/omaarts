import type { Metadata } from 'next';
import { absoluteUrl, SITE } from '@/lib/site';

const DEFAULT_SOCIAL_IMAGE = '/images/artist-portrait.jpg';

export function createPageMetadata({
  title,
  description,
  pathname,
  image = DEFAULT_SOCIAL_IMAGE,
  imageAlt = 'Oma Achebe, artist and founder of Artsy by Oma',
  noIndex = false,
}: {
  title: string;
  description: string;
  pathname: string;
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
}): Metadata {
  const socialTitle = `${title} | ${SITE.name}`;

  return {
    title,
    description,
    alternates: { canonical: pathname },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: socialTitle,
      description,
      url: absoluteUrl(pathname),
      siteName: SITE.name,
      locale: 'en_NG',
      type: 'website',
      images: [{ url: image, alt: imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [image],
    },
  };
}
