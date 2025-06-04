import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/path/to/images/**',
      },
    ],
  },
  output: 'standalone',
};

export default nextConfig;
