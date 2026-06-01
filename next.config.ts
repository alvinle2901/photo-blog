import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    cacheComponents: true,
      images: {
    remotePatterns: [
      new URL('https://pub-2f67f9df6e7d4b1ba80499084f0127ba.r2.dev/photos/**'),
    ],
  },

};

export default nextConfig;

