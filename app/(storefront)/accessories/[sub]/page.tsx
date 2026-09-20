import type { Metadata } from 'next';
import ProductGrid from '@/ProductGrid';
import { SEO_CONFIG } from '@/config/seo';

type Props = {
  params: Promise<{ sub: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sub } = await params;
  const path = `/accessories/${sub}` as keyof typeof SEO_CONFIG;
  const seo = SEO_CONFIG[path];

  return {
    title: seo?.title || `Accessories | ZEVRAE`,
    description: seo?.description || `Explore contemporary luxury accessories at ZEVRAE.`,
    alternates: {
      canonical: (seo as any)?.canonicalOverride || `/accessories/${sub}`,
    },
  };
}

export default async function AccessoriesSubPage({ params }: Props) {
  const { sub } = await params;
  const filter = sub === 'toys' || sub === 'soft-toys' ? 'soft-toys' : 'keychains';

  return (
    <div className="pt-26 md:pt-32">
      <ProductGrid categoryFilter={filter} />
    </div>
  );
}
