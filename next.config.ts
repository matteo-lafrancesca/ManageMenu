import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/menumanage",
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