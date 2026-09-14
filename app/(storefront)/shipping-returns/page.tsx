import type { Metadata } from 'next';
import { shippingReturnPolicyHtml } from '@/content/shippingReturnPolicy';
import { SEO_CONFIG } from '@/config/seo';
import '@/views/PolicyPage.css';

export const metadata: Metadata = {
  title: SEO_CONFIG['/shipping-returns'].title,
  description: SEO_CONFIG['/shipping-returns'].description,
  alternates: { canonical: '/shipping-returns' },
};

export default function ShippingReturnsPage() {
  return (
    <div className="policy-container min-h-screen bg-[var(--theme-bg)] pt-32 px-6 md:px-12">
      <div
        className="policy-content"
        dangerouslySetInnerHTML={{ __html: shippingReturnPolicyHtml }}
      />
    </div>
  );
}
