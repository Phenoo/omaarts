'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { CustomerProfile } from '../types';

interface CustomerAuthContextType {
  user: User | null;
  profile: CustomerProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<Pick<CustomerProfile, 'displayName' | 'phone' | 'defaultAddress'>>) => Promise<void>;
  isAuthenticated: boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

async function ensureUserDoc(user: User): Promise<CustomerProfile> {
  const [{ db }, { doc, getDoc, setDoc }] = await Promise.all([
    import('../firebase/config'),
    import('firebase/firestore'),
  ]);
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return snap.data() as CustomerProfile;
  }

  // Create new customer profile
  const newProfile: CustomerProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || undefined,
    role: 'customer',
    createdAt: new Date().toISOString(),
  };

  await setDoc(userRef, newProfile);
  return newProfile;
}

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      const [{ auth }, { onAuthStateChanged }] = await Promise.all([
        import('../firebase/config'),
        import('firebase/auth'),
      ]);

      if (!active) return;

      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (!active) return;
        setLoading(true);
        if (currentUser) {
          try {
            const userProfile = await ensureUserDoc(currentUser);

            // Only set state for customers (not admin/staff — they use AdminAuthContext)
            if (active && userProfile.role === 'customer') {
              setUser(currentUser);
              setProfile(userProfile);
            } else if (active) {
              setUser(null);
              setProfile(null);
            }
          } catch (e) {
            console.error('Error fetching customer profile:', e);
            if (active) {
              setUser(null);
              setProfile(null);
            }
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        if (active) setLoading(false);
      });
    };

    void initializeAuth();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const [{ auth }, { signInWithEmailAndPassword }] = await Promise.all([
      import('../firebase/config'),
      import('firebase/auth'),
    ]);
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const [{ auth, db }, { createUserWithEmailAndPassword, updateProfile: updateFirebaseProfile }, { doc, setDoc }] = await Promise.all([
      import('../firebase/config'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ]);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateFirebaseProfile(cred.user, { displayName: name });

    // Create Firestore doc
    const newProfile: CustomerProfile = {
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName: name,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), newProfile);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const [{ auth }, { signInWithRedirect, GoogleAuthProvider }] = await Promise.all([
      import('../firebase/config'),
      import('firebase/auth'),
    ]);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithRedirect(auth, provider);
  }, []);

  const logout = useCallback(async () => {
    const [{ auth }, { signOut }] = await Promise.all([
      import('../firebase/config'),
      import('firebase/auth'),
    ]);
    await signOut(auth);
    setUser(null);
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const [{ auth }, { sendPasswordResetEmail }] = await Promise.all([
      import('../firebase/config'),
      import('firebase/auth'),
    ]);
    await sendPasswordResetEmail(auth, email);
  }, []);

  const updateProfileFn = useCallback(async (
    data: Partial<Pick<CustomerProfile, 'displayName' | 'phone' | 'defaultAddress'>>
  ) => {
    if (!user) throw new Error('Not authenticated');

    const [{ db }, { doc, updateDoc, getDoc }] = await Promise.all([
      import('../firebase/config'),
      import('firebase/firestore'),
    ]);
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    // Update Firebase profile if displayName changed
    if (data.displayName) {
      const { updateProfile: updateFirebaseProfile } = await import('firebase/auth');
      await updateFirebaseProfile(user, { displayName: data.displayName });
    }

    // Refresh local state
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      setProfile(snap.data() as CustomerProfile);
    }
  }, [user]);

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
        resetPassword,
        updateProfile: updateProfileFn,
        isAuthenticated: !!user && !!profile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
