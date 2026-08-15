import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: 'Artsy by Oma',
    description: SITE.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f3ed',
    theme_color: '#2b1d42',
    icons: [{ src: '/images/oma-logo.jpg', sizes: '512x512', type: 'image/jpeg' }],
  };
}
