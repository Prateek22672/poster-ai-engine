import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Native module — load at runtime from node_modules, don't bundle it
  serverExternalPackages: ['@napi-rs/canvas'],
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
};

export default nextConfig;
