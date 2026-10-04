import type { Metadata } from 'next';
import ProductGrid from '@/ProductGrid';
import { SEO_CONFIG } from '@/config/seo';

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = `/jewellery/${slug.join('/')}` as keyof typeof SEO_CONFIG;
  const seo = SEO_CONFIG[path];

  return {
    title: seo?.title || `Jewellery | ZEVRAE`,
    description: seo?.description || `Explore contemporary luxury jewellery at ZEVRAE.`,
    alternates: { canonical: `/jewellery/${slug.join('/')}` },
  };
}

export default async function JewellerySubPage({ params }: Props) {
  const { slug } = await params;
  const gender = slug[0];
  const sub = slug[1];

  let categoryFilter = 'jewellery-men';
  if (!sub) {
    categoryFilter = gender === 'women' ? 'jewellery-women' : 'jewellery-men';
  } else {
    categoryFilter = `${gender}-${sub}`;
  }

  return (
    <div className="pt-28 md:pt-32">
      <ProductGrid categoryFilter={categoryFilter as any} />
    </div>
  );
}
