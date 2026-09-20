import type { Metadata } from 'next';
import ProductGrid from '@/ProductGrid';
import { SEO_CONFIG } from '@/config/seo';

export const metadata: Metadata = {
  title: SEO_CONFIG['/women'].title,
  description: SEO_CONFIG['/women'].description,
  alternates: { canonical: '/women' },
};

export default function WomenPage() {
  return (
    <div className="pt-26 md:pt-32">
      <ProductGrid categoryFilter="women" />
    </div>
  );
}
