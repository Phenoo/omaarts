'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { UserDoc } from '../types';
import { isAdminRole, isStaffRole } from '@/lib/auth/roles';
import { firebaseErrorDetails } from '@/lib/firebase/errorDetails';

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
      console.info('[AdminAuth] Auth state changed', {
        uid: currentUser?.uid ?? null,
        route: pathname,
        projectId: auth.app.options.projectId,
      });
      if (currentUser) {
        try {
          // Fetch user profile from Firestore to check role
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            const profile = snap.data() as UserDoc;
            const role = profile.role;

            console.info('[AdminAuth] Profile resolved', {
              uid: currentUser.uid,
              role,
              isStaff: isStaffRole(role),
              isAdmin: isAdminRole(role),
            });

            if (isStaffRole(role)) {
              setUser(currentUser);
              setAdminProfile(profile);
            } else {
              // Not authorized: kick out
              console.warn('[AdminAuth] User is not authorized for the admin console', {
                uid: currentUser.uid,
                role,
              });
              await signOut(auth);
              setUser(null);
              setAdminProfile(null);
              if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
                router.push('/admin/login?error=unauthorized');
              }
            }
          } else {
            // Document doesn't exist: kick out
            console.warn('[AdminAuth] No user profile document found', {
              uid: currentUser.uid,
              path: `users/${currentUser.uid}`,
            });
            await signOut(auth);
            setUser(null);
            setAdminProfile(null);
            if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
              router.push('/admin/login?error=no-profile');
            }
          }
        } catch (e) {
          console.error('[AdminAuth] Failed to resolve admin profile', {
            uid: currentUser.uid,
            path: `users/${currentUser.uid}`,
            ...firebaseErrorDetails(e),
          });
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
  const isStaff = isStaffRole(role);
  const isAdmin = isAdminRole(role);

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
