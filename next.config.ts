import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/portfolio',
        destination: '/art',
        permanent: true,
      },
      {
        source: '/portfolio/:slug',
        destination: '/art/:slug',
        permanent: true,
      },
      {
        source: '/shop',
        destination: '/art',
        permanent: true,
      },
      {
        source: '/shop/:slug',
        destination: '/art/:slug',
        permanent: true,
      },
      {
        source: '/work',
        destination: '/art',
        permanent: true,
      },
      {
        source: '/work/:id',
        destination: '/art/:id',
        permanent: true,
      },
      {
        source: '/activities',
        destination: '/experiences',
        permanent: true,
      },
      {
        source: '/activities/:slug',
        destination: '/experiences/:slug',
        permanent: true,
      },
      {
        source: '/events',
        destination: '/private-events',
        permanent: true,
      },
      {
        source: '/services',
        destination: '/private-events',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Content-Security-Policy', value: "default-src 'self'; img-src 'self' data: blob: https://firebasestorage.googleapis.com https://storage.googleapis.com; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://api.paystack.co https://api.resend.com; frame-src https://checkout.paystack.com https://*.firebaseapp.com; object-src 'none'; base-uri 'self'; form-action 'self'" },
      ],
    }];
  },
};

export default nextConfig;
