import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

export interface AdminContext {
  adminDb: Firestore | null;
  adminAuth: Auth | null;
  adminStorage: Storage | null;
  error?: string;
  isConfigured: boolean;
}

let cachedContext: AdminContext | null = null;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown Firebase Admin initialization error.';
}

function normalizePrivateKey() {
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!rawPrivateKey) {
    return '';
  }

  let privateKey = rawPrivateKey.trim();
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }

  return privateKey.replace(/\\n/g, '\n');
}

function buildAdminContext(): AdminContext {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const privateKey = normalizePrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    return {
      adminDb: null,
      adminAuth: null,
      adminStorage: null,
      error: 'Firebase Admin credentials are incomplete.',
      isConfigured: false,
    };
  }

  try {
    const app = getApps().length === 0
      ? initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
          storageBucket,
        })
      : getApp();

    const db = getFirestore(app);
    try {
      db.settings({ ignoreUndefinedProperties: true });
    } catch {
      // settings can only be set once
    }

    return {
      adminDb: db,
      adminAuth: getAuth(app),
      adminStorage: getStorage(app),
      isConfigured: true,
    };
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error('Firebase Admin SDK initialization failed:', error);

    return {
      adminDb: null,
      adminAuth: null,
      adminStorage: null,
      error: message,
      isConfigured: false,
    };
  }
}

export function getAdminContext(): AdminContext {
  if (!cachedContext) {
    cachedContext = buildAdminContext();
  }

  return cachedContext;
}

export function getAdminStorage(): Storage | null {
  return getAdminContext().adminStorage;
}

