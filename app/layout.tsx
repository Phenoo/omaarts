import type { Metadata } from "next";
import "./globals.css";

import SmoothScroller from '../components/SmoothScroller';
import NavigationOverlay from '../components/NavigationOverlay';
import SiteStructuredData from '@/components/SiteStructuredData';
import { CartProvider } from '@/lib/context/CartContext';
import { CustomerAuthProvider } from '@/lib/context/CustomerAuthContext';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Artsy by Oma | Contemporary Artist in Awka, Nigeria',
    template: '%s | Artsy by Oma',
  },
  description: SITE.description,
  keywords: ['Artsy by Oma', 'Oma Achebe', 'contemporary art Nigeria', 'art studio Awka', 'paint and sip Awka', 'private events Awka'],
  authors: [{ name: SITE.artist }],
  creator: SITE.artist,
  publisher: SITE.name,
  category: 'arts and culture',
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Artsy by Oma | Nigerian Contemporary Art',
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    images: [
      {
        url: '/images/studio/IMG_0889.png',
        alt: 'The Artsy by Oma creative studio in Awka',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artsy by Oma | Nigerian Contemporary Art',
    description: SITE.description,
    images: ['/images/studio/IMG_0889.png'],
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
              <SiteStructuredData />
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
