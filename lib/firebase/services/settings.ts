import { db } from '../config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { BlockedDate } from '../../types';

export interface SiteSettings {
  damagePolicy: string;
  contactPhone: string;
  contactEmail: string;
  openingHours: string;
  studioAddress: string;
  featuredAlertText?: string;
  enableCheckoutAlert?: boolean;
}

const SETTINGS_DOC_ID = 'site_config';

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return snap.data() as SiteSettings;
    }

    // Default fallback settings
    return {
      damagePolicy: "Guests are responsible for damage caused during their stay. Studio equipment and facilities should be treated with care and left in appropriate condition after use.",
      contactPhone: "+2348167009545",
      contactEmail: "support@artsybyoma.com",
      openingHours: "Tue - Sun: 11:00 AM - 8:00 PM",
      studioAddress: "ABO Gallery, No. 40 Majuo Street, Umudioka, Awka, Nigeria.",
      featuredAlertText: "Book early! Weekend slots fill up extremely fast.",
      enableCheckoutAlert: true
    };
  } catch (error) {
    console.error('Error fetching site settings:', error);
    throw error;
  }
}

export async function saveSiteSettings(data: SiteSettings): Promise<void> {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error('Error saving site settings:', error);
    throw error;
  }
}

// Blocked Calendar Dates
export async function getBlockedDates(): Promise<(BlockedDate & { id: string })[]> {
  try {
    const colRef = collection(db, 'blockedDates');
    const q = query(colRef, orderBy('date', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as (BlockedDate & { id: string })[];
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    throw error;
  }
}

export async function addBlockedDate(data: Omit<BlockedDate, 'id'>): Promise<string> {
  try {
    const colRef = collection(db, 'blockedDates');
    const docRef = await addDoc(colRef, data);
    return docRef.id;
  } catch (error) {
    console.error('Error adding blocked date:', error);
    throw error;
  }
}

export async function removeBlockedDate(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'blockedDates', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting blocked date ${id}:`, error);
    throw error;
  }
}
