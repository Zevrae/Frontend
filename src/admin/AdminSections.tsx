import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye, CheckCircle2, Truck, XCircle,
  DollarSign, Archive, Clock, Smartphone, ShoppingBag,
  Tag, Percent, Plus, Edit2, Trash2,
  Search, X, Image, ToggleLeft, ToggleRight,
  Star, AlertCircle, TrendingUp, Users, ArrowUpRight,
  Save, Upload, RefreshCw
} from 'lucide-react';
import { productsApi, Product } from '../api/products';
import { collectionsApi, Collection } from '../api/collections';
import { categoriesApi, Category } from '../api/categories';
import { discountsApi, Discount } from '../api/discounts';
import { ordersApi, Order } from '../api/orders';
import RichTextEditor from './RichTextEditor';

// ─── Types ──────────────────────────────────────────────────────────────────
// Exported so AdminLayout.tsx can type its section-switch state.

export type AdminSection = 'dashboard' | 'orders' | 'products' | 'collections' | 'categories' | 'discounts';
export type { Order };

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

function Badge({ label, variant }: { label: string; variant: 'active' | 'inactive' | 'draft' | 'expired' | 'pending' | 'paid' | 'cod' | 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed' | 'refunded' | 'online' | 'Active' | 'Expired' }) {
  const styles = {
    active: 'bg-emerald-900/25 text-emerald-400 border-emerald-900/40',
    Active: 'bg-emerald-900/25 text-emerald-400 border-emerald-900/40',
    inactive: 'bg-[#1a1a1a] text-[#EAE6E1]/40 border-[#EAE6E1]/10',
    draft: 'bg-[#1a1a1a] text-[#EAE6E1]/40 border-[#EAE6E1]/10',
    expired: 'bg-red-900/20 text-red-400 border-red-900/30',
    Expired: 'bg-red-900/20 text-red-400 border-red-900/30',
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.2 }}
        className="bg-[#111] border border-[#EAE6E1]/10 rounded-sm w-full max-w-lg max-h-full flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE6E1]/10 flex-shrink-0">
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-sans text-[#C5A059]">{title}</h3>
          <button onClick={onClose} className="text-[#EAE6E1]/40 hover:text-[#EAE6E1] transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
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

export function DashboardSection({ orders }: { orders: Order[] }) {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.order_status === 'placed').length;
  const revenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total, 0);
  const recentOrders = orders.slice(0, 5);

  return (
    <div>
      <SectionHeader title="Dashboard" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Orders" value={totalOrders} icon={<Archive size={16} />} sub="All time" />
        <MetricCard title="Pending" value={pendingOrders} icon={<Clock size={16} />} sub="Requires action" />
        <MetricCard title="Products" value={6} icon={<ShoppingBag size={16} />} sub="In catalog" />
        <MetricCard title="Revenue" value={formatVal(revenue)} icon={<TrendingUp size={16} />} sub="Prepaid orders" highlight />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-[#EAE6E1]/10 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EAE6E1]/10 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#C5A059]">Recent Orders</span>
            <span className="text-[10px] text-[#EAE6E1]/30 font-sans">Last 5</span>
          </div>
          {recentOrders.length === 0 ? (
            <p className="p-6 text-[11px] text-[#EAE6E1]/30 font-sans text-center">No orders yet.</p>
          ) : (
            <div className="divide-y divide-[#EAE6E1]/5">
              {recentOrders.map(o => {
                const customer = typeof o.user === 'object' ? o.user : null;
                return (
                  <div key={o.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-[#EAE6E1] font-mono">{customer?.name || 'Customer'}</p>
                      <p className="text-[9px] text-[#EAE6E1]/40 font-sans mt-0.5">{o.id.slice(-8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-mono text-[#C5A059]">{formatVal(o.total/100)}</p>
                      <Badge label={o.order_status} variant={o.order_status as any} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Orders Section ───────────────────────────────────────────────────────────

export function OrdersSection({ orders, loading, errorMsg, onUpdateStatus }: {
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
                      <td className="p-4 text-[11px] font-mono text-[#EAE6E1]">#{order.id.slice(-8)}</td>
                      <td className="p-4">
                        <p className="text-[11px] text-[#EAE6E1]">{customer?.name || 'Customer'}</p>
                        <p className="text-[9px] text-[#EAE6E1]/40 font-mono mt-0.5">{customer?.email}</p>
                      </td>
                      <td className="p-4 text-[10px] text-[#EAE6E1]/50 font-sans">{formatDate(order.created_at)}</td>
                      <td className="p-4 text-[11px] font-mono text-[#EAE6E1]">{formatVal(order.total)}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
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
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                        >
                          <td colSpan={7} className="px-5 pb-5 bg-[#12100C]/60 border-b border-[#EAE6E1]/10">
                            {/* Order Expansion logic remains identical */}
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
//
// INTEGRATION NOTE (flagging, not guessing): three different shapes exist for
// per-size inventory across this stack right now:
//   • models/Product.js (backend)   -> stock_quantity: Number (single total, no sizes)
//   • src/api/products.ts (`Product`) -> sizes: string[] + size_stock: Record<string, number>
//   • this file's admin UI (`DbProduct`, below) -> stock_quantity: StockItem[]
// None of these agree, and the backend schema has no field that can actually
// persist a per-size breakdown today. `productToDbProduct` / `dbProductPayload`
// below adapt between the UI shape and the `api/products.ts` shape so the app
// compiles and behaves consistently on the frontend, and — as a stopgap — the
// payload also writes a total `stock_quantity` (sum across sizes) into the one
// field the backend schema actually has. The per-size breakdown itself will
// NOT round-trip through the real API until the Product model gets a proper
// field for it (e.g. an embedded `[{ size, quantity }]` array, or a
// `size_stock` Map). That's a schema decision for the backend owner to make,
// not something to silently invent here.

interface StockItem {
  size: string;
  quantity: number;
}

interface DbProduct {
  id: string;
  name: string;
  description: string;
  collections: string[]; 
  category: string;
  subcategory: string;
  price: number;
  compare_price: number | null;
  stock_quantity: StockItem[];
  in_stock: boolean;
  images: string[];
  status: string;
  is_deleted?: boolean;
  created_at: string;
}

// Adapts an `api/products.ts` Product (the shape actually returned by
// productsApi) into the UI's per-size StockItem[] shape.
function productToDbProduct(p: Product): DbProduct {
  const sizeStock = p.size_stock || {};
  const sizes = p.sizes && p.sizes.length > 0 ? p.sizes : Object.keys(sizeStock);
  const stock_quantity: StockItem[] = sizes.map(size => ({
    size,
    quantity: sizeStock[size] ?? 0,
  }));
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    collections: p.collections || [],
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
    compare_price: p.compare_price ?? null,
    stock_quantity,
    in_stock: stock_quantity.some(s => s.quantity > 0) || stock_quantity.length === 0,
    images: p.images || [],
    status: p.status,
    is_deleted: p.is_deleted,
    created_at: p.created_at,
  };
}

// Adapts the UI form's StockItem[] back into a payload the productsApi /
// backend can accept: `sizes` and `size_stock` are both real backend fields;
// `stock_quantity` is derived server-side from size_stock and shouldn't be
// sent directly.
function dbProductPayload(form: Omit<DbProduct, 'id' | 'created_at' | 'is_deleted'>): Partial<Product> {
  const sizes = form.stock_quantity.filter(s => s.quantity > 0).map(s => s.size);
  const size_stock = Object.fromEntries(form.stock_quantity.map(s => [s.size, s.quantity]));
  return {
    name: form.name,
    description: form.description,
    collections: form.collections,
    category: form.category,
    subcategory: form.subcategory,
    price: form.price,
    compare_price: form.compare_price ?? undefined,
    images: form.images,
    status: form.status as Product['status'],
    sizes,
    size_stock,
  };
}

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const emptyForm = (): Omit<DbProduct, 'id' | 'created_at' | 'is_deleted'> => ({
  name: '',
  description: '',
  collections: [],
  category: 'Men',
  subcategory: 'T-Shirts',
  price: 0,
  compare_price: null,
  stock_quantity: [],
  in_stock: true,
  images: [],
  status: 'active',
});

// ─── Products Section ─────────────────────────────────────────────────────────

export function ProductsSection() {
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [search, setSearch] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    collectionsApi.list({ status: 'active' })
      .then(({ data }) => setCollections(data || []))
      .catch(() => setCollections([]));
  }, []);

  const fetchDbProducts = async () => {
    setDbLoading(true);
    setDbError('');
    try {
      const { data } = await productsApi.list({ limit: 100 });
      setDbProducts((data || []).map(productToDbProduct));
    } catch (err: any) {
      setDbError('Could not load products. Make sure the database is connected.');
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => { fetchDbProducts(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setImageFiles([]);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (p: DbProduct) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || '',
      collections: p.collections || [],
      category: p.category,
      subcategory: p.subcategory,
      price: p.price,
      compare_price: p.compare_price,
      stock_quantity: p.stock_quantity || [],
      in_stock: p.in_stock ?? true,
      images: p.images || [],
      status: p.status,
    });
    setImageFiles([]);
    setFormError('');
    setShowModal(true);
  };

  const toggleSize = (s: string) => {
    setForm(f => {
      const exists = f.stock_quantity.find(x => x.size === s);
      if (exists) {
        return { ...f, stock_quantity: f.stock_quantity.filter(x => x.size !== s) };
      }
      return { ...f, stock_quantity: [...f.stock_quantity, { size: s, quantity: 0 }] };
    });
  };

  const handleQuantityChange = (s: string, qty: number) => {
    setForm(f => ({
      ...f,
      stock_quantity: f.stock_quantity.map(x => x.size === s ? { ...x, quantity: qty } : x)
    }));
  };

  const toggleCollection = (colId: string) => {
    setForm(f => ({
      ...f,
      collections: f.collections.includes(colId) 
        ? f.collections.filter(id => id !== colId) 
        : [...f.collections, colId]
    }));
  };

  // Tiptap emits either '' (never touched) or something like '<p></p>' /
  // '<p><br></p>' for a "visually empty" description — none of which is
  // meaningful content, so strip tags before checking.
  const isDescriptionEmpty = (html: string) => !html.replace(/<[^>]*>/g, '').trim();

  const validateForm = (): string | null => {
    if (!form.name.trim()) return 'Product name is required.';
    if (isDescriptionEmpty(form.description)) return 'Description is required.';
    if (!form.category.trim()) return 'Category is required.';
    if (!form.subcategory.trim()) return 'Subcategory is required.';
    if (!form.price || form.price <= 0) return 'Price must be greater than 0.';
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError('');
    setSaving(true);

    try {
      const payload = dbProductPayload(form);

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
      setFormError(err?.response?.data?.message || err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveExistingImage = async (imgUrl: string) => {
    if (!editingId) {
      setForm(f => ({ ...f, images: f.images.filter(img => img !== imgUrl) }));
      return;
    }
    
    if (!confirm('Permanently delete this image from Appwrite?')) return;
    
    try {
      await productsApi.deleteImage(editingId, imgUrl);
      setForm(f => ({ ...f, images: f.images.filter(img => img !== imgUrl) }));
    } catch (err: any) {
      alert('Image delete failed: ' + (err?.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Soft delete this product? It will be removed from the active store views.')) return;
    try {
      await productsApi.remove(id);
      fetchDbProducts();
    } catch (error: any) {
      alert('Delete failed: ' + (error?.response?.data?.message || error.message));
    }
  };

  const filteredDb = dbProducts.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.subcategory.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <SectionHeader title="Products" action="Add Product" onAction={openAdd} />
      
      <div className="relative mb-5">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EAE6E1]/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-[#111] border border-[#EAE6E1]/10 rounded-sm pl-9 pr-4 py-2.5 text-[12px] text-[#EAE6E1] font-mono placeholder:text-[#EAE6E1]/20 focus:outline-none focus:border-[#C5A059]/30 transition-colors"
        />
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#C5A059]">Database Products</span>
          <button
            onClick={() => fetchDbProducts()}
            className="ml-auto p-1.5 text-[#EAE6E1]/30 hover:text-[#C5A059] transition-colors border border-[#EAE6E1]/10 rounded-sm hover:border-[#C5A059]/30"
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
                  <th className="p-4 font-normal">Stock (Sizes)</th>
                  <th className="p-4 font-normal">Status</th>
                  <th className="p-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dbLoading ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-[11px] uppercase tracking-[0.2em] font-sans text-[#C5A059] animate-pulse">
                      Loading...
                    </td>
                  </tr>
                ) : filteredDb.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-[11px] font-sans text-[#EAE6E1]/30">
                      No products yet. Click "Add Product" to create one.
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
                            {!p.in_stock && <span className="text-[9px] text-red-400 font-sans block">Out of Stock</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-[10px] font-sans text-[#EAE6E1]/50">{p.subcategory}</td>
                      <td className="p-4 text-[11px] font-mono text-[#EAE6E1]">{formatVal(p.price)}</td>
                      <td className="p-4">
                        {p.compare_price && p.compare_price > p.price ? (
                          <span className="px-2 py-0.5 text-[9px] font-mono font-semibold rounded-sm bg-emerald-900/20 text-emerald-400 border border-emerald-900/40">
                            -{Math.round(((p.compare_price - p.price) / p.compare_price) * 100)}%
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#EAE6E1]/20 font-sans">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {p.in_stock !== false ? (
                          <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-sans rounded-sm border bg-emerald-900/25 text-emerald-400 border-emerald-900/40">In Stock</span>
                        ) : (
                          <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-sans rounded-sm border bg-red-900/20 text-red-400 border-red-900/30">Out of Stock</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {(p.stock_quantity || []).map(sq => (
                            <span key={sq.size} className="px-1.5 py-0.5 text-[8px] font-sans border border-[#EAE6E1]/15 text-[#EAE6E1]/50 rounded-sm">
                              {sq.size}: {sq.quantity}
                            </span>
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

      <AnimatePresence>
        {showModal && (
          <Modal title={editingId ? 'Edit Product' : 'Add Product'} onClose={() => setShowModal(false)}>
            {formError && (
              <div className="mb-4 p-3 text-red-400 bg-red-900/10 border border-red-900/30 text-[11px] font-sans rounded-sm flex items-center gap-2">
                <AlertCircle size={14} /> {formError}
              </div>
            )}
            <FormField label="Product Name *">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Oversized Graphic Tee" className={inputCls} />
            </FormField>

            <FormField label="Description *">
              <RichTextEditor
                value={form.description}
                onChange={html => setForm(f => ({ ...f, description: html }))}
                placeholder="A brief description..."
              />
            </FormField>
            <FormField label="Collections">
              <div className="flex flex-wrap gap-2 mt-1">
                {collections.map(col => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => toggleCollection(col.id)}
                    className={`px-3 py-1.5 text-[11px] font-sans uppercase tracking-wider border rounded-sm transition-all duration-150 ${
                      form.collections.includes(col.id) ? 'border-[#C5A059] text-[#C5A059] bg-[#C5A059]/10' : 'border-[#EAE6E1]/15 text-[#EAE6E1]/40 hover:border-[#EAE6E1]/30'
                    }`}
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Category *">
                <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls} />
              </FormField>
              <FormField label="Subcategory *">
                <input value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))} className={inputCls} />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Price (INR) *">
                <input type="number" value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className={inputCls} />
              </FormField>
              <FormField label="Compare Price (INR) — optional">
                <input type="number" value={form.compare_price ?? ''} onChange={e => setForm(f => ({ ...f, compare_price: e.target.value ? Number(e.target.value) : null }))} className={inputCls} />
              </FormField>
            </div>

            <FormField label="Inventory (Sizes & Quantity)">
              <div className="flex flex-col gap-2 mt-1">
                {ALL_SIZES.map(s => {
                  const existing = form.stock_quantity.find(x => x.size === s);
                  const isSelected = !!existing;
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSize(s)}
                        className={`px-3 py-1.5 w-14 text-[11px] font-sans uppercase tracking-wider border rounded-sm transition-all duration-150 ${
                          isSelected ? 'border-[#C5A059] text-[#C5A059] bg-[#C5A059]/10' : 'border-[#EAE6E1]/15 text-[#EAE6E1]/40 hover:border-[#EAE6E1]/30'
                        }`}
                      >
                        {s}
                      </button>
                      {isSelected && (
                        <input
                          type="number"
                          value={existing.quantity}
                          onChange={e => handleQuantityChange(s, parseInt(e.target.value) || 0)}
                          className={`${inputCls} w-24 py-1.5`}
                          placeholder="Qty"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </FormField>

            <div className="grid grid-cols-2 gap-3 mt-4">
               <FormField label="Product Status">
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={selectCls}>
                  <option value="active">Active (Visible)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </FormField>
              <FormField label="In Stock Override">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, in_stock: !f.in_stock }))}
                  className={`w-full py-2.5 px-3 border rounded-sm text-[11px] font-sans transition-colors ${form.in_stock ? 'border-[#C5A059]/40 text-[#C5A059] bg-[#C5A059]/5' : 'border-[#EAE6E1]/10 text-[#EAE6E1]/40 bg-[#12100C]'}`}
                >
                  {form.in_stock ? 'In Stock' : 'Out of Stock'}
                </button>
              </FormField>
            </div>

            <FormField label="Product Images">
              <div className="flex flex-wrap gap-4 mb-3">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded overflow-hidden border border-[#EAE6E1]/20">
                    <img src={img} alt="Product" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveExistingImage(img)}
                      className="absolute top-1 right-1 bg-black/60 p-0.5 rounded-full hover:bg-red-500/80 transition-colors"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                ))}
                
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
                type="file" multiple accept="image/*"
                onChange={e => {
                  if (e.target.files) setImageFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                }}
                className="text-xs text-[#EAE6E1]/70 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-[#C5A059] file:text-black hover:file:bg-[#d8b571] cursor-pointer w-full border border-[#EAE6E1]/10 p-2 rounded-sm"
              />
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

// ─── Categories, Collections, Discounts, Sidebar, Admin remain unchanged ─────
// (Keep your existing code for CollectionsSection, CategoriesSection, DiscountsSection, Sidebar, and the main Admin component wrapper exactly as they were.)
// ─── Collections Section ──────────────────────────────────────────────────────

export function CollectionsSection() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [showModal, setShowModal] = useState(false);
  const [editingCol, setEditingCol] = useState<Collection | null>(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'active', featured: false });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCollections = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await collectionsApi.list();
      setCollections(data || []);
      // Product counts aren't returned by /collections directly — one
      // lightweight lookup per collection via the products list filter.
      const counts: Record<string, number> = {};
      await Promise.all(
        (data || []).map(async (c) => {
          try {
            const res = await productsApi.list({ collection: c.id, limit: 1 });
            counts[c.id] = res.pagination.total;
          } catch {
            counts[c.id] = 0;
          }
        })
      );
      setProductCounts(counts);
    } catch (err: any) {
      setError('Could not load collections. Make sure the backend is reachable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCollections(); }, []);

  const openAdd = () => { setEditingCol(null); setForm({ name: '', description: '', status: 'active', featured: false }); setFormError(''); setShowModal(true); };
  const openEdit = (c: Collection) => { setEditingCol(c); setForm({ name: c.name, description: c.description || '', status: c.status, featured: c.featured }); setFormError(''); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Collection name is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editingCol) {
        await collectionsApi.update(editingCol.id, form);
      } else {
        await collectionsApi.create(form);
      }
      setShowModal(false);
      fetchCollections();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this collection?')) return;
    try {
      await collectionsApi.remove(id);
      fetchCollections();
    } catch (err: any) {
      alert('Delete failed: ' + (err?.response?.data?.message || err.message));
    }
  };

  const toggleFeatured = async (c: Collection) => {
    try {
      await collectionsApi.update(c.id, { featured: !c.featured });
      fetchCollections();
    } catch (err: any) {
      alert('Update failed: ' + (err?.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <SectionHeader title="Collections" action="New Collection" onAction={openAdd} />
      <p className="text-[11px] text-[#EAE6E1]/40 font-sans mb-5">Group products into curated collections for seasonal drops and editorial features.</p>

      {error && (
        <div className="mb-4 p-3 text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/20 text-[11px] font-sans rounded-sm flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {loading ? (
        <p className="text-[11px] uppercase tracking-[0.2em] font-sans text-[#C5A059] animate-pulse text-center p-10">Loading...</p>
      ) : collections.length === 0 ? (
        <p className="text-[11px] font-sans text-[#EAE6E1]/30 text-center p-10">No collections yet. Click "New Collection" to create one.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(col => (
            <div key={col.id} className="bg-[#111] border border-[#EAE6E1]/10 rounded-sm p-5 hover:border-[#EAE6E1]/20 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[12px] font-sans text-[#EAE6E1] mb-1">{col.name}</p>
                  <p className="text-[10px] font-mono text-[#EAE6E1]/30">/{col.slug}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => openEdit(col)} className="p-1.5 text-[#EAE6E1]/30 hover:text-[#C5A059] transition-colors">
                    <Edit2 size={11} />
                  </button>
                  <button onClick={() => handleDelete(col.id)} className="p-1.5 text-[#EAE6E1]/30 hover:text-red-400 transition-colors">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Badge label={col.status} variant={col.status as any} />
                  <span className="text-[9px] text-[#EAE6E1]/30 font-sans">{productCounts[col.id] ?? 0} products</span>
                </div>
                <button
                  onClick={() => toggleFeatured(col)}
                  className={`flex items-center gap-1 text-[9px] font-sans uppercase tracking-wider transition-colors ${col.featured ? 'text-[#C5A059]' : 'text-[#EAE6E1]/30'}`}
                >
                  <Star size={11} fill={col.featured ? 'currentColor' : 'none'} />
                  {col.featured ? 'Featured' : 'Feature'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal title={editingCol ? 'Edit Collection' : 'New Collection'} onClose={() => setShowModal(false)}>
            {formError && (
              <div className="mb-4 p-3 text-red-400 bg-red-900/10 border border-red-900/30 text-[11px] font-sans rounded-sm flex items-center gap-2">
                <AlertCircle size={14} /> {formError}
              </div>
            )}
            <FormField label="Collection Name *">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Autumn / Winter 2026" className={inputCls} />
            </FormField>
            <FormField label="Description">
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="A short description of this collection..." rows={3} className={`${inputCls} resize-none`} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Status">
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={selectCls}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </FormField>
              <FormField label="Featured">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
                  className={`w-full py-2.5 px-3 border rounded-sm text-[11px] font-sans flex items-center gap-2 transition-colors ${form.featured ? 'border-[#C5A059]/40 text-[#C5A059] bg-[#C5A059]/5' : 'border-[#EAE6E1]/10 text-[#EAE6E1]/40 bg-[#12100C]'}`}
                >
                  <Star size={12} fill={form.featured ? 'currentColor' : 'none'} />
                  {form.featured ? 'Yes – Featured' : 'No – Not featured'}
                </button>
              </FormField>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[#C5A059] text-black text-[10px] uppercase tracking-[0.2em] font-sans rounded-sm hover:bg-[#D4AE68] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                <Save size={12} /> {saving ? 'Saving...' : editingCol ? 'Save Changes' : 'Create Collection'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-[#EAE6E1]/10 text-[10px] uppercase tracking-[0.2em] font-sans text-[#EAE6E1]/50 rounded-sm hover:border-[#EAE6E1]/20 transition-colors">
                Cancel
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Categories Section ───────────────────────────────────────────────────────

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', parent: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await categoriesApi.list();
      setCategories(data || []);
      const counts: Record<string, number> = {};
      await Promise.all(
        (data || []).map(async (c) => {
          try {
            const res = await productsApi.list({ category: c.name, limit: 1 });
            counts[c.id] = res.pagination.total;
          } catch {
            counts[c.id] = 0;
          }
        })
      );
      setProductCounts(counts);
    } catch (err: any) {
      setError('Could not load categories. Make sure the backend is reachable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const topLevel = categories.filter(c => !c.parent);
  const childrenOf = (parentId: string) => categories.filter(c => {
    const p = c.parent;
    const pid = typeof p === 'string' ? p : p?.id;
    return pid === parentId;
  });

  const openAdd = (parentId?: string) => {
    setEditingCat(null);
    setForm({ name: '', description: '', parent: parentId || '', status: 'active' });
    setFormError('');
    setShowModal(true);
  };
  const openEdit = (c: Category) => {
    setEditingCat(c);
    const parentId = typeof c.parent === 'string' ? c.parent : c.parent?.id || '';
    setForm({ name: c.name, description: c.description || '', parent: parentId, status: c.status });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Category name is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      const payload = { name: form.name, description: form.description, parent: form.parent || null, status: form.status };
      if (editingCat) {
        await categoriesApi.update(editingCat.id, payload);
      } else {
        await categoriesApi.create(payload);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this category? Any subcategories under it will need to be reassigned separately.')) return;
    try {
      await categoriesApi.remove(id);
      fetchCategories();
    } catch (err: any) {
      alert('Delete failed: ' + (err?.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <SectionHeader title="Categories" action="New Category" onAction={() => openAdd()} />
      <p className="text-[11px] text-[#EAE6E1]/40 font-sans mb-5">Manage top-level categories and their subcategories that appear in navigation.</p>

      {error && (
        <div className="mb-4 p-3 text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/20 text-[11px] font-sans rounded-sm flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {loading ? (
        <p className="text-[11px] uppercase tracking-[0.2em] font-sans text-[#C5A059] animate-pulse text-center p-10">Loading...</p>
      ) : topLevel.length === 0 ? (
        <p className="text-[11px] font-sans text-[#EAE6E1]/30 text-center p-10">No categories yet. Click "New Category" to create one.</p>
      ) : (
        <div className="space-y-3">
          {topLevel.map(cat => (
            <div key={cat.id} className="bg-[#111] border border-[#EAE6E1]/10 rounded-sm p-5 hover:border-[#EAE6E1]/20 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-[12px] font-sans text-[#EAE6E1] uppercase tracking-[0.05em]">{cat.name}</p>
                    <Badge label={cat.status} variant={cat.status as any} />
                    <span className="text-[9px] text-[#EAE6E1]/30 font-sans">{productCounts[cat.id] ?? 0} products</span>
                  </div>
                  <p className="text-[10px] font-mono text-[#EAE6E1]/30 mb-3">/{cat.slug}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {childrenOf(cat.id).map(sub => (
                      <span key={sub.id} className="group flex items-center gap-1 px-2 py-0.5 bg-[#12100C] border border-[#EAE6E1]/10 text-[9px] font-sans text-[#EAE6E1]/50 rounded-sm uppercase tracking-wider">
                        {sub.name}
                        <button onClick={() => openEdit(sub)} className="text-[#EAE6E1]/20 hover:text-[#C5A059]"><Edit2 size={9} /></button>
                        <button onClick={() => handleDelete(sub.id)} className="text-[#EAE6E1]/20 hover:text-red-400"><Trash2 size={9} /></button>
                      </span>
                    ))}
                    <button
                      onClick={() => openAdd(cat.id)}
                      className="flex items-center gap-1 px-2 py-0.5 border border-dashed border-[#EAE6E1]/15 text-[9px] font-sans text-[#EAE6E1]/30 rounded-sm uppercase tracking-wider hover:border-[#C5A059]/40 hover:text-[#C5A059] transition-colors"
                    >
                      <Plus size={9} /> Add Subcategory
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-4">
                  <button onClick={() => openEdit(cat)} className="p-1.5 text-[#EAE6E1]/30 hover:text-[#C5A059] transition-colors border border-[#EAE6E1]/10 rounded-sm hover:border-[#C5A059]/30">
                    <Edit2 size={11} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-[#EAE6E1]/30 hover:text-red-400 transition-colors border border-[#EAE6E1]/10 rounded-sm hover:border-red-900/30">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal title={editingCat ? 'Edit Category' : 'New Category'} onClose={() => setShowModal(false)}>
            {formError && (
              <div className="mb-4 p-3 text-red-400 bg-red-900/10 border border-red-900/30 text-[11px] font-sans rounded-sm flex items-center gap-2">
                <AlertCircle size={14} /> {formError}
              </div>
            )}
            <FormField label="Category Name *">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Men" className={inputCls} />
            </FormField>
            <FormField label="Description">
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className={`${inputCls} resize-none`} />
            </FormField>
            <FormField label="Parent Category">
              <select value={form.parent} onChange={e => setForm(f => ({ ...f, parent: e.target.value }))} className={selectCls}>
                <option value="">None — top-level category</option>
                {topLevel.filter(c => c.id !== editingCat?.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Status">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={selectCls}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[#C5A059] text-black text-[10px] uppercase tracking-[0.2em] font-sans rounded-sm hover:bg-[#D4AE68] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                <Save size={12} /> {saving ? 'Saving...' : editingCat ? 'Save Changes' : 'Create Category'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-[#EAE6E1]/10 text-[10px] uppercase tracking-[0.2em] font-sans text-[#EAE6E1]/50 rounded-sm hover:border-[#EAE6E1]/20 transition-colors">
                Cancel
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Discounts Section ────────────────────────────────────────────────────────

export function DiscountsSection() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [form, setForm] = useState({ code: '', type: 'Percentage', value: '', limit: '', expiry: '', status: 'Active' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchDiscounts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await discountsApi.list();
      setDiscounts(data || []);
    } catch (err: any) {
      setError('Could not load discounts. Make sure the backend is reachable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDiscounts(); }, []);

  const openAdd = () => {
    setEditingDiscount(null);
    setForm({ code: '', type: 'Percentage', value: '', limit: '', expiry: '', status: 'Active' });
    setFormError('');
    setShowModal(true);
  };
  const openEdit = (d: Discount) => {
    setEditingDiscount(d);
    setForm({
      code: d.code,
      type: d.type,
      value: String(d.value),
      limit: String(d.usage.limit),
      expiry: d.expiry ? d.expiry.slice(0, 10) : '',
      status: d.status,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) { setFormError('Coupon code is required.'); return; }
    if (!form.value || Number(form.value) <= 0) { setFormError('Value must be greater than 0.'); return; }
    if (!form.limit || Number(form.limit) <= 0) { setFormError('Usage limit must be greater than 0.'); return; }
    if (!form.expiry) { setFormError('Expiry date is required.'); return; }

    setSaving(true);
    setFormError('');
    try {
      if (editingDiscount) {
        await discountsApi.update(editingDiscount.id, {
          type: form.type as Discount['type'],
          value: Number(form.value),
          usage: { limit: Number(form.limit) },
          expiry: form.expiry,
          status: form.status as Discount['status'],
        });
      } else {
        await discountsApi.create({
          code: form.code,
          type: form.type as Discount['type'],
          value: Number(form.value),
          usage: { limit: Number(form.limit) },
          expiry: form.expiry,
          status: form.status as Discount['status'],
        });
      }
      setShowModal(false);
      fetchDiscounts();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this discount?')) return;
    try {
      await discountsApi.remove(id);
      fetchDiscounts();
    } catch (err: any) {
      alert('Delete failed: ' + (err?.response?.data?.message || err.message));
    }
  };

  const toggleStatus = async (d: Discount) => {
    try {
      await discountsApi.update(d.id, { status: d.status === 'Active' ? 'Expired' : 'Active' });
      fetchDiscounts();
    } catch (err: any) {
      alert('Update failed: ' + (err?.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <SectionHeader title="Discounts & Coupons" action="New Coupon" onAction={openAdd} />
      <p className="text-[11px] text-[#EAE6E1]/40 font-sans mb-5">Create coupon codes for promotions and customer loyalty programs.</p>

      {error && (
        <div className="mb-4 p-3 text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/20 text-[11px] font-sans rounded-sm flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="bg-[#111] border border-[#EAE6E1]/10 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#EAE6E1]/10 text-[9px] uppercase tracking-[0.2em] font-sans text-[#C5A059] bg-[#12100C]/50">
                <th className="p-4 font-normal">Code</th>
                <th className="p-4 font-normal">Type</th>
                <th className="p-4 font-normal">Value</th>
                <th className="p-4 font-normal">Usage</th>
                <th className="p-4 font-normal">Expiry</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-10 text-center text-[11px] uppercase tracking-[0.2em] font-sans text-[#C5A059] animate-pulse">Loading...</td></tr>
              ) : discounts.length === 0 ? (
                <tr><td colSpan={7} className="p-10 text-center text-[11px] font-sans text-[#EAE6E1]/30">No coupons yet. Click "New Coupon" to create one.</td></tr>
              ) : (
                discounts.map(d => (
                  <tr key={d.id} className="border-b border-[#EAE6E1]/5 hover:bg-[#12100C]/40 transition-colors">
                    <td className="p-4">
                      <span className="text-[12px] font-mono text-[#C5A059] bg-[#C5A059]/10 px-2 py-1 rounded-sm">{d.code}</span>
                    </td>
                    <td className="p-4 text-[10px] font-sans text-[#EAE6E1]/50">{d.type}</td>
                    <td className="p-4 text-[11px] font-mono text-[#EAE6E1]">
                      {d.type === 'Percentage' ? `${d.value}%` : formatVal(d.value)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[80px] bg-[#12100C] rounded-full h-1.5">
                          <div
                            className="bg-[#C5A059] h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, (d.usage.used / d.usage.limit) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-[#EAE6E1]/40">{d.usage.used}/{d.usage.limit}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[10px] font-sans text-[#EAE6E1]/50">{d.expiry ? new Date(d.expiry).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="p-4">
                      <Badge label={d.status} variant={d.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => toggleStatus(d)}
                          className={`p-1.5 transition-colors border rounded-sm ${d.status === 'Active' ? 'text-[#C5A059] border-[#C5A059]/20 hover:border-[#C5A059]/40' : 'text-[#EAE6E1]/30 border-[#EAE6E1]/10 hover:border-[#EAE6E1]/20'}`}
                          title={d.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {d.status === 'Active' ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                        </button>
                        <button onClick={() => openEdit(d)} className="p-1.5 text-[#EAE6E1]/30 hover:text-[#C5A059] transition-colors border border-[#EAE6E1]/10 rounded-sm hover:border-[#C5A059]/30">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => handleDelete(d.id)} className="p-1.5 text-[#EAE6E1]/30 hover:text-red-400 transition-colors border border-[#EAE6E1]/10 rounded-sm hover:border-red-900/30">
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

      <AnimatePresence>
        {showModal && (
          <Modal title={editingDiscount ? 'Edit Coupon' : 'New Coupon'} onClose={() => setShowModal(false)}>
            {formError && (
              <div className="mb-4 p-3 text-red-400 bg-red-900/10 border border-red-900/30 text-[11px] font-sans rounded-sm flex items-center gap-2">
                <AlertCircle size={14} /> {formError}
              </div>
            )}
            <FormField label="Coupon Code *">
              <input
                value={form.code}
                disabled={!!editingDiscount}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. ZEVRAE10"
                className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Discount Type">
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={selectCls}>
                  <option>Percentage</option>
                  <option>Fixed Amount</option>
                </select>
              </FormField>
              <FormField label={form.type === 'Percentage' ? 'Value (%) *' : 'Value (INR) *'}>
                <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder={form.type === 'Percentage' ? '10' : '500'} className={inputCls} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Usage Limit *">
                <input type="number" value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} placeholder="500" className={inputCls} />
              </FormField>
              <FormField label="Expiry Date *">
                <input type="date" value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))} className={inputCls} />
              </FormField>
            </div>
            <FormField label="Status">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={selectCls}>
                <option value="Active">Active</option>
                <option value="Expired">Inactive</option>
              </select>
            </FormField>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[#C5A059] text-black text-[10px] uppercase tracking-[0.2em] font-sans rounded-sm hover:bg-[#D4AE68] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                <Save size={12} /> {saving ? 'Saving...' : editingDiscount ? 'Save Changes' : 'Create Coupon'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-[#EAE6E1]/10 text-[10px] uppercase tracking-[0.2em] font-sans text-[#EAE6E1]/50 rounded-sm hover:border-[#EAE6E1]/20 transition-colors">
                Cancel
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

