'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { UserDoc, UserRole } from '../types';

interface AdminAuthContextType {
  user: User | null;
  adminProfile: UserDoc | null;
  loading: boolean;
  logout: () => Promise<void>;
  isStaff: boolean;
  isAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        try {
          // Fetch user profile from Firestore to check role
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            const profile = snap.data() as UserDoc;
            const role = profile.role;

            if (role === 'admin' || role === 'super_admin' || role === 'staff') {
              setUser(currentUser);
              setAdminProfile(profile);
            } else {
              // Not authorized: kick out
              console.warn(`User ${currentUser.email} has unauthorized role: ${role}`);
              await signOut(auth);
              setUser(null);
              setAdminProfile(null);
              if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
                router.push('/admin/login?error=unauthorized');
              }
            }
          } else {
            // Document doesn't exist: kick out
            console.warn(`No user document found for UID ${currentUser.uid}`);
            await signOut(auth);
            setUser(null);
            setAdminProfile(null);
            if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
              router.push('/admin/login?error=no-profile');
            }
          }
        } catch (e) {
          console.error('Error fetching admin user profile:', e);
          await signOut(auth);
          setUser(null);
          setAdminProfile(null);
        }
      } else {
        setUser(null);
        setAdminProfile(null);
        // If on admin subpage, redirect to login
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setAdminProfile(null);
    router.push('/admin/login');
    setLoading(false);
  };

  const role = adminProfile?.role;
  const isStaff = role === 'staff' || role === 'admin' || role === 'super_admin';
  const isAdmin = role === 'admin' || role === 'super_admin';

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        adminProfile,
        loading,
        logout,
        isStaff,
        isAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
