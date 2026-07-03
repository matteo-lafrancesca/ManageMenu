import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/comi",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
    ],
  },
};

export default nextConfig;