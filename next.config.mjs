/** @type {import('next').NextConfig} */
const domainEnv = process.env.NEXT_IMAGE_DOMAINS || '';
const extraDomains = domainEnv
  .split(',')
  .map((d) => d.trim())
  .filter(Boolean);

const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'picsum.photos',
      ...extraDomains,
    ],
  },
  experimental: {
    optimizePackageImports: [
      'date-fns',
      'react-icons',
      '@headlessui/react',
      'lucide-react',
    ],
  },
  // Handle admin routes dynamically
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Production settings
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;