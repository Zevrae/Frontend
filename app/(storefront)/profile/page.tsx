import type { Metadata } from 'next';
import ProfilePage from '@/ProfilePage';

export const metadata: Metadata = {
  title: 'Your Account | ZEVRAE',
  description: 'Manage your ZEVRAE orders, addresses, and virtual try-ons.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ProfilePage />;
}
