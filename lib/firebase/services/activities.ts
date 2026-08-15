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
  addDoc,
  writeBatch
} from 'firebase/firestore';
import { Activity, ActivityPriceHistory, AuditLog } from '../../types';
import { withActivityImages } from '../../activityImages';
import { removeUndefinedFields } from '../sanitize';

export async function getActivities(onlyActive = true): Promise<Activity[]> {
  try {
    const colRef = collection(db, 'activities');
    let q;
    
    if (onlyActive) {
      q = query(colRef, where('active', '==', true), orderBy('sortOrder', 'asc'));
    } else {
      q = query(colRef, orderBy('sortOrder', 'asc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => withActivityImages({
      id: doc.id,
      ...doc.data()
    } as Activity));
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
}

export async function getActivityBySlug(slug: string): Promise<Activity | null> {
  try {
    const colRef = collection(db, 'activities');
    const q = query(colRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const docSnap = snapshot.docs[0];
    return withActivityImages({
      id: docSnap.id,
      ...docSnap.data()
    } as Activity);
  } catch (error) {
    console.error(`Error fetching activity ${slug}:`, error);
    throw error;
  }
}

export async function getActivityById(id: string): Promise<Activity | null> {
  try {
    const docRef = doc(db, 'activities', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return withActivityImages({
      id: snap.id,
      ...snap.data()
    } as Activity);
  } catch (error) {
    console.error(`Error fetching activity ID ${id}:`, error);
    throw error;
  }
}

export const getActivity = getActivityById;

export async function updateActivity(
  id: string,
  updatedData: Partial<Activity>,
  adminUid: string,
  changeReason?: string
): Promise<void> {
  try {
    const docRef = doc(db, 'activities', id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error(`Activity with ID ${id} does not exist`);
    }

    const beforeData = snapshot.data() as Activity;
    const batch = writeBatch(db);

    // 1. Audit Price Change if price is altered
    const oldPrice = beforeData.basePrice;
    const newPrice = updatedData.basePrice;
    
    if (newPrice !== undefined && oldPrice !== newPrice) {
      const priceHistoryRef = doc(collection(db, 'activityPriceHistory'));
      const priceHistoryDoc: ActivityPriceHistory = {
        id: priceHistoryRef.id,
        resourceType: 'activity',
        resourceId: id,
        oldPrice,
        newPrice,
        changedBy: adminUid,
        reason: changeReason || 'Admin updated price',
        timestamp: new Date().toISOString(),
      };
      batch.set(priceHistoryRef, removeUndefinedFields(priceHistoryDoc));
    }

    const cleanUpdates = removeUndefinedFields({
      ...updatedData,
      updatedAt: new Date().toISOString(),
    });

    // 2. Log general action in Audit Logs
    const auditRef = doc(collection(db, 'auditLogs'));
    const auditLogDoc: AuditLog = {
      id: auditRef.id,
      adminUid,
      action: 'ARTWORK_UPDATED', // matches schema log action
      resourceType: 'activity',
      resourceId: id,
      beforeInfo: beforeData as any,
      afterInfo: { ...beforeData, ...cleanUpdates } as any,
      timestamp: new Date().toISOString(),
    };
    batch.set(auditRef, removeUndefinedFields(auditLogDoc));

    // 3. Perform update doc
    batch.update(docRef, cleanUpdates);

    await batch.commit();
  } catch (error) {
    console.error(`Error updating activity ${id}:`, error);
    throw error;
  }
}

export async function createActivity(
  data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>,
  adminUid: string
): Promise<string> {
  try {
    const colRef = collection(db, 'activities');
    
    const activityDoc = removeUndefinedFields({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Create doc with slug as document ID to ensure clean structure
    const docRef = doc(colRef, data.slug);
    
    // Check if ID already exists
    const checkDoc = await getDoc(docRef);
    if (checkDoc.exists()) {
      throw new Error(`Activity with slug '${data.slug}' already exists.`);
    }

    const batch = writeBatch(db);
    batch.set(docRef, activityDoc);

    // Log the create audit log
    const auditRef = doc(collection(db, 'auditLogs'));
    const auditLogDoc: AuditLog = {
      id: auditRef.id,
      adminUid,
      action: 'ARTWORK_CREATED',
      resourceType: 'activity',
      resourceId: data.slug,
      afterInfo: activityDoc as any,
      timestamp: new Date().toISOString(),
    };
    batch.set(auditRef, removeUndefinedFields(auditLogDoc));

    await batch.commit();
    return data.slug;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
}

export async function archiveActivity(id: string, adminUid: string): Promise<void> {
  try {
    await updateActivity(
      id,
      { active: false },
      adminUid,
      'Archived activity'
    );
  } catch (error) {
    console.error(`Error archiving activity ${id}:`, error);
    throw error;
  }
}
