import type { Metadata } from 'next';
import ProductGrid from '@/ProductGrid';
import { SEO_CONFIG } from '@/config/seo';

export const metadata: Metadata = {
  title: SEO_CONFIG['/jewellery'].title,
  description: SEO_CONFIG['/jewellery'].description,
  alternates: { canonical: '/jewellery' },
};

export default function JewelleryPage() {
  return (
    <div className="pt-26 md:pt-32">
      <ProductGrid categoryFilter="jewellery-men" />
    </div>
  );
}
