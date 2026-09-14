import type { Metadata } from 'next';
import ProductPage from '@/ProductPage';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`https://api.zevrae.com/api/products/${id}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      const product = data?.product || data;
      const title = product?.name ? `${product.name} | ZEVRAE` : 'Product | ZEVRAE';
      const desc = product?.description
        ? product.description.slice(0, 160)
        : `${product?.name || 'Luxury piece'} — available at ZEVRAE.`;
      const img = Array.isArray(product?.images) ? product.images[0] : product?.frontImg;

      return {
        title,
        description: desc,
        alternates: { canonical: `/product/${id}` },
        openGraph: {
          title,
          description: desc,
          images: img ? [{ url: img }] : undefined,
        },
      };
    }
  } catch (err) {
    // Fallback
  }

  return {
    title: 'Product Details | ZEVRAE',
    description: 'Explore contemporary luxury apparel and jewellery at ZEVRAE.',
    alternates: { canonical: `/product/${id}` },
  };
}

export default function Page() {
  return <ProductPage />;
}
