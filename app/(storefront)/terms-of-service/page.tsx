import type { Metadata } from 'next';
import { termsOfServiceHtml } from '@/content/termsOfServiceContent';
import { SEO_CONFIG } from '@/config/seo';
import '@/views/PolicyPage.css';

export const metadata: Metadata = {
  title: SEO_CONFIG['/terms-of-service'].title,
  description: SEO_CONFIG['/terms-of-service'].description,
  alternates: { canonical: '/terms-of-service' },
};

export default function TermsOfServicePage() {
  return (
    <div className="policy-container min-h-screen bg-[var(--theme-bg)] pt-32 px-6 md:px-12">
      <div
        className="policy-content"
        dangerouslySetInnerHTML={{ __html: termsOfServiceHtml }}
      />
    </div>
  );
}
