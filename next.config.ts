import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.heroglobal.io.vn',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  // Turbopack configuration for Next.js 16
  turbopack: {},
};

export default nextConfig;
