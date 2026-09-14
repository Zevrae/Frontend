import type { Metadata } from 'next';
import { privacyPolicyHtml } from '@/content/privacyPolicyContent';
import { SEO_CONFIG } from '@/config/seo';
import '@/views/PolicyPage.css';

export const metadata: Metadata = {
  title: SEO_CONFIG['/privacy-policy'].title,
  description: SEO_CONFIG['/privacy-policy'].description,
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="policy-container min-h-screen bg-[var(--theme-bg)] pt-32 px-6 md:px-12">
      <div
        className="policy-content"
        dangerouslySetInnerHTML={{ __html: privacyPolicyHtml }}
      />
    </div>
  );
}
