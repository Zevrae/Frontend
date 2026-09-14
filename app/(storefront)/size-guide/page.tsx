import type { Metadata } from 'next';
import { sizeGuideHtml } from '@/content/sizeGuideContent';
import { SEO_CONFIG } from '@/config/seo';
import '@/views/PolicyPage.css';

export const metadata: Metadata = {
  title: SEO_CONFIG['/size-guide'].title,
  description: SEO_CONFIG['/size-guide'].description,
  alternates: { canonical: '/size-guide' },
};

export default function SizeGuidePage() {
  return (
    <div className="policy-container min-h-screen bg-[var(--theme-bg)] pt-32 px-6 md:px-12">
      <div
        className="policy-content"
        dangerouslySetInnerHTML={{ __html: sizeGuideHtml }}
      />
    </div>
  );
}
