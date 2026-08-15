import { MetadataRoute } from 'next';
import { getPublicArtworks, getPublicExperiences } from '@/lib/public-data';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [artworks, experiences] = await Promise.all([getPublicArtworks(), getPublicExperiences()]);
  const now = new Date();
  const staticRoutes = ['/', '/art', '/art/commissions', '/experiences', '/private-events', '/about', '/contact', '/privacy', '/terms', '/shipping', '/returns', '/commission-terms'].map((path) => ({ url: absoluteUrl(path), lastModified: now, changeFrequency: path === '/' ? 'daily' as const : 'monthly' as const, priority: path === '/' ? .9 : .7 }));
  return [...staticRoutes, ...artworks.map((artwork) => ({ url: absoluteUrl(`/art/${artwork.slug}`), lastModified: new Date(artwork.updatedAt), changeFrequency: 'monthly' as const, priority: .7 })), ...experiences.map((experience) => ({ url: absoluteUrl(`/experiences/${experience.slug}`), lastModified: new Date(experience.updatedAt), changeFrequency: 'monthly' as const, priority: .7 }))];
}
