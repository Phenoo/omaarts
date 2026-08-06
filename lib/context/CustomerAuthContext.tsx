'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, db } from '../firebase/config';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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

const googleProvider = new GoogleAuthProvider();

async function ensureUserDoc(user: User): Promise<CustomerProfile> {
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        try {
          const userProfile = await ensureUserDoc(currentUser);

          // Only set state for customers (not admin/staff — they use AdminAuthContext)
          if (userProfile.role === 'customer') {
            setUser(currentUser);
            setProfile(userProfile);
          } else {
            // Admin/staff user — don't interfere, just clear customer context
            setUser(null);
            setProfile(null);
          }
        } catch (e) {
          console.error('Error fetching customer profile:', e);
          setUser(null);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
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
    await signInWithPopup(auth, googleProvider);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const updateProfileFn = useCallback(async (
    data: Partial<Pick<CustomerProfile, 'displayName' | 'phone' | 'defaultAddress'>>
  ) => {
    if (!user) throw new Error('Not authenticated');

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    // Update Firebase profile if displayName changed
    if (data.displayName) {
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
