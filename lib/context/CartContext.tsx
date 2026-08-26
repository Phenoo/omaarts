'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Artwork, Material } from '../types';
import type { User } from 'firebase/auth';
import { firebaseErrorDetails } from '@/lib/firebase/errorDetails';

interface CartItem {
  productType: 'artwork' | 'material';
  productId: string;
  /** Kept for backwards compatibility with carts saved before materials existed. */
  artworkId?: string;
  materialId?: string;
  title: string;
  price: number;
  image: string;
  quantity: number; // strictly 1 for unique artworks
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Artwork | Material, quantity?: number) => void;
  removeFromCart: (productId: string, productType?: 'artwork' | 'material') => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isInCart: (productId: string, productType?: 'artwork' | 'material') => boolean;
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

/** Merge two carts by product type/id; localStorage items take priority for duplicates. */
function normalizeCartItem(item: CartItem): CartItem {
  const productType = item.productType || (item.materialId ? 'material' : 'artwork');
  const productId = item.productId || item.materialId || item.artworkId || '';
  return { ...item, productType, productId, ...(productType === 'artwork' ? { artworkId: productId } : { materialId: productId }) };
}

function mergeCarts(localCart: CartItem[], firestoreCart: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const rawItem of firestoreCart) {
    const item = normalizeCartItem(rawItem);
    map.set(`${item.productType}:${item.productId}`, item);
  }
  for (const rawItem of localCart) {
    const item = normalizeCartItem(rawItem);
    map.set(`${item.productType}:${item.productId}`, item); // local items overwrite firestore dupes
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
        setCart(localCart.map(normalizeCartItem));
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

  const addToCart = useCallback((product: Artwork | Material, quantity = 1) => {
    const productType = 'medium' in product || 'artist' in product ? 'artwork' : 'material';
    const safeQuantity = productType === 'artwork' ? 1 : Math.max(1, Math.floor(quantity));
    setCart((prev) => {
      const existing = prev.find((item) => item.productType === productType && item.productId === product.id);
      if (existing) {
        if (productType === 'material') {
          return prev.map((item) => item === existing ? { ...item, quantity: item.quantity + safeQuantity } : item);
        }
        return prev;
      }

      const newItem: CartItem = {
        productType,
        productId: product.id,
        ...(productType === 'artwork' ? { artworkId: product.id } : { materialId: product.id }),
        title: product.title,
        price: product.price,
        image: product.images && product.images[0] ? product.images[0] : '/images/artist-studio.png',
        quantity: safeQuantity,
      };
      return [...prev, newItem];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, productType: 'artwork' | 'material' = 'artwork') => {
    setCart((prev) => prev.filter((item) => !(item.productType === productType && item.productId === productId)));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const isInCart = useCallback(
    (productId: string, productType: 'artwork' | 'material' = 'artwork') => {
      return cart.some((item) => item.productType === productType && item.productId === productId);
    },
    [cart]
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
