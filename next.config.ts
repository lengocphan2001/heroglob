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
    ],
  },
  webpack: (config, { isServer }) => {
    // Exclude admin and backend folders from Next.js build
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules', '**/admin/**', '**/backend/**'],
    };
    return config;
  },
  // Exclude admin and backend from TypeScript checking
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
