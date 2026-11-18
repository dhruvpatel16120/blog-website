/** @type {import('next').NextConfig} */
const domainEnv = process.env.NEXT_IMAGE_DOMAINS || '';
const extraDomains = domainEnv
  .split(',')
  .map((d) => d.trim())
  .filter(Boolean);

const nextAuthHost = (() => {
  try {
    return process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).hostname : null;
  } catch {
    return null;
  }
})();

const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'github.com' },
      ...(nextAuthHost ? [{ protocol: 'https', hostname: nextAuthHost }] : []),
      ...extraDomains.map((d) => ({ protocol: 'https', hostname: d })),
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