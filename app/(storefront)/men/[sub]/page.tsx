import type { Metadata } from 'next';
import ProductGrid from '@/ProductGrid';
import { SEO_CONFIG } from '@/config/seo';

type Props = {
  params: Promise<{ sub: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sub } = await params;
  const path = `/men/${sub}` as keyof typeof SEO_CONFIG;
  const seo = SEO_CONFIG[path];

  return {
    title: seo?.title || `Men's ${sub.toUpperCase()} | ZEVRAE`,
    description: seo?.description || `Shop contemporary men's ${sub} at ZEVRAE.`,
    alternates: { canonical: `/men/${sub}` },
  };
}

export default async function MenSubPage({ params }: Props) {
  const { sub } = await params;
  return (
    <div className="pt-26 md:pt-32">
      <ProductGrid categoryFilter={`men-${sub}` as any} />
    </div>
  );
}
