import type { Metadata } from 'next';
import ProductGrid from '@/ProductGrid';
import { SEO_CONFIG } from '@/config/seo';

export const metadata: Metadata = {
  title: SEO_CONFIG['/accessories'].title,
  description: SEO_CONFIG['/accessories'].description,
  alternates: { canonical: '/accessories' },
};

export default function AccessoriesPage() {
  return (
    <div className="pt-28 md:pt-32">
      <ProductGrid categoryFilter="accessories" />
    </div>
  );
}
