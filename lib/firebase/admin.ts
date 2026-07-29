import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

export const isConfigured = !!(privateKey && clientEmail);

let adminDb: ReturnType<typeof getFirestore>;
let adminAuth: ReturnType<typeof getAuth>;
let adminStorage: ReturnType<typeof getStorage>;

if (isConfigured) {
  const app = getApps().length === 0 
    ? initializeApp({
        credential: cert({
          projectId,
          clientEmail: clientEmail!,
          privateKey: privateKey!,
        }),
        storageBucket,
      })
    : getApp();

  adminDb = getFirestore(app);
  adminAuth = getAuth(app);
  adminStorage = getStorage(app);
} else {
  // Fallbacks or proxies for typed compilation compatibility
  adminDb = null as any;
  adminAuth = null as any;
  adminStorage = null as any;
}

export { adminDb, adminAuth, adminStorage };
export { getApp as adminApp };
