import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Space_Grotesk } from "next/font/google";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import SmoothScroller from '../components/SmoothScroller';
import CustomCursor from '../components/CustomCursor';
import NavigationOverlay from '../components/NavigationOverlay';
import { CartProvider } from '@/lib/context/CartContext';

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: 'Arts by Oma | Nigerian Contemporary Art',
  description: 'Portfolio of Arts by Oma - Exploring memory, identity, and vibrant chaos through mixed media.',
  openGraph: {
    title: 'Arts by Oma | Nigerian Contemporary Art',
    description: 'Portfolio of Arts by Oma - Exploring memory, identity, and vibrant chaos through mixed media.',
    url: 'https://artsybyoma.com',
    siteName: 'Arts by Oma',
    images: [
      {
        url: '/images/oma-logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Arts by Oma - Nigerian Contemporary Art',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arts by Oma | Nigerian Contemporary Art',
    description: 'Portfolio of Arts by Oma - Exploring memory, identity, and vibrant chaos through mixed media.',
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
      <body className={`${dmSans.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased`}>
        <CartProvider>
          <SmoothScroller>
            <CustomCursor />
            <NavigationOverlay />
            {children}
          </SmoothScroller>
        </CartProvider>
      </body>
    </html>
  );
}
