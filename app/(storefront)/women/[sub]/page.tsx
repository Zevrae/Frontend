import type { Metadata } from 'next';
import ProductGrid from '@/ProductGrid';
import { SEO_CONFIG } from '@/config/seo';

type Props = {
  params: Promise<{ sub: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sub } = await params;
  const path = `/women/${sub}` as keyof typeof SEO_CONFIG;
  const seo = SEO_CONFIG[path];

  return {
    title: seo?.title || `Women's ${sub.toUpperCase()} | ZEVRAE`,
    description: seo?.description || `Shop contemporary women's ${sub} at ZEVRAE.`,
    alternates: { canonical: `/women/${sub}` },
  };
}

export default async function WomenSubPage({ params }: Props) {
  const { sub } = await params;
  return (
    <div className="pt-26 md:pt-32">
      <ProductGrid categoryFilter={`women-${sub}` as any} />
    </div>
  );
}
