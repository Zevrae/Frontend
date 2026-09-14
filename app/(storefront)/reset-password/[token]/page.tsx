import type { Metadata } from 'next';
import ResetPassword from '@/views/ResetPassword';

export const metadata: Metadata = {
  title: 'Reset Password | ZEVRAE',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ResetPassword />;
}
