import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'About Oma Achebe',
  description: 'Meet Oma Achebe, a Nigerian contemporary artist working in acrylic and mixed media from Awka, Anambra.',
  pathname: '/about',
  image: '/images/about-me.jpg',
  imageAlt: 'Oma Achebe in her studio in Awka',
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
