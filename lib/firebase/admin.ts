import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

// Strip surrounding quotes and double-escaped newlines which often occur on hosting platform consoles like Vercel
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  privateKey = privateKey.trim();
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');
}

export let isConfigured = !!(privateKey && clientEmail);

let adminDb: ReturnType<typeof getFirestore>;
let adminAuth: ReturnType<typeof getAuth>;
let adminStorage: ReturnType<typeof getStorage>;

if (isConfigured) {
  try {
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
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed on startup:', error);
    isConfigured = false;
    adminDb = null as any;
    adminAuth = null as any;
    adminStorage = null as any;
  }
} else {
  adminDb = null as any;
  adminAuth = null as any;
  adminStorage = null as any;
}

export { adminDb, adminAuth, adminStorage };
export { getApp as adminApp };
