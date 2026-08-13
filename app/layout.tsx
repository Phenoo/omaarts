import type { Metadata } from "next";
import "./globals.css";

import SmoothScroller from '../components/SmoothScroller';
import NavigationOverlay from '../components/NavigationOverlay';
import { CartProvider } from '@/lib/context/CartContext';
import { CustomerAuthProvider } from '@/lib/context/CustomerAuthContext';

export const metadata: Metadata = {
  metadataBase: new URL('https://artsybyoma.com'),
  title: {
    default: 'Artsy by Oma | Contemporary Artist in Awka, Nigeria',
    template: '%s | Artsy by Oma',
  },
  description: 'Original contemporary artwork, guided studio experiences, and private creative events by Oma Achebe in Awka, Nigeria.',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Artsy by Oma | Nigerian Contemporary Art',
    description: 'Original contemporary artwork, guided studio experiences, and private creative events by Oma Achebe in Awka, Nigeria.',
    url: 'https://artsybyoma.com',
    siteName: 'Artsy by Oma',
    images: [
      {
        url: '/images/oma-logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Artsy by Oma - Nigerian Contemporary Art',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artsy by Oma | Nigerian Contemporary Art',
    description: 'Original contemporary artwork, guided studio experiences, and private creative events by Oma Achebe in Awka, Nigeria.',
    images: ['/images/oma-logo.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CustomerAuthProvider>
          <CartProvider>
            <SmoothScroller>
              <NavigationOverlay />
              <a href="#main-content" className="skip-link">Skip to content</a>
              {children}
            </SmoothScroller>
          </CartProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
