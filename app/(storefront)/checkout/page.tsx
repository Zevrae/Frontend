import type { Metadata } from 'next';
import CheckoutPage from '@/CheckoutPage';

export const metadata: Metadata = {
  title: 'Checkout | ZEVRAE',
  description: 'Secure checkout with Razorpay.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CheckoutPage />;
}
