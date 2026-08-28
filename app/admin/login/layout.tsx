import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Admin Login',
  alternates: { canonical: '/admin/login' },
  robots: { index: false, follow: false, noarchive: true },
};

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return children;
}
