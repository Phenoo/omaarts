import { collection, doc, getDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { Material, AuditLog, InventoryMovement } from '../../types';
import { db } from '../config';
import { removeUndefinedFields } from '../sanitize';

export async function getMaterials(options?: { includeArchived?: boolean }): Promise<Material[]> {
  const constraints = options?.includeArchived ? [] : [where('status', '!=', 'ARCHIVED')];
  const snapshot = await getDocs(query(collection(db, 'materials'), ...constraints));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() } as Material))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createMaterial(
  data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>,
  adminUid: string,
): Promise<string> {
  const ref = doc(collection(db, 'materials'), data.slug);
  if ((await getDoc(ref)).exists()) {
    throw new Error(`A material with slug '${data.slug}' already exists.`);
  }

  const now = new Date().toISOString();
  const material = removeUndefinedFields({ ...data, reservedQty: 0, createdAt: now, updatedAt: now });
  const batch = writeBatch(db);
  batch.set(ref, material);

  if (data.inventoryQty > 0) {
    const movementRef = doc(collection(db, 'inventoryMovements'));
    const movement: InventoryMovement = {
      id: movementRef.id,
      artworkId: data.slug,
      type: 'IN',
      quantity: data.inventoryQty,
      reason: 'SEEDED',
      description: 'Material created',
      timestamp: now,
    };
    batch.set(movementRef, removeUndefinedFields(movement));
  }

  const auditRef = doc(collection(db, 'auditLogs'));
  const audit: AuditLog = {
    id: auditRef.id,
    adminUid: adminUid || 'admin',
    action: 'MATERIAL_CREATED',
    resourceType: 'material',
    resourceId: data.slug,
    afterInfo: material as Record<string, unknown>,
    timestamp: now,
  };
  batch.set(auditRef, removeUndefinedFields(audit));
  await batch.commit();
  return data.slug;
}

export async function updateMaterial(id: string, updates: Partial<Material>, adminUid: string): Promise<void> {
  const ref = doc(db, 'materials', id);
  const existing = await getDoc(ref);
  if (!existing.exists()) throw new Error(`Material with ID '${id}' does not exist.`);
  const before = existing.data() as Material;
  const now = new Date().toISOString();
  const cleanUpdates = removeUndefinedFields({ ...updates, updatedAt: now });
  const batch = writeBatch(db);
  batch.update(ref, cleanUpdates);
  const auditRef = doc(collection(db, 'auditLogs'));
  const audit: AuditLog = {
    id: auditRef.id,
    adminUid: adminUid || 'admin',
    action: 'MATERIAL_UPDATED',
    resourceType: 'material',
    resourceId: id,
    beforeInfo: before as unknown as Record<string, unknown>,
    afterInfo: { ...before, ...cleanUpdates } as Record<string, unknown>,
    timestamp: now,
  };
  batch.set(auditRef, removeUndefinedFields(audit));
  await batch.commit();
}

export async function archiveMaterial(id: string, adminUid: string): Promise<void> {
  await updateMaterial(id, { status: 'ARCHIVED', availableForSale: false }, adminUid);
}
