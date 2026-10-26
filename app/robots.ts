import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/checkout',
          '/bag',
          '/profile',
          '/verify-email/*',
          '/reset-password/*',
        ],
      },
    ],
    sitemap: 'https://zevrae.com/sitemap.xml',
  };
}
