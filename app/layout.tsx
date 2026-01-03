import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import SmoothScroller from '../components/SmoothScroller';
import CustomCursor from '../components/CustomCursor';
import NavigationOverlay from '../components/NavigationOverlay';

export const metadata: Metadata = {
  title: 'Arts by Oma | Nigerian Contemporary Art',
  description: 'Portfolio of Arts by Oma - Exploring memory, identity, and vibrant chaos through mixed media.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SmoothScroller>
          <CustomCursor />
          <NavigationOverlay />
          <div className="grain-overlay" />
          {children}
        </SmoothScroller>
      </body>
    </html>
  );
}
