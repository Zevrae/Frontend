import type { Metadata } from 'next';
import UiDemo from '@/views/UiDemo';

export const metadata: Metadata = {
  title: 'UI Design System & Component Suite | ZEVRAE',
  description: 'Design system preview showcasing shadcn/ui and luxury components.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UiDemo />;
}
