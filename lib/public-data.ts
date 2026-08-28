import { INITIAL_ACTIVITIES } from '@/lib/firebase/services/seedData';
import { getAdminContext } from '@/lib/firebase/admin';
import { Activity, Artwork, Material } from '@/lib/types';
import { withActivityImages } from '@/lib/activityImages';
import { unstable_cache } from 'next/cache';

export type PublicArtwork = Artwork & {
  availabilityLabel: string;
};

export type PublicExperience = Activity;
export type PublicMaterial = Material;

const HIDDEN_ARTWORK_TITLES = new Set(['testing', 'testing this']);
const HIDDEN_ARTWORK_SLUGS = new Set(['testing', 'testing-this']);
const ARTWORK_ROUTE_ALIASES: Record<string, string[]> = {
  // Keep the existing public URL (including its historical spelling) while
  // resolving it to the correctly named artwork record.
  'rio-de-jainero-2025': ['rio-de-janeiro-2025'],
  'dubai-2025': ['dubai-2025'],
};

function isPublishedArtwork(data: {
  id?: unknown;
  title?: unknown;
  slug?: unknown;
  status?: unknown;
  published?: unknown;
  isPublished?: unknown;
  visibility?: unknown;
}) {
  const title = typeof data.title === 'string' ? data.title.trim().toLowerCase() : '';
  const slug = typeof data.slug === 'string' ? data.slug.trim().toLowerCase() : '';
  const id = typeof data.id === 'string' ? data.id.trim().toLowerCase() : '';
  const visibility = typeof data.visibility === 'string' ? data.visibility.toLowerCase() : '';
  return data.status !== 'ARCHIVED'
    && data.published !== false
    && data.isPublished !== false
    && visibility !== 'private'
    && visibility !== 'unpublished'
    && !HIDDEN_ARTWORK_TITLES.has(title)
    && !HIDDEN_ARTWORK_SLUGS.has(slug)
    && !HIDDEN_ARTWORK_SLUGS.has(id);
}

function routeMatchesArtwork(routeSlug: string, artwork: PublicArtwork) {
  const haystack = `${artwork.title} ${artwork.description || ''} ${artwork.story || ''}`.toLowerCase();
  // These routes previously pointed at the wrong records. Require the place
  // name in the artwork content before accepting an alias match.
  if (routeSlug === 'rio-de-jainero-2025') return haystack.includes('rio de janeiro');
  if (routeSlug === 'dubai-2025') return haystack.includes('dubai');
  const candidates = ARTWORK_ROUTE_ALIASES[routeSlug] || [routeSlug];
  return candidates.includes(artwork.slug) || candidates.includes(artwork.id);
}

function normalizeRouteArtwork(routeSlug: string, artwork: PublicArtwork): PublicArtwork {
  if (routeSlug === 'dubai-2025' && artwork.title.trim().toLowerCase() === 'uae 2025') {
    return { ...artwork, title: 'Dubai 2025', slug: 'dubai-2025' };
  }
  if (routeSlug === 'rio-de-jainero-2025') return { ...artwork, slug: 'rio-de-jainero-2025' };
  return artwork;
}

function cleanDate(value: unknown) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return new Date().toISOString();
}

function normalizeArtwork(id: string, data: Record<string, unknown>): PublicArtwork {
  const artwork = {
    id,
    ...data,
    createdAt: cleanDate(data.createdAt),
    updatedAt: cleanDate(data.updatedAt),
    reservationExpiresAt: data.reservationExpiresAt ? cleanDate(data.reservationExpiresAt) : undefined,
  } as Artwork;

  const reservationExpired = artwork.status === 'RESERVED'
    && (!artwork.reservationExpiresAt || Date.parse(artwork.reservationExpiresAt) <= Date.now());
  const publicArtwork = reservationExpired
    ? { ...artwork, status: 'AVAILABLE' as const, availableForSale: true, inventoryQty: Math.max(artwork.inventoryQty || 0, 1) }
    : artwork;

  const titleYear = typeof publicArtwork.title === 'string'
    ? [...publicArtwork.title.matchAll(/\b(?:19|20)\d{2}\b/g)].at(-1)?.[0]
    : undefined;

  return {
    ...publicArtwork,
    ...(titleYear ? { year: titleYear } : {}),
    images: Array.isArray(publicArtwork.images) && publicArtwork.images.length > 0 ? publicArtwork.images : ['/images/artist-studio.png'],
    availabilityLabel:
      publicArtwork.status === 'AVAILABLE' && publicArtwork.availableForSale && publicArtwork.inventoryQty > 0 && publicArtwork.price > 0 ? 'Available' : 'Price on request',
  };
}

const getFirebaseArtworks = unstable_cache(async (): Promise<PublicArtwork[]> => {
  const { adminDb, isConfigured } = getAdminContext();
  if (!isConfigured || !adminDb) return [];

  try {
    const snapshot = await adminDb.collection('artworks').where('status', '!=', 'ARCHIVED').get();
    if (snapshot.empty) return [];
    return snapshot.docs
      .map((doc) => normalizeArtwork(doc.id, doc.data()))
      .filter((artwork) => artwork.status !== 'RESERVED' && isPublishedArtwork(artwork))
      .sort((a, b) => Number(b.featured) - Number(a.featured) || (b.year || '').localeCompare(a.year || ''));
  } catch (error) {
    console.error('Failed to fetch artworks from Firebase backend:', error);
    return [];
  }
}, ['public-artworks'], { revalidate: 300 });

const getFirebaseExperiences = unstable_cache(async (): Promise<PublicExperience[] | null> => {
  const { adminDb, isConfigured } = getAdminContext();
  if (!isConfigured || !adminDb) return null;

  try {
    const snapshot = await adminDb.collection('activities').where('active', '==', true).get();
    if (snapshot.empty) return null;
    return snapshot.docs
      .map((doc) => withActivityImages({ id: doc.id, ...doc.data() } as Activity))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (error) {
    console.error('Public experience read failed; using safe fallback data.', error);
    return null;
  }
}, ['public-experiences'], { revalidate: 300 });

const getFirebaseMaterials = async (): Promise<PublicMaterial[]> => {
  const { adminDb, isConfigured } = getAdminContext();
  if (!isConfigured || !adminDb) return [];

  try {
    const snapshot = await adminDb.collection('materials').where('status', '!=', 'ARCHIVED').get();
    return snapshot.docs
      .map((doc) => {
        const data = doc.data() as Record<string, unknown>;
        return {
          id: doc.id,
          ...data,
          images: Array.isArray(data.images) && data.images.length > 0 ? data.images : ['/images/artist-studio.png'],
          reservedQty: typeof data.reservedQty === 'number' ? data.reservedQty : 0,
        } as Material;
      })
      .filter((material) => material.availableForSale && material.inventoryQty - (material.reservedQty || 0) > 0)
      .sort((a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title));
  } catch (error) {
    console.error('Failed to fetch materials from Firebase backend:', error);
    return [];
  }
};

export async function getPublicArtworks(): Promise<PublicArtwork[]> {
  return await getFirebaseArtworks();
}

export async function getPublicArtwork(slug: string): Promise<PublicArtwork | null> {
  const { adminDb, isConfigured } = getAdminContext();
  if (isConfigured && adminDb) {
    try {
      // 1. Query by doc id / slug
      const docSnap = await adminDb.collection('artworks').doc(slug).get();
      if (docSnap.exists) {
        const data = docSnap.data();
        if (data && isPublishedArtwork(data)) {
          const artwork = normalizeArtwork(docSnap.id, data);
          if (isPublishedArtwork(artwork) && routeMatchesArtwork(slug, artwork)) return normalizeRouteArtwork(slug, artwork);
        }
      }

      // 2. Query by slug property
      const querySnap = await adminDb.collection('artworks').where('slug', '==', slug).limit(1).get();
      if (!querySnap.empty) {
        const firstDoc = querySnap.docs[0];
        const data = firstDoc.data();
        if (data && isPublishedArtwork(data)) {
          const artwork = normalizeArtwork(firstDoc.id, data);
          if (isPublishedArtwork(artwork) && routeMatchesArtwork(slug, artwork)) return normalizeRouteArtwork(slug, artwork);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch artwork ${slug} from backend:`, error);
    }
  }

  const artworks = await getPublicArtworks();
  const match = artworks.find((artwork) => routeMatchesArtwork(slug, artwork));
  return match ? normalizeRouteArtwork(slug, match) : null;
}

export async function getPublicExperiences() {
  return (await getFirebaseExperiences()) || (INITIAL_ACTIVITIES as PublicExperience[]);
}

export async function getPublicExperience(slug: string) {
  const experiences = await getPublicExperiences();
  return experiences.find((experience) => experience.slug === slug || experience.id === slug) || null;
}

export async function getPublicMaterials(): Promise<PublicMaterial[]> {
  return await getFirebaseMaterials();
}
