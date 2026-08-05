import { db } from '../config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { Artwork, Category, InventoryMovement, AuditLog } from '../../types';

export async function getArtworks(options?: {
  categoryId?: string;
  status?: string;
  featuredOnly?: boolean;
  sortByPrice?: 'asc' | 'desc';
}): Promise<Artwork[]> {
  try {
    const colRef = collection(db, 'artworks');
    let queries = [];

    // Filter active/non-archived artworks
    queries.push(where('status', '!=', 'ARCHIVED'));

    if (options?.categoryId && options.categoryId !== 'all') {
      queries.push(where('categoryId', '==', options.categoryId));
    }

    if (options?.status && options.status !== 'all') {
      queries.push(where('status', '==', options.status));
    }

    if (options?.featuredOnly) {
      queries.push(where('featured', '==', true));
    }

    // Standard query compilation
    let q = query(colRef, ...queries);
    const snapshot = await getDocs(q);
    
    let artworks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Artwork[];

    // Sort by price if requested (done in memory because Firestore requires complex indices for range queries + sorting on unequal fields)
    if (options?.sortByPrice) {
      artworks.sort((a, b) => {
        return options.sortByPrice === 'asc' ? a.price - b.price : b.price - a.price;
      });
    } else {
      // Default chronological sort
      artworks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return artworks;
  } catch (error) {
    console.error('Error fetching artworks:', error);
    throw error;
  }
}

export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  try {
    const colRef = collection(db, 'artworks');
    const q = query(colRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const docSnap = snapshot.docs[0];
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Artwork;
  } catch (error) {
    console.error(`Error fetching artwork ${slug}:`, error);
    throw error;
  }
}

export async function createArtwork(
  data: Omit<Artwork, 'id' | 'createdAt' | 'updatedAt'>,
  adminUid: string
): Promise<string> {
  try {
    const colRef = collection(db, 'artworks');
    const docRef = doc(colRef, data.slug);
    
    const checkDoc = await getDoc(docRef);
    if (checkDoc.exists()) {
      throw new Error(`Artwork with slug '${data.slug}' already exists.`);
    }

    const artworkDoc = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const batch = writeBatch(db);
    batch.set(docRef, artworkDoc);

    // Write inventory movement log
    if (data.inventoryQty > 0) {
      const movementRef = doc(collection(db, 'inventoryMovements'));
      const movementDoc: InventoryMovement = {
        id: movementRef.id,
        artworkId: data.slug,
        type: 'IN',
        quantity: data.inventoryQty,
        reason: 'SEEDED',
        timestamp: new Date().toISOString()
      };
      batch.set(movementRef, movementDoc);
    }

    // Write audit log
    const auditRef = doc(collection(db, 'auditLogs'));
    const auditLogDoc: AuditLog = {
      id: auditRef.id,
      adminUid,
      action: 'ARTWORK_CREATED',
      resourceType: 'artwork',
      resourceId: data.slug,
      afterInfo: artworkDoc as any,
      timestamp: new Date().toISOString()
    };
    batch.set(auditRef, auditLogDoc);

    await batch.commit();
    return data.slug;
  } catch (error) {
    console.error('Error creating artwork:', error);
    throw error;
  }
}

export async function updateArtwork(
  id: string,
  updatedData: Partial<Artwork>,
  adminUid: string,
  notes?: string
): Promise<void> {
  try {
    const docRef = doc(db, 'artworks', id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error(`Artwork with ID ${id} does not exist`);
    }

    const beforeData = snapshot.data() as Artwork;
    const batch = writeBatch(db);

    // Track inventory adjustments
    const oldQty = beforeData.inventoryQty;
    const newQty = updatedData.inventoryQty;

    if (newQty !== undefined && oldQty !== newQty) {
      const difference = newQty - oldQty;
      const movementRef = doc(collection(db, 'inventoryMovements'));
      const movementDoc: InventoryMovement = {
        id: movementRef.id,
        artworkId: id,
        type: difference > 0 ? 'IN' : 'OUT',
        quantity: Math.abs(difference),
        reason: notes || 'Admin correction',
        timestamp: new Date().toISOString()
      };
      batch.set(movementRef, movementDoc);
    }

    // Audit logs
    const auditRef = doc(collection(db, 'auditLogs'));
    const auditLogDoc: AuditLog = {
      id: auditRef.id,
      adminUid,
      action: 'ARTWORK_UPDATED',
      resourceType: 'artwork',
      resourceId: id,
      beforeInfo: beforeData as any,
      afterInfo: { ...beforeData, ...updatedData } as any,
      timestamp: new Date().toISOString()
    };
    batch.set(auditRef, auditLogDoc);

    // Update operation
    batch.update(docRef, {
      ...updatedData,
      updatedAt: new Date().toISOString()
    });

    await batch.commit();
  } catch (error) {
    console.error(`Error updating artwork ${id}:`, error);
    throw error;
  }
}

export async function archiveArtwork(id: string, adminUid: string): Promise<void> {
  try {
    await updateArtwork(
      id,
      { status: 'ARCHIVED', availableForSale: false },
      adminUid,
      'Archived artwork'
    );
  } catch (error) {
    console.error(`Error archiving artwork ${id}:`, error);
    throw error;
  }
}

// Categories list helper
export async function getArtworkCategories(): Promise<Category[]> {
  try {
    const colRef = collection(db, 'categories');
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty) {
      // Return default initial list if empty
      return [
        { id: 'abstract', name: 'Abstract', type: 'artwork', slug: 'abstract' },
        { id: 'portrait', name: 'Portrait', type: 'artwork', slug: 'portrait' },
        { id: 'african-art', name: 'African Art', type: 'artwork', slug: 'african-art' },
        { id: 'contemporary', name: 'Contemporary', type: 'artwork', slug: 'contemporary' },
        { id: 'custom-work', name: 'Custom Work', type: 'artwork', slug: 'custom-work' },
        { id: 'mixed-media', name: 'Mixed Media', type: 'artwork', slug: 'mixed-media' },
      ];
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];
  } catch (error) {
    console.error('Error fetching artwork categories:', error);
    // Safe fallbacks
    return [
      { id: 'abstract', name: 'Abstract', type: 'artwork', slug: 'abstract' },
      { id: 'portrait', name: 'Portrait', type: 'artwork', slug: 'portrait' },
      { id: 'african-art', name: 'African Art', type: 'artwork', slug: 'african-art' },
      { id: 'contemporary', name: 'Contemporary', type: 'artwork', slug: 'contemporary' },
      { id: 'custom-work', name: 'Custom Work', type: 'artwork', slug: 'custom-work' },
      { id: 'mixed-media', name: 'Mixed Media', type: 'artwork', slug: 'mixed-media' },
    ];
  }
}

export async function getArtwork(id: string): Promise<Artwork | null> {
  try {
    const docRef = doc(db, 'artworks', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return {
      id: snap.id,
      ...snap.data()
    } as Artwork;
  } catch (error) {
    console.error('Error fetching artwork:', error);
    throw error;
  }
}
