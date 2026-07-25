import { lazy, Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/UseAuth';

// This file is imported eagerly from App.tsx and stays in the main bundle.
// `AuthContext` already wraps the whole app (see main.tsx), so calling
// useAuth() here costs nothing extra — no admin code is touched yet.
//
// AdminLayout (Sidebar, top nav, all the *Section components, recharts-style
// dashboard bits, and now Tiptap) is only require()'d via this dynamic
// import() call, and that call only happens once `isAdmin` is confirmed
// true below. An unauthenticated or non-admin visitor never triggers the
// network request for the admin chunk at all.
const AdminLayout = lazy(() => import('./AdminLayout'));

function AdminLoadingScreen({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-[#12100C] text-[#C5A059] flex items-center justify-center">
      <div className="flex items-center gap-3">
        <RefreshCw size={16} className="animate-spin" />
        <span className="text-[11px] uppercase tracking-[0.2em] font-sans">{label}</span>
      </div>
    </div>
  );
}

export default function AdminGate() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = authLoading ? null : user?.role === 'admin';

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) navigate('/');
  }, [authLoading, isAdmin, navigate]);

  // Still resolving the auth session — don't render or fetch the admin
  // chunk yet, we don't know the role.
  if (isAdmin === null) {
    return <AdminLoadingScreen label="Verifying access..." />;
  }

  // Confirmed non-admin (or logged out) — the effect above is already
  // navigating away; render nothing so there's no flash of admin UI and
  // no dynamic import is ever kicked off.
  if (!isAdmin) return null;

  // Only now does React attempt to download the admin chunk.
  return (
    <Suspense fallback={<AdminLoadingScreen label="Loading control panel..." />}>
      <AdminLayout />
    </Suspense>
  );
}
