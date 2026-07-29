import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
