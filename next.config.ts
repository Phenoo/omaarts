import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin'],
  async redirects() {
    return [
      {
        source: '/work',
        destination: '/portfolio',
        permanent: true,
      },
      {
        source: '/work/:id',
        destination: '/portfolio/:id',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
