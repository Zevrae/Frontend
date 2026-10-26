import type { Metadata } from 'next';
import ProductGrid from '@/ProductGrid';
import { SEO_CONFIG } from '@/config/seo';

export const metadata: Metadata = {
  title: SEO_CONFIG['/men'].title,
  description: SEO_CONFIG['/men'].description,
  alternates: { canonical: '/men' },
};

export default function MenPage() {
  return (
    <div className="pt-28 md:pt-32">
      <ProductGrid categoryFilter="men" />
    </div>
  );
}
