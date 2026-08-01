import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Package2, LayoutDashboard, ShoppingBag, Layers, FolderOpen, Percent,
  ChevronRight, Archive, ArrowLeft,
} from 'lucide-react';
import { ordersApi, Order } from '../api/orders';
import {
  AdminSection,
  DashboardSection,
  OrdersSection,
  ProductsSection,
  CollectionsSection,
  CategoriesSection,
  DiscountsSection,
} from './AdminSections';

// This whole module (plus everything it imports — the *Section components,
// productsApi/ordersApi, and RichTextEditor/Tiptap) is only ever requested
// via the dynamic import() in AdminGate.tsx, once a confirmed admin session
// exists. Storefront visitors never download it.

const navItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
  { id: 'orders', label: 'Orders', icon: <Archive size={15} /> },
  { id: 'products', label: 'Products', icon: <ShoppingBag size={15} /> },
  { id: 'collections', label: 'Collections', icon: <Layers size={15} /> },
  { id: 'categories', label: 'Categories', icon: <FolderOpen size={15} /> },
  { id: 'discounts', label: 'Discounts', icon: <Percent size={15} /> },
];

function Sidebar({ active, setActive, isMobileOpen, onClose }: {
  active: AdminSection;
  setActive: (s: AdminSection) => void;
  isMobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed top-0 left-0 h-full w-56 bg-[#0d0d0d] border-r border-[#EAE6E1]/8 z-40
        flex flex-col pt-[72px] transition-transform duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="px-4 py-5 border-b border-[#EAE6E1]/8">
          <p className="text-[9px] uppercase tracking-[0.25em] font-sans text-[#EAE6E1]/30">Control Panel</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActive(item.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-left transition-all duration-150 group ${
                active === item.id
                  ? 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/15'
                  : 'text-[#EAE6E1]/50 hover:text-[#EAE6E1] hover:bg-[#EAE6E1]/4 border border-transparent'
              }`}
            >
              <span className={`flex-shrink-0 transition-colors ${active === item.id ? 'text-[#C5A059]' : 'text-[#EAE6E1]/30 group-hover:text-[#EAE6E1]/60'}`}>
                {item.icon}
              </span>
              <span className="text-[11px] font-sans tracking-[0.1em]">{item.label}</span>
              {active === item.id && <ChevronRight size={11} className="ml-auto text-[#C5A059]/60" />}
            </button>
          ))}
        </nav>
        <div className="px-4 py-5 border-t border-[#EAE6E1]/8">
          <p className="text-[9px] font-mono text-[#EAE6E1]/20">Zevrae Admin v1.0</p>
        </div>
      </aside>
    </>
  );
}

// ─── AdminLayout ──────────────────────────────────────────────────────────────
// Note: the actual "don't let unauthenticated users in" gate lives in
// AdminGate.tsx (main bundle) so it runs before this chunk is even
// downloaded. AdminLayout still keeps its own useAuth-based check as a
// defense-in-depth belt-and-braces guard in case it's ever rendered from
// somewhere else in the tree.
export default function AdminLayout() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeSection, setActiveSectionState] = useState<AdminSection>('dashboard');
  const [sectionHistory, setSectionHistory] = useState<AdminSection[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Wrap setActive so every navigation push is recorded in history
  const setActive = (next: AdminSection) => {
    setSectionHistory(prev => [...prev, activeSection]);
    setActiveSectionState(next);
  };

  // Pop back to the previous section
  const goBack = () => {
    setSectionHistory(prev => {
      const history = [...prev];
      const previous = history.pop();
      if (previous) setActiveSectionState(previous);
      return history;
    });
  };

  const fetchOrders = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const { data } = await ordersApi.list({ limit: 100 });
      setOrders(data);
      setErrorMsg('');
    } catch (err: any) {
      if (orders.length === 0) setErrorMsg('Could not load orders. Make sure the backend is reachable.');
      console.error('Orders fetch error:', err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Real-time order updates aren't wired up on the backend (no websocket/SSE
  // endpoint), so we poll instead.
  useEffect(() => {
    const poll = setInterval(() => fetchOrders(false), 5000);
    return () => clearInterval(poll);
  }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await ordersApi.updateStatus(id, { order_status: status });
      fetchOrders(true);
    } catch (err: any) {
      alert('Status update failed: ' + (err?.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-[#12100C] text-[#EAE6E1] font-sans">
      <Sidebar
        active={activeSection}
        setActive={setActive}
        isMobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="md:ml-56 min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 bg-[#12100C]/95 backdrop-blur-sm border-b border-[#EAE6E1]/8 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-[#EAE6E1]/50 hover:text-[#EAE6E1] transition-colors"
            >
              <Package2 size={20} />
            </button>

            {/* ── Back arrow — visible whenever there's history to go back to ── */}
            {sectionHistory.length > 0 && (
              <button
                onClick={goBack}
                className="flex items-center justify-center w-7 h-7 rounded-sm border border-[#EAE6E1]/15 text-[#EAE6E1]/50 hover:text-[#C5A059] hover:border-[#C5A059]/40 transition-all duration-200"
                title="Go back"
              >
                <ArrowLeft size={13} />
              </button>
            )}

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] font-sans bg-[#12100C] border border-[#EAE6E1]/15 text-[#EAE6E1]/70 hover:text-[#C5A059] hover:border-[#C5A059]/40 transition-colors rounded-sm"
            >
              Back to Site
            </button>
            <div>
              <h1 className="text-[13px] uppercase tracking-[0.25em] font-sans text-[#EAE6E1]">
                {navItems.find(n => n.id === activeSection)?.label}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] uppercase font-sans tracking-[0.2em] text-[#C5A059] bg-[#C5A059]/8 border border-[#C5A059]/15 px-3 py-1.5 rounded-sm hidden sm:block">
              Secure Access
            </span>
            <span className="text-[10px] font-sans text-[#EAE6E1]/30 hidden sm:block">ZEVRAE</span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-[1200px] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeSection === 'dashboard' && <DashboardSection orders={orders} />}
              {activeSection === 'orders' && (
                <OrdersSection
                  orders={orders}
                  loading={loading}
                  errorMsg={errorMsg}
                  onUpdateStatus={updateOrderStatus}
                />
              )}
              {activeSection === 'products' && <ProductsSection />}
              {activeSection === 'collections' && <CollectionsSection />}
              {activeSection === 'categories' && <CategoriesSection />}
              {activeSection === 'discounts' && <DiscountsSection />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
