import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(isDev ? ["'unsafe-eval'"] : []),
  'https://checkout.razorpay.com',
  'https://accounts.google.com',
].join(' ');

const connectSrc = [
  "'self'",
  ...(isDev ? ['http://localhost:5000'] : []),
  'https://api.zevrae.com',
  'https://tryon.zevrae.com',
  'https://cloud.appwrite.io',
  'https://*.appwrite.io',
  'https://accounts.google.com',
  'https://api.razorpay.com',
  'https://checkout.razorpay.com',
  'https://lumberjack.razorpay.com',
  ...(isDev ? ['ws:', 'wss:'] : []),
].join(' ');

const cspHeader = `
  default-src 'self';
  script-src ${scriptSrc};
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com;
  img-src 'self' data: blob: https://api.zevrae.com https://zevrae.com https://www.zevrae.com https://images.unsplash.com https://res.cloudinary.com https://cloud.appwrite.io https://*.appwrite.io https://i.ibb.co https://*.googleusercontent.com https://*.razorpay.com;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src ${connectSrc};
  frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://accounts.google.com;
  worker-src 'self' blob:;
  child-src 'self' blob: https://checkout.razorpay.com https://api.razorpay.com https://accounts.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`
  .replace(/\s{2,}/g, ' ')
  .trim();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.zevrae.com',
      },
      {
        protocol: 'https',
        hostname: 'zevrae.com',
      },
      {
        protocol: 'https',
        hostname: 'www.zevrae.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io',
      },
      {
        protocol: 'https',
        hostname: '**.appwrite.io',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'https://api.zevrae.com';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy-Report-Only',
            value: cspHeader,
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
