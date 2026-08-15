import { INITIAL_ACTIVITIES } from '@/lib/firebase/services/seedData';
import { getAdminContext } from '@/lib/firebase/admin';
import { Activity, Artwork } from '@/lib/types';
import { withActivityImages } from '@/lib/activityImages';

export type PublicArtwork = Artwork & {
  availabilityLabel: string;
};

export type PublicExperience = Activity;

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

  return {
    ...publicArtwork,
    images: Array.isArray(publicArtwork.images) && publicArtwork.images.length > 0 ? publicArtwork.images : ['/images/artist-studio.png'],
    availabilityLabel:
      publicArtwork.status === 'AVAILABLE' && publicArtwork.availableForSale && publicArtwork.inventoryQty > 0 && publicArtwork.price > 0 ? 'Available' : 'Price on request',
  };
}

async function getFirebaseArtworks(): Promise<PublicArtwork[]> {
  const { adminDb, isConfigured } = getAdminContext();
  if (!isConfigured || !adminDb) return [];

  try {
    const snapshot = await adminDb.collection('artworks').where('status', '!=', 'ARCHIVED').get();
    if (snapshot.empty) return [];
    return snapshot.docs
      .map((doc) => normalizeArtwork(doc.id, doc.data()))
      .filter((artwork) => artwork.status !== 'RESERVED')
      .sort((a, b) => Number(b.featured) - Number(a.featured) || (b.year || '').localeCompare(a.year || ''));
  } catch (error) {
    console.error('Failed to fetch artworks from Firebase backend:', error);
    return [];
  }
}

async function getFirebaseExperiences(): Promise<PublicExperience[] | null> {
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
}

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
        if (data && data.status !== 'ARCHIVED') {
          return normalizeArtwork(docSnap.id, data);
        }
      }

      // 2. Query by slug property
      const querySnap = await adminDb.collection('artworks').where('slug', '==', slug).limit(1).get();
      if (!querySnap.empty) {
        const firstDoc = querySnap.docs[0];
        const data = firstDoc.data();
        if (data && data.status !== 'ARCHIVED') {
          return normalizeArtwork(firstDoc.id, data);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch artwork ${slug} from backend:`, error);
    }
  }

  const artworks = await getPublicArtworks();
  return artworks.find((artwork) => artwork.slug === slug || artwork.id === slug) || null;
}

export async function getPublicExperiences() {
  return (await getFirebaseExperiences()) || (INITIAL_ACTIVITIES as PublicExperience[]);
}

export async function getPublicExperience(slug: string) {
  const experiences = await getPublicExperiences();
  return experiences.find((experience) => experience.slug === slug || experience.id === slug) || null;
}
