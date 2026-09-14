import type { Metadata } from 'next';
import { HomePageClient } from './HomePageClient';

export const metadata: Metadata = {
  title: 'ZEVRAE | Luxury Is A Matter of Choice',
  description:
    "Contemporary luxury apparel and jewellery. Shop men's and women's clothing, fine jewellery, and accessories, with virtual try-on powered by AI.",
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
