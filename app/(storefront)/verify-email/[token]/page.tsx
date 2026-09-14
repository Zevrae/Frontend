import type { Metadata } from 'next';
import VerifyEmail from '@/views/VerifyEmail';

export const metadata: Metadata = {
  title: 'Verify Email | ZEVRAE',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <VerifyEmail />;
}
