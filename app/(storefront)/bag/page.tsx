import type { Metadata } from 'next';
import BagPage from '@/BagPage';

export const metadata: Metadata = {
  title: 'Your Bag | ZEVRAE',
  description: 'View your shopping bag and proceed to checkout.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <BagPage />;
}
