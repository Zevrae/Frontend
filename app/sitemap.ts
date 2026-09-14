import type { MetadataRoute } from 'next';

const BASE_URL = 'https://zevrae.com';

const STATIC_ROUTES = [
  '',
  '/men',
  '/men/tshirts',
  '/men/lowers',
  '/men/henleys',
  '/women',
  '/women/tshirts',
  '/women/lowers',
  '/jewellery',
  '/jewellery/men',
  '/jewellery/men/rings',
  '/jewellery/men/pendants',
  '/jewellery/men/bracelets',
  '/jewellery/men/earrings',
  '/jewellery/women',
  '/jewellery/women/rings',
  '/jewellery/women/pendants',
  '/jewellery/women/bracelets',
  '/jewellery/women/earrings',
  '/accessories',
  '/accessories/keychains',
  '/accessories/soft-toys',
  '/customize',
  '/customer-care',
  '/size-guide',
  '/shipping-returns',
  '/privacy-policy',
  '/terms-of-service',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    const res = await fetch('https://api.zevrae.com/api/products?limit=250', {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const products: Array<{ id: string; updated_at?: string }> =
        data.products || data.data || [];
      const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
        url: `${BASE_URL}/product/${p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
      return [...staticEntries, ...productEntries];
    }
  } catch (err) {
    // Return static entries if backend is unreachable during build
  }

  return staticEntries;
}
