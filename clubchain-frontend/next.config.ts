import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Disable unstable prefetch to avoid server/client issues
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Disable prefetching to avoid the error
  reactStrictMode: true,
};

export default nextConfig;
