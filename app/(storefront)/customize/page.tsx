'use client';

import dynamic from 'next/dynamic';

const CustomizePage = dynamic(() => import('@/views/customize/CustomizePage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[var(--theme-bg)] flex items-center justify-center">
      <div className="w-6 h-6 border border-[rgba(var(--theme-accent-rgb),0.3)] border-t-[var(--theme-accent)] rounded-full animate-spin" />
    </div>
  ),
});

export default function Page() {
  return (
    <div className="pt-24 min-h-screen">
      <CustomizePage />
    </div>
  );
}
