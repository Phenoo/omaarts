import { MetadataRoute } from 'next';
import { SELECTED_WORKS } from '@/lib/selectedWorks';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://artsybyoma.com';
  const currentDate = new Date().toISOString();

  // Static site routes
  const staticRoutes = [
    { url: '', changeFrequency: 'daily' as const, priority: 1.0 },
    { url: '/about', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/portfolio', changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: '/work', changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: '/activities', changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: '/shop', changeFrequency: 'daily' as const, priority: 0.9 },
    { url: '/services', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/events', changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: '/contact', changeFrequency: 'monthly' as const, priority: 0.8 },
  ].map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Selected work detail pages
  const workRoutes = SELECTED_WORKS.map((work) => ({
    url: `${baseUrl}/work/${work.id}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...workRoutes];
}
