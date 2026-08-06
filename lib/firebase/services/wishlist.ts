import { db } from '../config';
import {
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  collection,
} from 'firebase/firestore';
import { WishlistItem } from '../../types';

const WISHLIST_SUBCOLLECTION = 'wishlist';

/**
 * Add an artwork to the user's wishlist
 */
export async function addToWishlist(
  uid: string,
  item: Omit<WishlistItem, 'addedAt'>
): Promise<void> {
  const ref = doc(db, 'users', uid, WISHLIST_SUBCOLLECTION, item.artworkId);
  await setDoc(ref, {
    ...item,
    addedAt: new Date().toISOString(),
  });
}

/**
 * Remove an artwork from the user's wishlist
 */
export async function removeFromWishlist(
  uid: string,
  artworkId: string
): Promise<void> {
  const ref = doc(db, 'users', uid, WISHLIST_SUBCOLLECTION, artworkId);
  await deleteDoc(ref);
}

/**
 * Get all wishlisted artworks for a user
 */
export async function getWishlist(uid: string): Promise<WishlistItem[]> {
  const colRef = collection(db, 'users', uid, WISHLIST_SUBCOLLECTION);
  const snap = await getDocs(colRef);
  return snap.docs.map((d) => ({ ...d.data(), artworkId: d.id } as WishlistItem));
}

/**
 * Check if a specific artwork is in the user's wishlist
 */
export async function isInWishlist(
  uid: string,
  artworkId: string
): Promise<boolean> {
  const ref = doc(db, 'users', uid, WISHLIST_SUBCOLLECTION, artworkId);
  const snap = await getDoc(ref);
  return snap.exists();
}
