import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Native module — load at runtime from node_modules, don't bundle it
  serverExternalPackages: ['@napi-rs/canvas'],
  // Bundle the .ttf files into the serverless function so GlobalFonts can read
  // them at runtime (Vercel ships no system fonts → invisible text otherwise).
  outputFileTracingIncludes: {
    '/api/posters/generate': ['./lib/rendering/fonts/**'],
    '/api/v1/generate': ['./lib/rendering/fonts/**'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'fonts.googleapis.com' },
      { protocol: 'https', hostname: 'fonts.gstatic.com' },
    ],
  },
  webpack: (config) => {
    // canvas module for server-side — keep it external
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
  // /preview was renamed to /studio — keep old links working.
  async redirects() {
    return [
      { source: '/preview', destination: '/studio', permanent: true },
      { source: '/preview/:path*', destination: '/studio/:path*', permanent: true },
    ];
  },
  // Security headers on every response — hardens the engine + admin against
  // clickjacking, MIME sniffing, referrer leakage, and downgrade attacks.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
};

export default nextConfig;
