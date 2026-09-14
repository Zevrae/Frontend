'use client';

import dynamic from 'next/dynamic';
import { RefreshCw } from 'lucide-react';

const AdminGate = dynamic(() => import('@/admin/AdminGate'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#12100C] text-[#C5A059] flex items-center justify-center">
      <div className="flex items-center gap-3">
        <RefreshCw size={16} className="animate-spin" />
        <span className="text-[11px] uppercase tracking-[0.2em] font-sans">
          Loading control panel...
        </span>
      </div>
    </div>
  ),
});

export default function AdminPage() {
  return <AdminGate />;
}
