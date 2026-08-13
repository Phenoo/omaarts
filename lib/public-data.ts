import { INITIAL_ACTIVITIES } from '@/lib/firebase/services/seedData';
import { getAdminContext } from '@/lib/firebase/admin';
import { Activity, Artwork } from '@/lib/types';
import { SELECTED_WORKS } from '@/lib/selectedWorks';

export type PublicArtwork = Artwork & {
  availabilityLabel: string;
};

export type PublicExperience = Activity;

const fallbackArtworks: PublicArtwork[] = SELECTED_WORKS.map((work) => ({
  id: work.id,
  title: work.title,
  slug: work.id,
  description: work.description,
  story:
    'A contemporary study by Oma Achebe, built through layered colour, texture, and expressive mark-making.',
  artist: 'Oma Achebe',
  year: work.year,
  medium: work.medium,
  dimensions: work.dimensions,
  categoryId: 'contemporary',
  images: [work.image],
  price: 0,
  currency: 'NGN',
  inventoryQty: 0,
  availableForSale: false,
  featured: true,
  status: 'PORTFOLIO_ONLY',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  availabilityLabel: 'Price on request',
}));

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

async function getFirebaseArtworks(): Promise<PublicArtwork[] | null> {
  const { adminDb, isConfigured } = getAdminContext();
  if (!isConfigured || !adminDb) return null;

  try {
    const snapshot = await adminDb.collection('artworks').where('status', '!=', 'ARCHIVED').get();
    if (snapshot.empty) return null;
    return snapshot.docs
      .map((doc) => normalizeArtwork(doc.id, doc.data()))
      .filter((artwork) => artwork.status !== 'RESERVED')
      .sort((a, b) => Number(b.featured) - Number(a.featured) || b.year.localeCompare(a.year));
  } catch (error) {
    console.error('Public artwork read failed; using safe fallback data.', error);
    return null;
  }
}

async function getFirebaseExperiences(): Promise<PublicExperience[] | null> {
  const { adminDb, isConfigured } = getAdminContext();
  if (!isConfigured || !adminDb) return null;

  try {
    const snapshot = await adminDb.collection('activities').where('active', '==', true).get();
    if (snapshot.empty) return null;
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Activity))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (error) {
    console.error('Public experience read failed; using safe fallback data.', error);
    return null;
  }
}

export async function getPublicArtworks() {
  return (await getFirebaseArtworks()) || fallbackArtworks;
}

export async function getPublicArtwork(slug: string) {
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
