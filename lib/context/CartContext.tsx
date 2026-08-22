'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Artwork } from '../types';
import type { User } from 'firebase/auth';
import { firebaseErrorDetails } from '@/lib/firebase/errorDetails';

interface CartItem {
  artworkId: string;
  title: string;
  price: number;
  image: string;
  quantity: number; // strictly 1 for unique artworks
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (artwork: Artwork) => void;
  removeFromCart: (artworkId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isInCart: (artworkId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'oma_cart';

function getLocalCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalCart(cart: CartItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart to localStorage:', e);
  }
}

/** Merge two carts: union by artworkId, localStorage items take priority for duplicates */
function mergeCarts(localCart: CartItem[], firestoreCart: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of firestoreCart) {
    map.set(item.artworkId, item);
  }
  for (const item of localCart) {
    map.set(item.artworkId, item); // local items overwrite firestore dupes
  }
  return Array.from(map.values());
}

async function loadFirestoreCart(uid: string): Promise<CartItem[]> {
  const path = `users/${uid}/cart/items`;
  try {
    const [{ db }, { doc, getDoc }] = await Promise.all([
      import('../firebase/config'),
      import('firebase/firestore'),
    ]);
    const ref = doc(db, 'users', uid, 'cart', 'items');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return (snap.data().items as CartItem[]) || [];
    }
  } catch (e) {
    console.error('[Cart] Failed to load Firestore cart', {
      uid,
      path,
      ...firebaseErrorDetails(e),
    });
  }
  return [];
}

async function saveFirestoreCart(uid: string, cart: CartItem[]) {
  const path = `users/${uid}/cart/items`;
  try {
    const [{ db }, { doc, setDoc }] = await Promise.all([
      import('../firebase/config'),
      import('firebase/firestore'),
    ]);
    const ref = doc(db, 'users', uid, 'cart', 'items');
    await setDoc(ref, { items: cart, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.error('[Cart] Failed to save Firestore cart', {
      uid,
      path,
      itemCount: cart.length,
      ...firebaseErrorDetails(e),
    });
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncFirestoreCart, setSyncFirestoreCart] = useState(false);

  // Track auth state
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      const [{ auth, db }, { onAuthStateChanged }, { doc, getDoc }] = await Promise.all([
        import('../firebase/config'),
        import('firebase/auth'),
        import('firebase/firestore'),
      ]);

      if (!active) return;

      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!active) return;
        setCurrentUser(user);
        if (!user) {
          setSyncFirestoreCart(false);
          return;
        }

        try {
          const profileSnap = await getDoc(doc(db, 'users', user.uid));
          const role = profileSnap.exists() ? (profileSnap.data().role as string | undefined) : undefined;
          const isCustomer = role === 'customer';
          if (active) setSyncFirestoreCart(isCustomer);
        } catch (error) {
          if (active) setSyncFirestoreCart(false);
          console.error('[Cart] Failed to resolve account role for cart sync', {
            uid: user.uid,
            path: `users/${user.uid}`,
            ...firebaseErrorDetails(error),
          });
        }
      });
    };

    void initializeAuth();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  // Load cart on mount / auth change
  useEffect(() => {
    const loadCart = async () => {
      const localCart = getLocalCart();

      if (currentUser) {
        // Merge localStorage cart with Firestore cart
        const firestoreCart = await loadFirestoreCart(currentUser.uid);
        const merged = mergeCarts(localCart, firestoreCart);
        setCart(merged);

        // Save merged back to Firestore and clear localStorage duplicates
        await saveFirestoreCart(currentUser.uid, merged);
        // Keep localStorage in sync too for fast loads
        saveLocalCart(merged);
      } else {
        setCart(localCart);
      }
      setIsLoaded(true);
    };

    loadCart();
  }, [currentUser, syncFirestoreCart]);

  // Persist cart when it changes
  useEffect(() => {
    if (!isLoaded) return;

    saveLocalCart(cart);

    if (currentUser && syncFirestoreCart) {
      saveFirestoreCart(currentUser.uid, cart);
    }
  }, [cart, isLoaded, currentUser, syncFirestoreCart]);

  const addToCart = useCallback((artwork: Artwork) => {
    setCart((prev) => {
      const exists = prev.some((item) => item.artworkId === artwork.id);
      if (exists) return prev; // already in cart

      const newItem: CartItem = {
        artworkId: artwork.id,
        title: artwork.title,
        price: artwork.price,
        image: artwork.images && artwork.images[0] ? artwork.images[0] : '/images/artist-studio.png',
        quantity: 1, // capped at 1 for 1-of-1 artworks
      };
      return [...prev, newItem];
    });
  }, []);

  const removeFromCart = useCallback((artworkId: string) => {
    setCart((prev) => prev.filter((item) => item.artworkId !== artworkId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const isInCart = useCallback(
    (artworkId: string) => {
      return cart.some((item) => item.artworkId === artworkId);
    },
    [cart]
  );

  const cartCount = cart.length;
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
