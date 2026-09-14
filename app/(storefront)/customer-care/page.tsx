import type { Metadata } from 'next';
import { customerCareHtml } from '@/content/customerCareContent';
import { SEO_CONFIG } from '@/config/seo';
import '@/views/PolicyPage.css';

export const metadata: Metadata = {
  title: SEO_CONFIG['/customer-care'].title,
  description: SEO_CONFIG['/customer-care'].description,
  alternates: { canonical: '/customer-care' },
};

export default function CustomerCarePage() {
  return (
    <div className="policy-container min-h-screen bg-[var(--theme-bg)] pt-32 px-6 md:px-12">
      <div
        className="policy-content"
        dangerouslySetInnerHTML={{ __html: customerCareHtml }}
      />
    </div>
  );
}
