import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import ProductGrid from '@/ProductGrid';

export const metadata: Metadata = {
  title: 'Search | ZEVRAE',
  description: 'Search luxury clothing and jewellery at ZEVRAE.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SearchPage() {
  return (
    <div className="pt-24 md:pt-28">
      <Suspense
        fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="w-6 h-6 border border-[rgba(var(--theme-accent-rgb),0.3)] border-t-[var(--theme-accent)] rounded-full animate-spin" />
          </div>
        }
      >
        <ProductGrid categoryFilter="search" />
      </Suspense>
    </div>
  );
}
