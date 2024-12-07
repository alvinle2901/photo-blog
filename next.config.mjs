import withPlaiceholder from '@plaiceholder/next';

/**
 * @type {import('next').NextConfig}
 */
const config = {
  transpilePackages: ['@plaiceholder/next'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
    ],
    minimumCacheTTL: 60,
  },
  experimental: {
    turbo: {
      // ...
    },
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default withPlaiceholder(config);
