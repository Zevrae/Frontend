import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/UseAuth';
import {
  Package2, Eye, Archive, Clock, Smartphone, LayoutDashboard,
  ShoppingBag, Plus, Edit2, Trash2, Search, X, ChevronRight, 
  Image, AlertCircle, TrendingUp, Save, RefreshCw
} from 'lucide-react';
import { productsApi } from './api/products';
import { ordersApi, Order } from './api/orders';

// ─── Types ──────────────────────────────────────────────────────────────────

type AdminSection = 'dashboard' | 'orders' | 'products';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatVal = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const formatDate = (d: string) =>
  new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetricCard({ title, value, icon, sub, highlight = false }: { title: string; value: string | number; icon: React.ReactNode; sub?: string; highlight?: boolean }) {
  return (
    <div className={`p-5 border rounded-sm flex flex-col gap-3 ${highlight ? 'bg-[#C5A059]/5 border-[#C5A059]/30' : 'bg-[#111] border-[#EAE6E1]/10'}`}>
      <div className={`flex items-center justify-between ${highlight ? 'text-[#C5A059]' : 'text-[#EAE6E1]/40'}`}>
        <span className="text-[10px] uppercase font-sans tracking-[0.12em]">{title}</span>
        {icon}
      </div>
      <div className={`text-2xl font-light font-mono ${highlight ? 'text-[#C5A059]' : 'text-[#EAE6E1]'}`}>{value}</div>
      {sub && <p className="text-[10px] text-[#EAE6E1]/40 font-sans">{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-[13px] uppercase tracking-[0.2em] font-sans text-[#EAE6E1]">{title}</h2>
      {action && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.15em] font-sans bg-[#C5A059] text-black hover:bg-[#D4AE68] transition-colors duration-200 rounded-sm"
        >
          <Plus size={12} />
          {action}
        </button>
      )}
    </div>
  );
}

function Badge({ label, variant }: { label: string; variant: 'active' | 'draft' | 'expired' | 'pending' | 'paid' | 'cod' | 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed' | 'refunded' | 'online' }) {
  const styles = {
    active: 'bg-emerald-900/25 text-emerald-400 border-emerald-900/40',
    draft: 'bg-[#1a1a1a] text-[#EAE6E1]/40 border-[#EAE6E1]/10',
    expired: 'bg-red-900/20 text-red-400 border-red-900/30',
    pending: 'bg-amber-900/20 text-amber-400 border-amber-900/30',
    paid: 'bg-emerald-900/25 text-emerald-400 border-emerald-900/40',
    cod: 'bg-blue-900/20 text-blue-400 border-blue-900/30',
    online: 'bg-purple-900/20 text-purple-400 border-purple-900/30',
    placed: 'bg-amber-900/20 text-amber-400 border-amber-900/30',
    processing: 'bg-blue-900/20 text-blue-400 border-blue-900/30',
    shipped: 'bg-purple-900/20 text-purple-400 border-purple-900/30',
    delivered: 'bg-emerald-900/25 text-emerald-400 border-emerald-900/40',
    cancelled: 'bg-red-900/20 text-red-400 border-red-900/30',
    failed: 'bg-red-900/20 text-red-400 border-red-900/30',
    refunded: 'bg-[#1a1a1a] text-[#EAE6E1]/40 border-[#EAE6E1]/10',
  };
  return (
    <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-sans rounded-sm border ${styles[variant]}`}>
      {label}
    </span>
  );
}

// ─── Modal for Add/Edit ───────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.2 }}
        className="bg-[#111] border border-[#EAE6E1]/10 rounded-sm w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE6E1]/10">
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-sans text-[#C5A059]">{title}</h3>
          <button onClick={onClose} className="text-[#EAE6E1]/40 hover:text-[#EAE6E1] transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[10px] uppercase tracking-[0.15em] font-sans text-[#EAE6E1]/50 mb-2">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-[#12100C] border border-[#EAE6E1]/10 rounded-sm px-3 py-2.5 text-[12px] text-[#EAE6E1] font-mono placeholder:text-[#EAE6E1]/20 focus:outline-none focus:border-[#C5A059]/40 transition-colors";
const selectCls = `${inputCls} cursor-pointer`;

// ─── Dashboard Section ────────────────────────────────────────────────────────

function DashboardSection({ orders }: { orders: Order[] }) {
  const [productCount, setProductCount] = useState<number | null>(null);

  useEffect(() => {
    productsApi
      .list({ limit: 1 })
      .then((res: any) => {
        if (res.pagination) {
          setProductCount(res.pagination.total);
        }
      })
      .catch(() => setProductCount(null));
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.order_status === 'placed').length;
  const revenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total, 0);

  const recentOrders = orders.slice(0, 10);

  return (
    <div>
      <SectionHeader title="Dashboard" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Orders" value={totalOrders} icon={<Archive size={16} />} sub="All time" />
        <MetricCard title="Pending" value={pendingOrders} icon={<Clock size={16} />} sub="Requires action" />
        <MetricCard title="Products" value={productCount ?? '—'} icon={<ShoppingBag size={16} />} sub="In catalog" />
        <MetricCard title="Revenue" value={formatVal(revenue)} icon={<TrendingUp size={16} />} sub="Prepaid orders" highlight />
      </div>

      <div className="bg-[#111] border border-[#EAE6E1]/10 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EAE6E1]/10 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#C5A059]">Recent Orders</span>
          <span className="text-[10px] text-[#EAE6E1]/30 font-sans">Last 10</span>
        </div>
        {recentOrders.length === 0 ? (
          <p className="p-6 text-[11px] text-[#EAE6E1]/30 font-sans text-center">No orders yet.</p>
        ) : (
          <div className="divide-y divide-[#EAE6E1]/5">
            {recentOrders.map(o => {
              const customer = typeof o.user === 'object' ? o.user : null;
              return (
                <div key={o.id} className="px-5 py-3 flex items-center justify-between hover:bg-[#12100C]/40 transition-colors">
                  <div>
                    <p className="text-[11px] text-[#EAE6E1] font-mono">{customer?.name || 'Customer'}</p>
                    <p className="text-[9px] text-[#EAE6E1]/40 font-sans mt-0.5">{o.id.slice(-8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-mono text-[#C5A059] mb-1">{formatVal(o.total)}</p>
                    <Badge label={o.order_status} variant={o.order_status as any} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Orders Section ───────────────────────────────────────────────────────────

function OrdersSection({ orders, loading, errorMsg, onUpdateStatus }: {
  orders: Order[];
  loading: boolean;
  errorMsg: string;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  const [filter, setFilter] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = orders.filter(o => {
    const customer = typeof o.user === 'object' ? o.user : null;
    const matchFilter =
      filter === 'All' ? true :
      filter === 'Pending' ? o.order_status === 'placed' :
      filter === 'Paid' ? o.payment_status === 'paid' :
      filter === 'COD' ? o.payment_method === 'cod' :
      filter === 'Delivered' ? o.order_status === 'delivered' : true;
    const matchSearch = !search ||
      (customer?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (customer?.email || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const orderStatusColor = (s?: string) => {
    switch (s) {
      case 'delivered': return 'text-emerald-400 bg-emerald-900/20';
      case 'shipped': return 'text-blue-400 bg-blue-900/20';
      case 'processing': return 'text-purple-400 bg-purple-900/20';
      case 'cancelled': return 'text-red-400 bg-red-900/20';
      default: return 'text-[#C5A059] bg-[#C5A059]/10';
    }
  };

  return (
    <div>
      <SectionHeader title="Orders" />

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EAE6E1]/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orders, customers..."
            className="w-full bg-[#111] border border-[#EAE6E1]/10 rounded-sm pl-9 pr-4 py-2.5 text-[12px] text-[#EAE6E1] font-mono placeholder:text-[#EAE6E1]/20 focus:outline-none focus:border-[#C5A059]/30 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'Pending', 'Paid', 'COD', 'Delivered'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[9px] uppercase tracking-[0.15em] font-sans rounded-sm transition-all duration-200 ${
                filter === f
                  ? 'bg-[#C5A059] text-black'
                  : 'bg-[#111] text-[#EAE6E1]/50 border border-[#EAE6E1]/10 hover:border-[#C5A059]/30 hover:text-[#C5A059]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/20 text-[11px] font-sans rounded-sm flex items-center gap-2">
          <AlertCircle size={14} /> {errorMsg}
        </div>
      )}

      <div className="bg-[#111] border border-[#EAE6E1]/10 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EAE6E1]/10 text-[9px] uppercase tracking-[0.2em] font-sans text-[#C5A059] bg-[#12100C]/50">
                <th className="p-4 font-normal">Order</th>
                <th className="p-4 font-normal">Customer</th>
                <th className="p-4 font-normal">Date</th>
                <th className="p-4 font-normal">Total</th>
                <th className="p-4 font-normal">Payment</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-[11px] uppercase tracking-[0.2em] font-sans text-[#C5A059] animate-pulse">
                    Loading Orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-[11px] uppercase tracking-[0.2em] font-sans text-[#EAE6E1]/30">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map(order => {
                  const customer = typeof order.user === 'object' ? order.user : null;
                  return (
                  <React.Fragment key={order.id}>
                    <tr className="border-b border-[#EAE6E1]/5 hover:bg-[#12100C]/40 transition-colors">
                      <td className="p-4 text-[11px] font-mono text-[#EAE6E1]">
                        #{order.id.slice(-8)}
                      </td>
                      <td className="p-4">
                        <p className="text-[11px] text-[#EAE6E1]">{customer?.name || 'Customer'}</p>
                        <p className="text-[9px] text-[#EAE6E1]/40 font-mono mt-0.5">{customer?.email}</p>
                        {customer?.phone && (
                          <p className="text-[9px] text-[#EAE6E1]/40 font-mono mt-0.5 flex items-center gap-1">
                            <Smartphone size={9} /> {customer.phone}
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-[10px] text-[#EAE6E1]/50 font-sans">{formatDate(order.created_at)}</td>
                      <td className="p-4 text-[11px] font-mono text-[#EAE6E1]">{formatVal(order.total)}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <Badge label={order.payment_method === 'cod' ? 'COD' : 'Online'} variant={order.payment_method === 'cod' ? 'cod' : 'online'} />
                          <Badge label={order.payment_status} variant={order.payment_status === 'paid' ? 'paid' : 'pending'} />
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-sans rounded-sm ${orderStatusColor(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                          className="text-[9px] uppercase tracking-[0.1em] font-sans hover:text-[#C5A059] transition-colors border border-[#EAE6E1]/15 px-3 py-1.5 rounded-sm flex items-center gap-1.5 ml-auto"
                        >
                          <Eye size={11} /> View
                        </button>
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedOrder === order.id && (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <td colSpan={7} className="px-5 pb-5 bg-[#12100C]/60 border-b border-[#EAE6E1]/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#C5A059] mb-3">Customer Details</p>
                                <div className="space-y-1.5 text-[11px] text-[#EAE6E1]/70 bg-[#111] p-4 rounded-sm border border-[#EAE6E1]/5">
                                  <p><span className="text-[#EAE6E1]/40 w-14 inline-block">Name:</span> {customer?.name || '—'}</p>
                                  <p><span className="text-[#EAE6E1]/40 w-14 inline-block">Email:</span> {customer?.email || '—'}</p>
                                  {customer?.phone && <p><span className="text-[#EAE6E1]/40 w-14 inline-block">Phone:</span> {customer.phone}</p>}
                                  <p>
                                    <span className="text-[#EAE6E1]/40 w-14 inline-block">Address:</span>{' '}
                                    {[order.shipping_address?.line1, order.shipping_address?.line2, order.shipping_address?.city, order.shipping_address?.state, order.shipping_address?.postal_code, order.shipping_address?.country]
                                      .filter(Boolean).join(', ')}
                                  </p>
                                </div>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#C5A059] mb-3 mt-5">Update Status</p>
                                <div className="flex flex-wrap gap-2">
                                  {['processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                                    <button
                                      key={s}
                                      onClick={() => onUpdateStatus(order.id, s)}
                                      className="px-3 py-1.5 text-[9px] uppercase tracking-[0.1em] font-sans bg-[#12100C] border border-[#EAE6E1]/10 rounded-sm hover:border-[#C5A059]/40 hover:text-[#C5A059] transition-colors capitalize"
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#C5A059] mb-3">Products Ordered</p>
                                <div className="space-y-2">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-[#111] p-3 border border-[#EAE6E1]/5 rounded-sm">
                                      <div>
                                        <p className="text-[10px] font-sans uppercase tracking-[0.1em] text-[#EAE6E1]">{item.name}</p>
                                        <p className="text-[9px] font-mono text-[#EAE6E1]/40 mt-0.5">Size: {item.size || '—'} × {item.quantity}</p>
                                      </div>
                                      <span className="text-[11px] font-mono text-[#C5A059]">{formatVal(item.price * item.quantity)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── DB Product type ──────────────────────────────────────────────────────────

interface DbProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  compare_price: number | null;
  sizes: string[];
  images: string[];
  status: string;
  created_at: string;
}

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const emptyForm = (): Omit<DbProduct, 'id' | 'created_at'> => ({
  name: '',
  description: '',
  category: '',
  subcategory: '',
  price: 0,
  compare_price: null,
  sizes: [],
  images: [],
  status: 'active',
});

// ─── Products Section ─────────────────────────────────────────────────────────

function ProductsSection() {
  // ── Live products from DB ──────────────────────────────────────
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState('');

  // ── Modal state ────────────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // ── Search ─────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');

  // ── Fetch products from MongoDB / Appwrite ─────────────────────────────────
  const fetchDbProducts = async () => {
    setDbLoading(true);
    setDbError('');
    try {
      let allProducts: DbProduct[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const response: any = await productsApi.list({ limit: 100, page: currentPage });
        
        const items = response.data || [];
        const pagination = response.pagination;

        if (items.length > 0) {
          allProducts = [...allProducts, ...items];
        }
        
        if (pagination && currentPage >= pagination.pages) {
           hasMore = false;
        } else if (items.length < 100) {
           hasMore = false;
        } else {
           currentPage++;
        }
      }

      setDbProducts(allProducts);
    } catch (err: any) {
      setDbError('Could not load products. Make sure the database is connected.');
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => { fetchDbProducts(); }, []);

  // ── Open Add modal ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setImageFiles([]);
    setShowModal(true);
  };

  // ── Open Edit modal ────────────────────────────────────────────────────────
  const openEdit = (p: DbProduct) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || '',
      category: p.category,
      subcategory: p.subcategory,
      price: p.price,
      compare_price: p.compare_price,
      sizes: p.sizes || [],
      images: p.images || [],
      status: p.status,
    });
    setImageFiles([]);
    setShowModal(true);
  };

  // ── Toggle size chip ───────────────────────────────────────────────────────
  const toggleSize = (s: string) => {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s],
    }));
  };

  // ── Save (create or update) ────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);

    try {
      const payload = { ...form, images: form.images };

      let productId = editingId;
      if (editingId) {
        await productsApi.update(editingId, payload);
      } else {
        const created = await productsApi.create(payload);
        productId = created.id;
      }

      if (imageFiles.length > 0 && productId) {
        await productsApi.uploadImages(productId, imageFiles);
      }

      setShowModal(false);
      fetchDbProducts();
    } catch (err: any) {
      alert('Save failed: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this product? This will remove it from the storefront immediately.')) return;
    try {
      await productsApi.remove(id);
      fetchDbProducts();
    } catch (error: any) {
      alert('Delete failed: ' + (error?.response?.data?.message || error.message));
    }
  };

  // ── Filtered DB products ───────────────────────────────────────────────────
  const filteredDb = dbProducts.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.subcategory.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <SectionHeader title="Products" action="Add Product" onAction={openAdd} />

      {/* Search */}
      <div className="relative mb-5">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EAE6E1]/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-[#111] border border-[#EAE6E1]/10 rounded-sm pl-9 pr-4 py-2.5 text-[12px] text-[#EAE6E1] font-mono placeholder:text-[#EAE6E1]/20 focus:outline-none focus:border-[#C5A059]/30 transition-colors"
        />
      </div>

      {/* ── Live Database Products ─────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#C5A059]">Database Products</span>
          <span className="text-[9px] font-sans text-[#EAE6E1]/30">Live · MongoDB</span>
          <button
            onClick={() => fetchDbProducts()}
            className="ml-auto p-1.5 text-[#EAE6E1]/30 hover:text-[#C5A059] transition-colors border border-[#EAE6E1]/10 rounded-sm hover:border-[#C5A059]/30"
            title="Refresh"
          >
            <RefreshCw size={11} />
          </button>
        </div>

        {dbError && (
          <div className="mb-4 p-3 text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/20 text-[11px] font-sans rounded-sm flex items-center gap-2">
            <AlertCircle size={14} /> {dbError}
          </div>
        )}

        <div className="bg-[#111] border border-[#EAE6E1]/10 rounded-sm overflow-hidden mb-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#EAE6E1]/10 text-[9px] uppercase tracking-[0.2em] font-sans text-[#C5A059] bg-[#12100C]/50">
                  <th className="p-4 font-normal">Product</th>
                  <th className="p-4 font-normal">Subcategory</th>
                  <th className="p-4 font-normal">Price</th>
                  <th className="p-4 font-normal">Compare</th>
                  <th className="p-4 font-normal">Sizes</th>
                  <th className="p-4 font-normal">Status</th>
                  <th className="p-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dbLoading ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-[11px] uppercase tracking-[0.2em] font-sans text-[#C5A059] animate-pulse">
                      Loading...
                    </td>
                  </tr>
                ) : filteredDb.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-[11px] font-sans text-[#EAE6E1]/30">
                      {dbError ? 'Table not found.' : 'No products yet. Click "Add Product" to create one.'}
                    </td>
                  </tr>
                ) : (
                  filteredDb.map(p => (
                    <tr key={p.id} className="border-b border-[#EAE6E1]/5 hover:bg-[#12100C]/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#12100C] rounded-sm overflow-hidden flex-shrink-0 border border-[#EAE6E1]/10">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover opacity-80" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Image size={12} className="text-[#EAE6E1]/20" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-[11px] font-sans text-[#EAE6E1] uppercase tracking-[0.05em] block">{p.name}</span>
                            {p.description && (
                              <span className="text-[9px] font-sans text-[#EAE6E1]/30 block truncate max-w-[180px]">{p.description}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-[10px] font-sans text-[#EAE6E1]/50">{p.subcategory}</td>
                      <td className="p-4 text-[11px] font-mono text-[#EAE6E1]">{formatVal(p.price)}</td>
                      <td className="p-4 text-[10px] font-mono text-[#EAE6E1]/40 line-through">
                        {p.compare_price ? formatVal(p.compare_price) : '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {(p.sizes || []).map(s => (
                            <span key={s} className="px-1.5 py-0.5 text-[8px] font-sans uppercase border border-[#EAE6E1]/15 text-[#EAE6E1]/50 rounded-sm">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge label={p.status} variant={p.status as any} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-[#EAE6E1]/40 hover:text-[#C5A059] transition-colors border border-[#EAE6E1]/10 rounded-sm hover:border-[#C5A059]/30">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 text-[#EAE6E1]/40 hover:text-red-400 transition-colors border border-[#EAE6E1]/10 rounded-sm hover:border-red-900/50">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <Modal title={editingId ? 'Edit Product' : 'Add Product'} onClose={() => setShowModal(false)}>
            <FormField label="Product Name">
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Oversized Graphic Tee"
                className={inputCls}
              />
            </FormField>

            <FormField label="Description">
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="A brief description of this product..."
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Category">
                <input
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Men"
                  className={inputCls}
                />
              </FormField>
              <FormField label="Subcategory">
                <input
                  value={form.subcategory}
                  onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                  placeholder="e.g. T-Shirts"
                  className={inputCls}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Price (INR)">
                <input
                  type="number"
                  value={form.price || ''}
                  onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                  placeholder="799"
                  className={inputCls}
                />
              </FormField>
              <FormField label="Compare Price (INR)">
                <input
                  type="number"
                  value={form.compare_price ?? ''}
                  onChange={e => setForm(f => ({ ...f, compare_price: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="1599 (crossed out)"
                  className={inputCls}
                />
              </FormField>
            </div>

            <FormField label="Available Sizes">
              <div className="flex flex-wrap gap-2 mt-1">
                {ALL_SIZES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    className={`px-3 py-1.5 text-[11px] font-sans uppercase tracking-wider border rounded-sm transition-all duration-150 ${
                      form.sizes.includes(s)
                        ? 'border-[#C5A059] text-[#C5A059] bg-[#C5A059]/10'
                        : 'border-[#EAE6E1]/15 text-[#EAE6E1]/40 hover:border-[#EAE6E1]/30'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {form.sizes.length === 0 && (
                <p className="text-[9px] text-[#C5A059]/70 font-sans mt-2">Select at least one size</p>
              )}
            </FormField>

            <FormField label="Product Images">
              <div className="flex flex-wrap gap-4 mb-3">
                {/* Existing Images */}
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded overflow-hidden border border-[#EAE6E1]/20">
                    <img src={img} alt="Product" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))}
                      className="absolute top-1 right-1 bg-black/60 p-0.5 rounded-full hover:bg-red-500/80 transition-colors"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                ))}
                
                {/* Selected Files to Upload */}
                {imageFiles.map((file, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded overflow-hidden border border-[#C5A059] opacity-80">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImageFiles(files => files.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-black/60 p-0.5 rounded-full hover:bg-red-500/80 transition-colors"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
              
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={e => {
                  if (e.target.files) {
                    setImageFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                  }
                }}
                className="text-xs text-[#EAE6E1]/70 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-[#C5A059] file:text-black hover:file:bg-[#d8b571] cursor-pointer w-full border border-[#EAE6E1]/10 p-2 rounded-sm"
              />
              <p className="text-[9px] text-[#EAE6E1]/25 font-sans mt-1.5">First image = front, second = back (for product page hover)</p>
            </FormField>

            <FormField label="Status">
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className={selectCls}
              >
                <option value="active">Active — Visible on storefront</option>
                <option value="draft">Draft — Hidden from storefront</option>
              </select>
            </FormField>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex-1 py-2.5 bg-[#C5A059] text-black text-[10px] uppercase tracking-[0.2em] font-sans rounded-sm hover:bg-[#D4AE68] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={12} /> {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Product'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 border border-[#EAE6E1]/10 text-[10px] uppercase tracking-[0.2em] font-sans text-[#EAE6E1]/50 rounded-sm hover:border-[#EAE6E1]/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const navItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
  { id: 'orders', label: 'Orders', icon: <Archive size={15} /> },
  { id: 'products', label: 'Products', icon: <ShoppingBag size={15} /> },
];

function Sidebar({ active, setActive, isMobileOpen, onClose }: {
  active: AdminSection;
  setActive: (s: AdminSection) => void;
  isMobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop (mobile) */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
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

// ─── Main Admin Component ─────────────────────────────────────────────────────

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isAdmin = authLoading ? null : user?.role === 'admin';

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [authLoading, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const poll = setInterval(() => fetchOrders(false), 5000);
    return () => clearInterval(poll);
  }, [isAdmin]);

  const fetchOrders = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      let allOrders: Order[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const response: any = await ordersApi.list({ limit: 100, page: currentPage });
        
        const items = response.data || [];
        const pagination = response.pagination;

        if (items.length > 0) {
          allOrders = [...allOrders, ...items];
        }
        
        if (pagination && currentPage >= pagination.pages) {
          hasMore = false;
        } else if (items.length < 100) {
          hasMore = false;
        } else {
          currentPage++;
        }
      }
      
      setOrders(allOrders);
      setErrorMsg('');
    } catch (err: any) {
      if (orders.length === 0) setErrorMsg('Could not load orders. Make sure the backend is reachable.');
      console.error('Orders fetch error:', err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await ordersApi.updateStatus(id, { order_status: status });
      fetchOrders(true);
    } catch (err: any) {
      alert('Status update failed: ' + (err?.response?.data?.message || err.message));
    }
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#12100C] text-[#C5A059] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw size={16} className="animate-spin" />
          <span className="text-[11px] uppercase tracking-[0.2em] font-sans">Verifying access...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#12100C] text-[#EAE6E1] font-sans">
      <Sidebar
        active={activeSection}
        setActive={setActiveSection}
        isMobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="md:ml-56 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-[#12100C]/95 backdrop-blur-sm border-b border-[#EAE6E1]/8 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-[#EAE6E1]/50 hover:text-[#EAE6E1] transition-colors"
            >
              <Package2 size={20} />
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

        {/* Page content */}
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
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}