import withPlaiceholder from '@plaiceholder/next';

/**
 * @type {import('next').NextConfig}
 */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io'
      },
      {
        protocol: 'https',
        hostname: 'github.com'
      }
    ]
  },
  experimental: {
    turbo: {
      // ...
    }
  }
};

export default withPlaiceholder(config);
