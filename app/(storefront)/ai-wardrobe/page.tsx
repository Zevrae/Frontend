import type { Metadata } from 'next';
import ComingSoon from '@/views/comingsoon/ComingSoon';

export const metadata: Metadata = {
  title: 'AI Wardrobe | Coming Soon | ZEVRAE',
  description: 'An AI-styled wardrobe experience tailored to you. Coming soon to ZEVRAE.',
  alternates: { canonical: '/ai-wardrobe' },
};

export default function Page() {
  return (
    <div className="pt-24 min-h-screen">
      <ComingSoon />
    </div>
  );
}
