import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye, CheckCircle2, Truck, XCircle,
  DollarSign, Archive, Clock, Smartphone, ShoppingBag,
  Tag, Percent, Plus, Edit2, Trash2,
  Search, X, Image, ToggleLeft, ToggleRight,
  Star, AlertCircle, TrendingUp, Users, ArrowUpRight,
  Save, Upload, RefreshCw, Bell, BarChart3,
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { productsApi, Product } from '../api/products';
import { collectionsApi, Collection } from '../api/collections';
import { categoriesApi, Category } from '../api/categories';
import { discountsApi, Discount } from '../api/discounts';
import { ordersApi, Order } from '../api/orders';
import { analysisApi, AnalysisSummary } from '../api/analysis';
import RichTextEditor from './RichTextEditor';

// ─── Types ──────────────────────────────────────────────────────────────────

export type AdminSection = 'dashboard' | 'orders' | 'products' | 'collections' | 'categories' | 'discounts' | 'analysis';
export type { Order };

const formatVal = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const formatDate = (d: string) =>
  new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetricCard({ title, value, icon, sub, highlight = false }: { title: string; value: string | number; icon: React.ReactNode; sub?: string; highlight?: boolean }) {
  return (
    <div className={`p-5 border rounded-sm flex flex-col gap-3 ${highlight ? 'bg-[rgba(var(--theme-accent-rgb),0.05)] border-[rgba(var(--theme-accent-rgb),0.3)]' : 'bg-[var(--theme-surface)] border-[rgba(var(--theme-text-rgb),0.1)]'}`}>
      <div className={`flex items-center justify-between ${highlight ? 'text-[var(--theme-accent)]' : 'text-[rgba(var(--theme-text-rgb),0.4)]'}`}>
        <span className="text-[10px] uppercase font-sans tracking-[0.12em]">{title}</span>
        {icon}
      </div>
      <div className={`text-2xl font-light font-mono ${highlight ? 'text-[var(--theme-accent)]' : 'text-[var(--theme-text)]'}`}>{value}</div>
      {sub && <p className="text-[10px] text-[rgba(var(--theme-text-rgb),0.4)] font-sans">{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-[13px] uppercase tracking-[0.2em] font-sans text-[var(--theme-text)]">{title}</h2>
      {action && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.15em] font-sans bg-[var(--theme-accent)] text-[var(--theme-bg)] hover:brightness-110 transition-colors duration-200 rounded-sm"
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
    inactive: 'bg-[var(--theme-surface)] text-[rgba(var(--theme-text-rgb),0.4)] border-[rgba(var(--theme-text-rgb),0.1)]',
    draft: 'bg-[var(--theme-surface)] text-[rgba(var(--theme-text-rgb),0.4)] border-[rgba(var(--theme-text-rgb),0.1)]',
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
    refunded: 'bg-[var(--theme-surface)] text-[rgba(var(--theme-text-rgb),0.4)] border-[rgba(var(--theme-text-rgb),0.1)]',
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
        className="bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm w-full max-w-lg max-h-full flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(var(--theme-text-rgb),0.1)] flex-shrink-0">
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)]">{title}</h3>
          <button onClick={onClose} className="text-[rgba(var(--theme-text-rgb),0.4)] hover:text-[var(--theme-text)] transition-colors">
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
      <label className="block text-[10px] uppercase tracking-[0.15em] font-sans text-[rgba(var(--theme-text-rgb),0.5)] mb-2">{label}</label>
      {children}
    </div>
  );
}

const baseInputCls = "bg-[var(--theme-bg)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm px-3 text-[12px] text-[var(--theme-text)] font-mono placeholder:text-[rgba(var(--theme-text-rgb),0.2)] focus:outline-none focus:border-[rgba(var(--theme-accent-rgb),0.4)] transition-colors";
const inputCls = `w-full py-2.5 ${baseInputCls}`;
const selectCls = `${inputCls} cursor-pointer`;

// ─── Dashboard Section ────────────────────────────────────────────────────────

export function DashboardSection({ orders }: { orders: Order[] }) {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.order_status === 'placed').length;
  const revenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total, 0);
  const recentOrders = orders.slice(0, 5);

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

  return (
    <div>
      <SectionHeader title="Dashboard" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Orders" value={totalOrders} icon={<Archive size={16} />} sub="All time" />
        <MetricCard title="Pending" value={pendingOrders} icon={<Clock size={16} />} sub="Requires action" />
        <MetricCard title="Products" value={productCount ?? '—'} icon={<ShoppingBag size={16} />} sub="In catalog" />
        <MetricCard title="Revenue" value={formatVal(revenue)} icon={<TrendingUp size={16} />} sub="Prepaid orders" highlight />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[rgba(var(--theme-text-rgb),0.1)] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)]">Recent Orders</span>
            <span className="text-[10px] text-[rgba(var(--theme-text-rgb),0.3)] font-sans">Last 5</span>
          </div>
          {recentOrders.length === 0 ? (
            <p className="p-6 text-[11px] text-[rgba(var(--theme-text-rgb),0.3)] font-sans text-center">No orders yet.</p>
          ) : (
            <div className="divide-y divide-[rgba(var(--theme-text-rgb),0.05)]">
              {recentOrders.map(o => {
                const customer = typeof o.user === 'object' ? o.user : null;
                return (
                  <div key={o.id} className="px-5 py-3 flex items-center justify-between hover:bg-[rgba(var(--theme-bg-rgb),0.4)] transition-colors">
                    <div>
                      <p className="text-[11px] text-[var(--theme-text)] font-mono">{customer?.name || 'Customer'}</p>
                      <p className="text-[9px] text-[rgba(var(--theme-text-rgb),0.4)] font-sans mt-0.5">{o.id.slice(-8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-mono text-[var(--theme-accent)] mb-1">{formatVal(o.total/100)}</p>
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

  // 1. Memoize the table data to prevent infinite re-renders!
  const memoizedOrders = useMemo(() => {
    return orders.filter(o => {
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
  }, [orders, filter, search]);

  const orderStatusColor = (s?: string) => {
    switch (s) {
      case 'delivered': return 'text-emerald-400 bg-emerald-900/20';
      case 'shipped': return 'text-blue-400 bg-blue-900/20';
      case 'processing': return 'text-purple-400 bg-purple-900/20';
      case 'cancelled': return 'text-red-400 bg-red-900/20';
      default: return 'text-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.1)]';
    }
  };

  const columnHelper = createColumnHelper<Order>();
  const columns = useMemo(() => [
    columnHelper.accessor('id', {
      header: 'Order',
      cell: info => <span className="text-[11px] font-mono text-[var(--theme-text)]">#{info.getValue().slice(-8)}</span>
    }),
    columnHelper.display({
      id: 'customer',
      header: 'Customer',
      cell: info => {
        const customer = typeof info.row.original.user === 'object' ? info.row.original.user : null;
        return (
          <>
            <p className="text-[11px] text-[var(--theme-text)]">{customer?.name || 'Customer'}</p>
            <p className="text-[9px] text-[rgba(var(--theme-text-rgb),0.4)] font-mono mt-0.5">{customer?.email}</p>
            {customer?.phone && (
              <p className="text-[9px] text-[rgba(var(--theme-text-rgb),0.4)] font-mono mt-0.5 flex items-center gap-1">
                <Smartphone size={9} /> {customer.phone}
              </p>
            )}
          </>
        );
      }
    }),
    columnHelper.accessor('created_at', {
      header: 'Date',
      cell: info => <span className="text-[10px] text-[rgba(var(--theme-text-rgb),0.5)] font-sans">{formatDate(info.getValue())}</span>
    }),
    columnHelper.accessor('total', {
      header: 'Total',
      cell: info => <span className="text-[11px] font-mono text-[var(--theme-text)]">{formatVal(info.getValue() / 100)}</span>
    }),
    columnHelper.display({
      id: 'payment',
      header: 'Payment',
      cell: info => {
        const order = info.row.original;
        return (
          <div className="flex flex-col gap-1 items-start">
            <Badge label={order.payment_method === 'cod' ? 'COD' : 'Online'} variant={order.payment_method === 'cod' ? 'cod' : 'online'} />
            <Badge label={order.payment_status} variant={order.payment_status === 'paid' ? 'paid' : 'pending'} />
          </div>
        );
      }
    }),
    columnHelper.accessor('order_status', {
      header: 'Status',
      cell: info => (
        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-sans rounded-sm ${orderStatusColor(info.getValue())}`}>
          {info.getValue()}
        </span>
      )
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: info => (
        <button
          onClick={() => setExpandedOrder(prev => prev === info.row.original.id ? null : info.row.original.id)}
          className="text-[9px] uppercase tracking-[0.1em] font-sans hover:text-[var(--theme-accent)] transition-colors border border-[rgba(var(--theme-text-rgb),0.15)] px-3 py-1.5 rounded-sm flex items-center gap-1.5 ml-auto"
        >
          <Eye size={11} /> View
        </button>
      )
    })
  ], []);

  const table = useReactTable({
    data: memoizedOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.id,
  });

  return (
    <div>
      <SectionHeader title="Orders" />
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(var(--theme-text-rgb),0.3)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orders, customers..."
            className="w-full bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm pl-9 pr-4 py-2.5 text-[12px] text-[var(--theme-text)] font-mono placeholder:text-[rgba(var(--theme-text-rgb),0.2)] focus:outline-none focus:border-[rgba(var(--theme-accent-rgb),0.3)] transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'Pending', 'Paid', 'COD', 'Delivered'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[9px] uppercase tracking-[0.15em] font-sans rounded-sm transition-all duration-200 ${
                filter === f
                  ? 'bg-[var(--theme-accent)] text-[var(--theme-bg)]'
                  : 'bg-[var(--theme-surface)] text-[rgba(var(--theme-text-rgb),0.5)] border border-[rgba(var(--theme-text-rgb),0.1)] hover:border-[rgba(var(--theme-accent-rgb),0.3)] hover:text-[var(--theme-accent)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      {errorMsg && (
        <div className="mb-4 p-3 text-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.1)] border border-[rgba(var(--theme-accent-rgb),0.2)] text-[11px] font-sans rounded-sm flex items-center gap-2">
          <AlertCircle size={14} /> {errorMsg}
        </div>
      )}
      <div className="bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-[rgba(var(--theme-text-rgb),0.1)] text-[9px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)] bg-[rgba(var(--theme-bg-rgb),0.5)]">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-4 font-normal">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-[11px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)] animate-pulse">
                    Loading Orders...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-[11px] uppercase tracking-[0.2em] font-sans text-[rgba(var(--theme-text-rgb),0.3)]">
                    No orders found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => {
                  const order = row.original;
                  const customer = typeof order.user === 'object' ? order.user : null;
                  return (
                    <React.Fragment key={row.id}>
                      <tr className="border-b border-[rgba(var(--theme-text-rgb),0.05)] hover:bg-[rgba(var(--theme-bg-rgb),0.4)] transition-colors">
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className={cell.column.id === 'actions' ? 'p-4 text-right' : 'p-4'}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                      <AnimatePresence>
                        {expandedOrder === order.id && (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <td colSpan={7} className="px-5 pb-5 bg-[rgba(var(--theme-bg-rgb),0.6)] border-b border-[rgba(var(--theme-text-rgb),0.1)]">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)] mb-3">Customer Details</p>
                                  <div className="space-y-1.5 text-[11px] text-[rgba(var(--theme-text-rgb),0.7)] bg-[var(--theme-surface)] p-4 rounded-sm border border-[rgba(var(--theme-text-rgb),0.05)]">
                                    <p><span className="text-[rgba(var(--theme-text-rgb),0.4)] w-14 inline-block">Name:</span> {customer?.name || '—'}</p>
                                    <p><span className="text-[rgba(var(--theme-text-rgb),0.4)] w-14 inline-block">Email:</span> {customer?.email || '—'}</p>
                                    {customer?.phone && <p><span className="text-[rgba(var(--theme-text-rgb),0.4)] w-14 inline-block">Phone:</span> {customer.phone}</p>}
                                    <p>
                                      <span className="text-[rgba(var(--theme-text-rgb),0.4)] w-14 inline-block">Address:</span>{' '}
                                      {[order.shipping_address?.line1, order.shipping_address?.line2, order.shipping_address?.city, order.shipping_address?.state, order.shipping_address?.postal_code, order.shipping_address?.country]
                                        .filter(Boolean).join(', ')}
                                    </p>
                                  </div>
                                  <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)] mb-3 mt-5">Update Status</p>
                                  <div className="flex flex-wrap gap-2">
                                    {['processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                                      <button
                                        key={s}
                                        onClick={() => onUpdateStatus(order.id, s)}
                                        className="px-3 py-1.5 text-[9px] uppercase tracking-[0.1em] font-sans bg-[var(--theme-bg)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm hover:border-[rgba(var(--theme-accent-rgb),0.4)] hover:text-[var(--theme-accent)] transition-colors capitalize"
                                      >
                                        {s}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)] mb-3">Products Ordered</p>
                                  <div className="space-y-2">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-center bg-[var(--theme-surface)] p-3 border border-[rgba(var(--theme-text-rgb),0.05)] rounded-sm">
                                        <div>
                                          <p className="text-[10px] font-sans uppercase tracking-[0.1em] text-[var(--theme-text)]">{item.name}</p>
                                          <p className="text-[9px] font-mono text-[rgba(var(--theme-text-rgb),0.4)] mt-0.5">Size: {item.size || '—'} × {item.quantity}</p>
                                        </div>
                                        <span className="text-[11px] font-mono text-[var(--theme-accent)]">{formatVal(item.price * item.quantity)}</span>
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

interface StockItem {
  size: string;
  quantity: number;
  _rowId?: number; 
}

let rowIdCounter = 0;
const nextRowId = () => ++rowIdCounter;

interface DbProduct {
  id: string;
  name: string;
  description: string;
  collections: string[]; 
  category: string;
  subcategory: string;
  price: number;
  compare_price: number | null;
  discount: number | null;
  inventory_mode: 'size' | 'nosize';
  stock_quantity: StockItem[];
  in_stock: boolean;
  images: string[];
  status: string;
  is_deleted?: boolean;
  created_at: string;
}

function productToDbProduct(p: Product): DbProduct {
  const sizeStock = p.size_stock || {};
  const inventory_mode = p.inventory_mode || (p.sizes && p.sizes.length > 0 ? 'size' : 'nosize');
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
    discount: p.discount ?? null,
    inventory_mode,
    stock_quantity,
    in_stock: stock_quantity.some(s => s.quantity > 0) || stock_quantity.length === 0,
    images: p.images || [],
    status: p.status,
    is_deleted: p.is_deleted,
    created_at: p.created_at,
  };
}

function dbProductPayload(form: Omit<DbProduct, 'id' | 'created_at' | 'is_deleted'>): Partial<Product> {
  const sizes = form.inventory_mode === 'size'
    ? form.stock_quantity.filter(s => s.quantity > 0).map(s => s.size)
    : [];
  const size_stock = Object.fromEntries(form.stock_quantity.map(s => [s.size.trim(), s.quantity]));
  return {
    name: form.name,
    description: form.description,
    collections: form.collections,
    category: form.category,
    subcategory: form.subcategory,
    price: form.price,
    compare_price: form.compare_price ?? undefined,
    discount: form.discount ?? undefined,
    images: form.images,
    status: form.status as Product['status'],
    inventory_mode: form.inventory_mode,
    sizes,
    size_stock,
  };
}

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const PRODUCT_TEMPLATE = `
  <h2>Materials & Construction</h2>
  <ul>
    <li><strong>Composition:</strong> 100% Premium Cotton — 240 GSM oversized fit</li>
    <li><strong>Origin:</strong> Ethically produced in limited quantities</li>
    <li><strong>Finish:</strong> Enzyme-washed for a lived-in softness</li>
  </ul>
  <h2>Fit & Sizing</h2>
  <ul>
    <li>Oversized silhouette — size down for a relaxed fit</li>
    <li>Drop shoulders, extended hem</li>
    <li>Crew neck collar with double stitching</li>
  </ul>
  <h2>Care Instructions</h2>
  <ul>
    <li>Machine wash cold, inside out</li>
    <li>Do not tumble dry</li>
    <li>Iron on low heat, avoid print</li>
    <li>Do not bleach</li>
  </ul>
  <h2>Delivery & Returns</h2>
  <p>Free shipping on orders above ₹999.</p>
  <p>Dispatched within 2–4 business days. Delivery in 5–8 days.</p>
  <p>14-day returns accepted on unworn, unaltered items with original tags intact.</p>
`;

const emptyForm = (): Omit<DbProduct, 'id' | 'created_at' | 'is_deleted'> => ({
  name: '',
  description: PRODUCT_TEMPLATE, 
  collections: [],
  category: '',
  subcategory: '',
  price: 0,
  compare_price: null,
  discount: null,
  inventory_mode: 'size',
  stock_quantity: [],
  in_stock: true,
  images: [],
  status: 'active',
});

// ─── Products Section ─────────────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string[]> = {
  Men:               ['T-Shirts', 'Lowers'],
  Women:             ['T-Shirts', 'Lowers', 'Crop-Tops'],
  Unisex:            ['T-Shirts', 'Lowers'],
  'Jewellery/Men':   ['Rings', 'Pendants', 'Bracelets', 'Earrings'],
  'Jewellery/Women': ['Rings', 'Pendants', 'Bracelets', 'Earrings'],
  Accessories:       ['Keychains', 'Soft Toys'],
};

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
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

  useEffect(() => {
    collectionsApi.list({ status: 'active' })
      .then(({ data }) => setCollections(data || []))
      .catch(() => setCollections([]));

    categoriesApi.list()
      .then(({ data }) => {
        const backendNames = (data || []).filter((c: Category) => !c.parent).map((c: Category) => c.name);
        const localOnly = Object.keys(CATEGORY_MAP).filter(n => !backendNames.includes(n));
        const synthetic: Category[] = localOnly.map((name, i) => ({
          id: `local-${i}`,
          name,
          slug: name.toLowerCase(),
          parent: null,
          status: 'active' as const,
          created_at: '',
        }));
        setAvailableCategories([...(data || []), ...synthetic]);
      })
      .catch(() => {
        const fallback: Category[] = Object.keys(CATEGORY_MAP).map((name, i) => ({
          id: `local-${i}`,
          name,
          slug: name.toLowerCase(),
          parent: null,
          status: 'active' as const,
          created_at: '',
        }));
        setAvailableCategories(fallback);
      });
  }, []);

  const fetchDbProducts = useCallback(async () => {
    setDbLoading(true);
    setDbError('');
    try {
      let allProducts: DbProduct[] = [];
      let currentPage = 1;
      let hasMore = true;
      const MAX_PAGES = 300;

      while (hasMore && currentPage <= MAX_PAGES) {
        const response: any = await productsApi.list({ limit: 100, page: currentPage });

        const items = response?.data || [];
        const pagination = response?.pagination;

        if (items.length > 0) {
          const mappedItems = items.map((item: any) => productToDbProduct(item));
          allProducts = [...allProducts, ...mappedItems];
        }

        if (items.length === 0) {
          hasMore = false;
        } else if (pagination && typeof pagination.pages === 'number') {
          hasMore = currentPage < pagination.pages;
          currentPage++;
        } else if (items.length < 100) {
          hasMore = false;
        } else {
          hasMore = false;
        }
      }

      setDbProducts(allProducts);
    } catch (err: any) {
      setDbError('Could not load products. Make sure the database is connected.');
    } finally {
      setDbLoading(false);
    }
  }, []);

  useEffect(() => { fetchDbProducts(); }, [fetchDbProducts]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setImageFiles([]);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = useCallback((p: DbProduct) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || '',
      collections: p.collections || [],
      category: p.category,
      subcategory: p.subcategory,
      price: p.price,
      compare_price: p.compare_price,
      discount: p.discount ?? null,
      inventory_mode: p.inventory_mode,
      stock_quantity: (p.stock_quantity || []).map(row => ({ ...row, _rowId: nextRowId() })),
      in_stock: p.in_stock ?? true,
      images: p.images || [],
      status: p.status,
    });
    setImageFiles([]);
    setFormError('');
    setShowModal(true);
  }, []);

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

  const handleInventoryModeChange = (mode: 'size' | 'nosize') => {
    setForm(f => ({
      ...f,
      inventory_mode: mode,
      stock_quantity: mode === 'nosize' ? [{ size: '', quantity: 0, _rowId: nextRowId() }] : [],
    }));
  };

  const addCustomStockRow = () => {
    setForm(f => ({ ...f, stock_quantity: [...f.stock_quantity, { size: '', quantity: 0, _rowId: nextRowId() }] }));
  };

  const removeCustomStockRow = (index: number) => {
    setForm(f => ({ ...f, stock_quantity: f.stock_quantity.filter((_, i) => i !== index) }));
  };

  const updateCustomStockRow = (index: number, patch: Partial<StockItem>) => {
    setForm(f => ({
      ...f,
      stock_quantity: f.stock_quantity.map((row, i) => i === index ? { ...row, ...patch } : row),
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

  const isDescriptionEmpty = (html: string) => !html.replace(/<[^>]*>/g, '').trim();

  const validateForm = (): string | null => {
    if (!form.name.trim()) return 'Product name is required.';
    if (isDescriptionEmpty(form.description)) return 'Description is required.';
    if (!form.category.trim()) return 'Category is required.';
    if (!form.subcategory.trim()) return 'Subcategory is required.';
    if (!form.price || form.price <= 0) return 'Price must be greater than 0.';

    if (form.inventory_mode === 'size') {
      if (form.stock_quantity.length === 0) return 'Select at least one size for a Clothing item.';
    } else {
      if (form.stock_quantity.length === 0) return 'Add at least one stock entry for an Other item.';
      const labels = form.stock_quantity.map(r => r.size.trim().toLowerCase());
      if (new Set(labels).size !== labels.length) {
        return 'Two stock rows have the same (or both blank) label — give each a distinct name, or remove one.';
      }
    }
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

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Soft delete this product? It will be removed from the active store views.')) return;
    try {
      await productsApi.remove(id);
      fetchDbProducts();
    } catch (error: any) {
      alert('Delete failed: ' + (error?.response?.data?.message || error.message));
    }
  }, [fetchDbProducts]);

  // 1. Memoize the table data to prevent infinite re-renders!
  const memoizedProducts = useMemo(() => {
    return dbProducts.filter(p =>
      !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.subcategory.toLowerCase().includes(search.toLowerCase())
    );
  }, [dbProducts, search]);

  const columnHelper = createColumnHelper<DbProduct>();
  const columns = useMemo(() => [
    columnHelper.display({
      id: 'product',
      header: 'Product',
      cell: info => {
        const p = info.row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--theme-bg)] rounded-sm overflow-hidden flex-shrink-0 border border-[rgba(var(--theme-text-rgb),0.1)]">
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image size={12} className="text-[rgba(var(--theme-text-rgb),0.2)]" />
                </div>
              )}
            </div>
            <div>
              <span className="text-[11px] font-sans text-[var(--theme-text)] uppercase tracking-[0.05em] block">{p.name}</span>
              {!p.in_stock && <span className="text-[9px] text-red-400 font-sans block">Out of Stock</span>}
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor('subcategory', {
      header: 'Subcategory',
      cell: info => <span className="text-[10px] font-sans text-[rgba(var(--theme-text-rgb),0.5)]">{info.getValue()}</span>
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      cell: info => <span className="text-[11px] font-mono text-[var(--theme-text)]">{formatVal(info.getValue())}</span>
    }),
    columnHelper.display({
      id: 'compare',
      header: 'Compare',
      cell: info => {
        const p = info.row.original;
        return p.compare_price && p.compare_price > p.price ? (
          <span className="px-2 py-0.5 text-[9px] font-mono font-semibold rounded-sm bg-emerald-900/20 text-emerald-400 border border-emerald-900/40">
            -{Math.round(((p.compare_price - p.price) / p.compare_price) * 100)}%
          </span>
        ) : (
          <span className="text-[10px] text-[rgba(var(--theme-text-rgb),0.2)] font-sans">—</span>
        );
      }
    }),
    columnHelper.display({
      id: 'stock',
      header: 'Stock (Sizes)',
      cell: info => {
        const p = info.row.original;
        return (
          <div className="flex flex-col items-start gap-1">
            {p.in_stock !== false ? (
              <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-sans rounded-sm border bg-emerald-900/25 text-emerald-400 border-emerald-900/40">In Stock</span>
            ) : (
              <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-sans rounded-sm border bg-red-900/20 text-red-400 border-red-900/30">Out of Stock</span>
            )}
            <div className="flex flex-wrap gap-1 mt-1">
              {(p.stock_quantity || []).map(sq => (
                <span key={sq.size} className="px-1.5 py-0.5 text-[8px] font-sans border border-[rgba(var(--theme-text-rgb),0.15)] text-[rgba(var(--theme-text-rgb),0.5)] rounded-sm">
                  {sq.size}: {sq.quantity}
                </span>
              ))}
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => <Badge label={info.getValue()} variant={info.getValue() as any} />
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: info => {
        const p = info.row.original;
        return (
          <div className="flex items-center gap-2 justify-end">
            <button onClick={() => openEdit(p)} className="p-1.5 text-[rgba(var(--theme-text-rgb),0.4)] hover:text-[var(--theme-accent)] transition-colors border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm hover:border-[rgba(var(--theme-accent-rgb),0.3)]">
              <Edit2 size={12} />
            </button>
            <button onClick={() => handleDelete(p.id)} className="p-1.5 text-[rgba(var(--theme-text-rgb),0.4)] hover:text-red-400 transition-colors border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm hover:border-red-900/50">
              <Trash2 size={12} />
            </button>
          </div>
        );
      }
    })
  ], [openEdit, handleDelete]);

  const table = useReactTable({
    data: memoizedProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.id,
  });

  return (
    <div>
      <SectionHeader title="Products" action="Add Product" onAction={openAdd} />
      
      <div className="relative mb-5">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(var(--theme-text-rgb),0.3)]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm pl-9 pr-4 py-2.5 text-[12px] text-[var(--theme-text)] font-mono placeholder:text-[rgba(var(--theme-text-rgb),0.2)] focus:outline-none focus:border-[rgba(var(--theme-accent-rgb),0.3)] transition-colors"
        />
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)]">Database Products</span>
          <button
            onClick={() => fetchDbProducts()}
            className="ml-auto p-1.5 text-[rgba(var(--theme-text-rgb),0.3)] hover:text-[var(--theme-accent)] transition-colors border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm hover:border-[rgba(var(--theme-accent-rgb),0.3)]"
          >
            <RefreshCw size={11} />
          </button>
        </div>

        {dbError && (
          <div className="mb-4 p-3 text-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.1)] border border-[rgba(var(--theme-accent-rgb),0.2)] text-[11px] font-sans rounded-sm flex items-center gap-2">
            <AlertCircle size={14} /> {dbError}
          </div>
        )}

        <div className="bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm overflow-hidden mb-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="border-b border-[rgba(var(--theme-text-rgb),0.1)] text-[9px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)] bg-[rgba(var(--theme-bg-rgb),0.5)]">
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="p-4 font-normal">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {dbLoading ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-[11px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)] animate-pulse">
                      Loading...
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-[11px] font-sans text-[rgba(var(--theme-text-rgb),0.3)]">
                      {dbError ? 'Table not found.' : 'No products yet. Click "Add Product" to create one.'}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="border-b border-[rgba(var(--theme-text-rgb),0.05)] hover:bg-[rgba(var(--theme-bg-rgb),0.4)] transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className={cell.column.id === 'actions' ? 'p-4 text-right' : 'p-4'}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
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
                      form.collections.includes(col.id) ? 'border-[var(--theme-accent)] text-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.1)]' : 'border-[rgba(var(--theme-text-rgb),0.15)] text-[rgba(var(--theme-text-rgb),0.4)] hover:border-[rgba(var(--theme-text-rgb),0.3)]'
                    }`}
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Category *">
                <select 
                  value={form.category} 
                  onChange={e => {
                    const cat = e.target.value;
                    const subs = CATEGORY_MAP[cat] || [];
                    setForm(f => ({ ...f, category: cat, subcategory: subs[0] || '' }));
                  }} 
                  className={selectCls}
                >
                  <option value="" disabled>Select a category</option>
                  {availableCategories.filter(c => !c.parent).map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Subcategory *">
                {(CATEGORY_MAP[form.category] || []).length > 0 ? (
                  <select
                    value={form.subcategory}
                    onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                    className={selectCls}
                  >
                    <option value="" disabled>Select a subcategory</option>
                    {(CATEGORY_MAP[form.category] || []).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                ) : (
                  <input value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))} className={inputCls} placeholder="e.g. T-Shirts" />
                )}
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

            <FormField label="Discount (%)">
              <input
                type="number"
                min="0"
                max="99"
                value={form.discount ?? ''}
                onChange={e => setForm(f => ({ ...f, discount: e.target.value ? Number(e.target.value) : null }))}
                placeholder="e.g. 10 for 10% off"
                className={inputCls}
              />
              {form.discount && form.discount > 0 && (
                <p className="text-[9px] text-emerald-400 font-sans mt-1.5">-{form.discount}% discount applied</p>
              )}
            </FormField>

            <FormField label="Inventory Type">
              <div className="flex gap-2 mt-1 mb-3">
                <button
                  type="button"
                  onClick={() => handleInventoryModeChange('size')}
                  className={`flex-1 px-3 py-2 text-[11px] font-sans uppercase tracking-wider border rounded-sm transition-all duration-150 ${
                    form.inventory_mode === 'size' ? 'border-[var(--theme-accent)] text-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.1)]' : 'border-[rgba(var(--theme-text-rgb),0.15)] text-[rgba(var(--theme-text-rgb),0.4)] hover:border-[rgba(var(--theme-text-rgb),0.3)]'
                  }`}
                >
                  Clothing (Standard Sizes)
                </button>
                <button
                  type="button"
                  onClick={() => handleInventoryModeChange('nosize')}
                  className={`flex-1 px-3 py-2 text-[11px] font-sans uppercase tracking-wider border rounded-sm transition-all duration-150 ${
                    form.inventory_mode === 'nosize' ? 'border-[var(--theme-accent)] text-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.1)]' : 'border-[rgba(var(--theme-text-rgb),0.15)] text-[rgba(var(--theme-text-rgb),0.4)] hover:border-[rgba(var(--theme-text-rgb),0.3)]'
                  }`}
                >
                  Other (Custom / No Size)
                </button>
              </div>

              {form.inventory_mode === 'size' ? (
                <div className="flex flex-col gap-2">
                  {ALL_SIZES.map(s => {
                    const existing = form.stock_quantity.find(x => x.size === s);
                    const isSelected = !!existing;
                    return (
                      <div key={s} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleSize(s)}
                          className={`px-3 py-1.5 w-14 text-[11px] font-sans uppercase tracking-wider border rounded-sm transition-all duration-150 ${
                            isSelected ? 'border-[var(--theme-accent)] text-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.1)]' : 'border-[rgba(var(--theme-text-rgb),0.15)] text-[rgba(var(--theme-text-rgb),0.4)] hover:border-[rgba(var(--theme-text-rgb),0.3)]'
                          }`}
                        >
                          {s}
                        </button>
                        {isSelected && (
                          <input
                            type="number"
                            value={existing.quantity}
                            onChange={e => handleQuantityChange(s, parseInt(e.target.value) || 0)}
                            className={`${baseInputCls} w-24 py-1.5`}
                            placeholder="Qty"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] text-[rgba(var(--theme-text-rgb),0.4)] font-sans mb-1">
                    For items without standard sizing — jewellery, accessories, etc. A label is optional; leave it blank for a single stock count with no variant name.
                  </p>
                  {form.stock_quantity.map((row, i) => (
                    <div key={row._rowId ?? i} className="grid grid-cols-[1fr_80px_auto] sm:grid-cols-[1fr_100px_auto] gap-2 items-center w-full mb-2">
                      <input
                        type="text"
                        value={row.size}
                        onChange={e => updateCustomStockRow(i, { size: e.target.value })}
                        placeholder="Label (optional) — e.g. One Size"
                        className={inputCls}
                        style={{ paddingTop: '0.375rem', paddingBottom: '0.375rem' }}
                      />
                      <input
                        type="number"
                        value={row.quantity}
                        onChange={e => updateCustomStockRow(i, { quantity: parseInt(e.target.value) || 0 })}
                        placeholder="Qty"
                        className={inputCls}
                        style={{ paddingTop: '0.375rem', paddingBottom: '0.375rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeCustomStockRow(i)}
                        disabled={form.stock_quantity.length === 1}
                        className="p-1.5 text-[rgba(var(--theme-text-rgb),0.3)] hover:text-red-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                        title={form.stock_quantity.length === 1 ? 'At least one row is required' : 'Remove row'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCustomStockRow}
                    className="flex items-center gap-1.5 mt-1 text-[10px] uppercase tracking-wider font-sans text-[var(--theme-accent)] hover:brightness-110 transition-colors self-start"
                  >
                    <Plus size={12} /> Add Row
                  </button>
                </div>
              )}
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
                  className={`w-full py-2.5 px-3 border rounded-sm text-[11px] font-sans transition-colors ${form.in_stock ? 'border-[rgba(var(--theme-accent-rgb),0.4)] text-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.05)]' : 'border-[rgba(var(--theme-text-rgb),0.1)] text-[rgba(var(--theme-text-rgb),0.4)] bg-[var(--theme-bg)]'}`}
                >
                  {form.in_stock ? 'In Stock' : 'Out of Stock'}
                </button>
              </FormField>
            </div>

            <FormField label="Product Images">
              <div className="flex flex-wrap gap-4 mb-3">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded overflow-hidden border border-[rgba(var(--theme-text-rgb),0.2)]">
                    <img src={img} alt="Product" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveExistingImage(img)}
                      className="absolute top-1 right-1 bg-[var(--theme-bg)]/80 p-0.5 rounded-full hover:bg-red-500/80 transition-colors"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                ))}
                
                {imageFiles.map((file, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded overflow-hidden border border-[var(--theme-accent)] opacity-80">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImageFiles(files => files.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-[var(--theme-bg)]/80 p-0.5 rounded-full hover:bg-red-500/80 transition-colors"
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
                className="text-xs text-[rgba(var(--theme-text-rgb),0.7)] file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-[var(--theme-accent)] file:text-[var(--theme-bg)] hover:file:brightness-110 cursor-pointer w-full border border-[rgba(var(--theme-text-rgb),0.1)] p-2 rounded-sm"
              />
            </FormField>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex-1 py-2.5 bg-[var(--theme-accent)] text-[var(--theme-bg)] text-[10px] uppercase tracking-[0.2em] font-sans rounded-sm hover:brightness-110 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={12} /> {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Product'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 border border-[rgba(var(--theme-text-rgb),0.1)] text-[10px] uppercase tracking-[0.2em] font-sans text-[rgba(var(--theme-text-rgb),0.5)] rounded-sm hover:border-[rgba(var(--theme-text-rgb),0.2)] transition-colors"
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
  
  const openEdit = useCallback((c: Collection) => { 
    setEditingCol(c); 
    setForm({ name: c.name, description: c.description || '', status: c.status, featured: c.featured }); 
    setFormError(''); 
    setShowModal(true); 
  }, []);

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

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Remove this collection?')) return;
    try {
      await collectionsApi.remove(id);
      fetchCollections();
    } catch (err: any) {
      alert('Delete failed: ' + (err?.response?.data?.message || err.message));
    }
  }, []);

  const toggleFeatured = useCallback(async (c: Collection) => {
    try {
      await collectionsApi.update(c.id, { featured: !c.featured });
      fetchCollections();
    } catch (err: any) {
      alert('Update failed: ' + (err?.response?.data?.message || err.message));
    }
  }, []);

  // 1. Memoize Data to prevent infinite re-renders!
  const memoizedCollections = useMemo(() => collections, [collections]);

  const columnHelper = createColumnHelper<Collection>();
  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Collection',
      cell: info => (
        <div>
          <span className="text-[12px] font-sans text-[var(--theme-text)] block">{info.getValue()}</span>
          <span className="text-[10px] font-mono text-[rgba(var(--theme-text-rgb),0.3)]">/{info.row.original.slug}</span>
        </div>
      )
    }),
    columnHelper.display({
      id: 'products',
      header: 'Products',
      cell: info => <span className="text-[10px] font-sans text-[rgba(var(--theme-text-rgb),0.5)]">{productCounts[info.row.original.id] ?? 0}</span>
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => <Badge label={info.getValue()} variant={info.getValue() as any} />
    }),
    columnHelper.accessor('featured', {
      header: 'Featured',
      cell: info => {
        const c = info.row.original;
        return (
          <button
            onClick={() => toggleFeatured(c)}
            className={`flex items-center gap-1 text-[9px] font-sans uppercase tracking-wider transition-colors ${c.featured ? 'text-[var(--theme-accent)]' : 'text-[rgba(var(--theme-text-rgb),0.3)]'}`}
          >
            <Star size={11} fill={c.featured ? 'currentColor' : 'none'} />
            {c.featured ? 'Featured' : 'Feature'}
          </button>
        )
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: info => (
        <div className="flex items-center gap-2 justify-end">
          <button onClick={() => openEdit(info.row.original)} className="p-1.5 text-[rgba(var(--theme-text-rgb),0.4)] hover:text-[var(--theme-accent)] transition-colors border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm hover:border-[rgba(var(--theme-accent-rgb),0.3)]">
            <Edit2 size={12} />
          </button>
          <button onClick={() => handleDelete(info.row.original.id)} className="p-1.5 text-[rgba(var(--theme-text-rgb),0.4)] hover:text-red-400 transition-colors border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm hover:border-red-900/50">
            <Trash2 size={12} />
          </button>
        </div>
      )
    })
  ], [productCounts, toggleFeatured, openEdit, handleDelete]);

  const table = useReactTable({
    data: memoizedCollections,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.id,
  });

  return (
    <div>
      <SectionHeader title="Collections" action="New Collection" onAction={openAdd} />
      <p className="text-[11px] text-[rgba(var(--theme-text-rgb),0.4)] font-sans mb-5">Group products into curated collections for seasonal drops and editorial features.</p>

      {error && (
        <div className="mb-4 p-3 text-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.1)] border border-[rgba(var(--theme-accent-rgb),0.2)] text-[11px] font-sans rounded-sm flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm overflow-hidden mb-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-[rgba(var(--theme-text-rgb),0.1)] text-[9px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)] bg-[rgba(var(--theme-bg-rgb),0.5)]">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-4 font-normal">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center text-[11px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)] animate-pulse">Loading...</td></tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-[11px] font-sans text-[rgba(var(--theme-text-rgb),0.3)]">No collections yet. Click "New Collection" to create one.</td></tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-b border-[rgba(var(--theme-text-rgb),0.05)] hover:bg-[rgba(var(--theme-bg-rgb),0.4)] transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className={cell.column.id === 'actions' ? 'p-4 text-right' : 'p-4'}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                  className={`w-full py-2.5 px-3 border rounded-sm text-[11px] font-sans flex items-center gap-2 transition-colors ${form.featured ? 'border-[rgba(var(--theme-accent-rgb),0.4)] text-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.05)]' : 'border-[rgba(var(--theme-text-rgb),0.1)] text-[rgba(var(--theme-text-rgb),0.4)] bg-[var(--theme-bg)]'}`}
                >
                  <Star size={12} fill={form.featured ? 'currentColor' : 'none'} />
                  {form.featured ? 'Yes – Featured' : 'No – Not featured'}
                </button>
              </FormField>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[var(--theme-accent)] text-[var(--theme-bg)] text-[10px] uppercase tracking-[0.2em] font-sans rounded-sm hover:brightness-110 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                <Save size={12} /> {saving ? 'Saving...' : editingCol ? 'Save Changes' : 'Create Collection'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-[rgba(var(--theme-text-rgb),0.1)] text-[10px] uppercase tracking-[0.2em] font-sans text-[rgba(var(--theme-text-rgb),0.5)] rounded-sm hover:border-[rgba(var(--theme-text-rgb),0.2)] transition-colors">
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

  const openAdd = useCallback((parentId?: string) => {
    setEditingCat(null);
    setForm({ name: '', description: '', parent: parentId || '', status: 'active' });
    setFormError('');
    setShowModal(true);
  }, []);

  const openEdit = useCallback((c: Category) => {
    setEditingCat(c);
    const parentId = typeof c.parent === 'string' ? c.parent : c.parent?.id || '';
    setForm({ name: c.name, description: c.description || '', parent: parentId, status: c.status });
    setFormError('');
    setShowModal(true);
  }, []);

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

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Remove this category? Any subcategories under it will need to be reassigned separately.')) return;
    try {
      await categoriesApi.remove(id);
      fetchCategories();
    } catch (err: any) {
      alert('Delete failed: ' + (err?.response?.data?.message || err.message));
    }
  }, []);

  // 1. Memoize Data to prevent infinite re-renders!
  const memoizedTopLevel = useMemo(() => categories.filter(c => !c.parent), [categories]);

  const columnHelper = createColumnHelper<Category>();
  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Category',
      cell: info => (
        <div>
          <span className="text-[12px] font-sans text-[var(--theme-text)] uppercase tracking-[0.05em] block">{info.getValue()}</span>
          <span className="text-[10px] font-mono text-[rgba(var(--theme-text-rgb),0.3)]">/{info.row.original.slug}</span>
        </div>
      )
    }),
    columnHelper.display({
      id: 'products',
      header: 'Products',
      cell: info => <span className="text-[10px] font-sans text-[rgba(var(--theme-text-rgb),0.5)]">{productCounts[info.row.original.id] ?? 0}</span>
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => <Badge label={info.getValue()} variant={info.getValue() as any} />
    }),
    columnHelper.display({
      id: 'subcategories',
      header: 'Subcategories',
      cell: info => {
        const cat = info.row.original;
        const subs = categories.filter(c => {
          const p = c.parent;
          const pid = typeof p === 'string' ? p : p?.id;
          return pid === cat.id;
        });

        return (
          <div className="flex flex-wrap gap-1.5">
            {subs.map(sub => (
              <span key={sub.id} className="group flex items-center gap-1 px-2 py-0.5 bg-[var(--theme-bg)] border border-[rgba(var(--theme-text-rgb),0.1)] text-[9px] font-sans text-[rgba(var(--theme-text-rgb),0.5)] rounded-sm uppercase tracking-wider">
                {sub.name}
                <button onClick={() => openEdit(sub)} className="text-[rgba(var(--theme-text-rgb),0.2)] hover:text-[var(--theme-accent)]"><Edit2 size={9} /></button>
                <button onClick={() => handleDelete(sub.id)} className="text-[rgba(var(--theme-text-rgb),0.2)] hover:text-red-400"><Trash2 size={9} /></button>
              </span>
            ))}
            <button
              onClick={() => openAdd(cat.id)}
              className="flex items-center gap-1 px-2 py-0.5 border border-dashed border-[rgba(var(--theme-text-rgb),0.15)] text-[9px] font-sans text-[rgba(var(--theme-text-rgb),0.3)] rounded-sm uppercase tracking-wider hover:border-[rgba(var(--theme-accent-rgb),0.4)] hover:text-[var(--theme-accent)] transition-colors"
            >
              <Plus size={9} /> Add Sub
            </button>
          </div>
        );
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: info => (
        <div className="flex items-center gap-2 justify-end">
          <button onClick={() => openEdit(info.row.original)} className="p-1.5 text-[rgba(var(--theme-text-rgb),0.3)] hover:text-[var(--theme-accent)] transition-colors border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm hover:border-[rgba(var(--theme-accent-rgb),0.3)]">
            <Edit2 size={11} />
          </button>
          <button onClick={() => handleDelete(info.row.original.id)} className="p-1.5 text-[rgba(var(--theme-text-rgb),0.3)] hover:text-red-400 transition-colors border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm hover:border-red-900/30">
            <Trash2 size={11} />
          </button>
        </div>
      )
    })
  ], [productCounts, categories, openEdit, handleDelete, openAdd]);

  const table = useReactTable({
    data: memoizedTopLevel,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.id,
  });

  return (
    <div>
      <SectionHeader title="Categories" action="New Category" onAction={() => openAdd()} />
      <p className="text-[11px] text-[rgba(var(--theme-text-rgb),0.4)] font-sans mb-5">Manage top-level categories and their subcategories that appear in navigation.</p>

      {error && (
        <div className="mb-4 p-3 text-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.1)] border border-[rgba(var(--theme-accent-rgb),0.2)] text-[11px] font-sans rounded-sm flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm overflow-hidden mb-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-[rgba(var(--theme-text-rgb),0.1)] text-[9px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)] bg-[rgba(var(--theme-bg-rgb),0.5)]">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-4 font-normal">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center text-[11px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)] animate-pulse">Loading...</td></tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-[11px] font-sans text-[rgba(var(--theme-text-rgb),0.3)]">No categories yet. Click "New Category" to create one.</td></tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-b border-[rgba(var(--theme-text-rgb),0.05)] hover:bg-[rgba(var(--theme-bg-rgb),0.4)] transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className={cell.column.id === 'actions' ? 'p-4 text-right' : 'p-4'}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                {memoizedTopLevel.filter(c => c.id !== editingCat?.id).map(c => (
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
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[var(--theme-accent)] text-[var(--theme-bg)] text-[10px] uppercase tracking-[0.2em] font-sans rounded-sm hover:brightness-110 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                <Save size={12} /> {saving ? 'Saving...' : editingCat ? 'Save Changes' : 'Create Category'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-[rgba(var(--theme-text-rgb),0.1)] text-[10px] uppercase tracking-[0.2em] font-sans text-[rgba(var(--theme-text-rgb),0.5)] rounded-sm hover:border-[rgba(var(--theme-text-rgb),0.2)] transition-colors">
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
  const openEdit = useCallback((d: Discount) => {
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
  }, []);

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

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Remove this discount?')) return;
    try {
      await discountsApi.remove(id);
      fetchDiscounts();
    } catch (err: any) {
      alert('Delete failed: ' + (err?.response?.data?.message || err.message));
    }
  }, []);

  const toggleStatus = useCallback(async (d: Discount) => {
    try {
      await discountsApi.update(d.id, { status: d.status === 'Active' ? 'Expired' : 'Active' });
      fetchDiscounts();
    } catch (err: any) {
      alert('Update failed: ' + (err?.response?.data?.message || err.message));
    }
  }, []);

  // 1. Memoize Data to prevent infinite re-renders!
  const memoizedDiscounts = useMemo(() => discounts, [discounts]);

  const discountColumnHelper = createColumnHelper<Discount>();
  const discountColumns = useMemo(() => [
    discountColumnHelper.accessor('code', {
      header: 'Code',
      cell: info => <span className="text-[12px] font-mono text-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.1)] px-2 py-1 rounded-sm">{info.getValue()}</span>
    }),
    discountColumnHelper.accessor('type', {
      header: 'Type',
      cell: info => <span className="text-[10px] font-sans text-[rgba(var(--theme-text-rgb),0.5)]">{info.getValue()}</span>
    }),
    discountColumnHelper.display({
      id: 'value',
      header: 'Value',
      cell: info => {
        const d = info.row.original;
        return <span className="text-[11px] font-mono text-[var(--theme-text)]">{d.type === 'Percentage' ? `${d.value}%` : formatVal(d.value)}</span>
      }
    }),
    discountColumnHelper.display({
      id: 'usage',
      header: 'Usage',
      cell: info => {
        const d = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 max-w-[80px] bg-[var(--theme-bg)] rounded-full h-1.5">
              <div
                className="bg-[var(--theme-accent)] h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (d.usage.used / d.usage.limit) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-[rgba(var(--theme-text-rgb),0.4)]">{d.usage.used}/{d.usage.limit}</span>
          </div>
        );
      }
    }),
    discountColumnHelper.accessor('expiry', {
      header: 'Expiry',
      cell: info => <span className="text-[10px] font-sans text-[rgba(var(--theme-text-rgb),0.5)]">{info.getValue() ? new Date(info.getValue()!).toLocaleDateString('en-IN') : '—'}</span>
    }),
    discountColumnHelper.accessor('status', {
      header: 'Status',
      cell: info => <Badge label={info.getValue()} variant={info.getValue() as any} />
    }),
    discountColumnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: info => {
        const d = info.row.original;
        return (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => toggleStatus(d)}
              className={`p-1.5 transition-colors border rounded-sm ${d.status === 'Active' ? 'text-[var(--theme-accent)] border-[rgba(var(--theme-accent-rgb),0.2)] hover:border-[rgba(var(--theme-accent-rgb),0.4)]' : 'text-[rgba(var(--theme-text-rgb),0.3)] border-[rgba(var(--theme-text-rgb),0.1)] hover:border-[rgba(var(--theme-text-rgb),0.2)]'}`}
              title={d.status === 'Active' ? 'Deactivate' : 'Activate'}
            >
              {d.status === 'Active' ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
            </button>
            <button onClick={() => openEdit(d)} className="p-1.5 text-[rgba(var(--theme-text-rgb),0.3)] hover:text-[var(--theme-accent)] transition-colors border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm hover:border-[rgba(var(--theme-accent-rgb),0.3)]">
              <Edit2 size={12} />
            </button>
            <button onClick={() => handleDelete(d.id)} className="p-1.5 text-[rgba(var(--theme-text-rgb),0.3)] hover:text-red-400 transition-colors border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm hover:border-red-900/30">
              <Trash2 size={12} />
            </button>
          </div>
        );
      }
    })
  ], [toggleStatus, openEdit, handleDelete]);

  const table = useReactTable({
    data: memoizedDiscounts,
    columns: discountColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.id,
  });

  return (
    <div>
      <SectionHeader title="Discounts & Coupons" action="New Coupon" onAction={openAdd} />
      <p className="text-[11px] text-[rgba(var(--theme-text-rgb),0.4)] font-sans mb-5">Create coupon codes for promotions and customer loyalty programs.</p>

      {error && (
        <div className="mb-4 p-3 text-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.1)] border border-[rgba(var(--theme-accent-rgb),0.2)] text-[11px] font-sans rounded-sm flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-[rgba(var(--theme-text-rgb),0.1)] text-[9px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)] bg-[rgba(var(--theme-bg-rgb),0.5)]">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-4 font-normal">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-10 text-center text-[11px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)] animate-pulse">Loading...</td></tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={7} className="p-10 text-center text-[11px] font-sans text-[rgba(var(--theme-text-rgb),0.3)]">No coupons yet. Click "New Coupon" to create one.</td></tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-b border-[rgba(var(--theme-text-rgb),0.05)] hover:bg-[rgba(var(--theme-bg-rgb),0.4)] transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className={cell.column.id === 'actions' ? 'p-4 text-right' : 'p-4'}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
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
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[var(--theme-accent)] text-[var(--theme-bg)] text-[10px] uppercase tracking-[0.2em] font-sans rounded-sm hover:brightness-110 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                <Save size={12} /> {saving ? 'Saving...' : editingDiscount ? 'Save Changes' : 'Create Coupon'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-[rgba(var(--theme-text-rgb),0.1)] text-[10px] uppercase tracking-[0.2em] font-sans text-[rgba(var(--theme-text-rgb),0.5)] rounded-sm hover:border-[rgba(var(--theme-text-rgb),0.2)] transition-colors">
                Cancel
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Analysis (Demand Insights) ──────────────────────────────────────────────

export function AnalysisSection() {
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await analysisApi.summary();
      setSummary(data);
    } catch (err: any) {
      setError('Could not load demand analytics. Make sure the backend is reachable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []);

  const productImage = (p: { images: string[] } | null) => p?.images?.[0] || '';

  if (loading) {
    return (
      <div>
        <SectionHeader title="Analysis" />
        <p className="text-[11px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)] animate-pulse text-center p-16">Loading demand insights...</p>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Analysis" />
      <p className="text-[11px] text-[rgba(var(--theme-text-rgb),0.4)] font-sans mb-6">
        Demand signals across the catalog — units ordered, plus "notify me" signups on items people wanted but couldn't buy.
      </p>

      {error && (
        <div className="mb-5 p-3 text-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.1)] border border-[rgba(var(--theme-accent-rgb),0.2)] text-[11px] font-sans rounded-sm flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {summary && (
        <>
          <div className="bg-[var(--theme-surface)] border border-[rgba(var(--theme-accent-rgb),0.2)] rounded-sm p-5 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Bell size={14} className="text-[var(--theme-accent)]" />
              <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)]">Unfulfilled Demand — Restock Priority</p>
            </div>
            <p className="text-[10px] text-[rgba(var(--theme-text-rgb),0.4)] font-sans mb-4">Out of stock right now, with active "notify me" signups. These are the clearest restocking candidates.</p>
            {summary.unfulfilledDemand.length === 0 ? (
              <p className="text-[11px] font-sans text-[rgba(var(--theme-text-rgb),0.3)] py-6 text-center">No unfulfilled demand right now — nothing out of stock has active notify signups.</p>
            ) : (
              <div className="space-y-2">
                {summary.unfulfilledDemand.map((item) => (
                  <div key={item.product?._id} className="flex items-center gap-3 bg-[var(--theme-bg)] border border-[rgba(var(--theme-text-rgb),0.05)] rounded-sm p-3">
                    <div className="w-10 h-10 bg-[var(--theme-surface)] rounded-sm overflow-hidden flex-shrink-0 border border-[rgba(var(--theme-text-rgb),0.1)]">
                      {productImage(item.product) && <img src={productImage(item.product)} alt={item.product?.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-sans text-[var(--theme-text)] truncate">{item.product?.name || 'Unknown product'}</p>
                      <p className="text-[9px] font-sans text-[rgba(var(--theme-text-rgb),0.4)]">{item.product?.category} / {item.product?.subcategory}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--theme-accent)] flex-shrink-0">
                      <Bell size={12} />
                      <span className="text-[12px] font-mono">{item.notifyCounter}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={14} className="text-[var(--theme-accent)]" />
                <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)]">Top Products Overall</p>
              </div>
              {summary.topOverall.length === 0 ? (
                <p className="text-[11px] font-sans text-[rgba(var(--theme-text-rgb),0.3)] py-6 text-center">No demand data yet.</p>
              ) : (
                <div className="space-y-2">
                  {summary.topOverall.map((item, i) => (
                    <div key={item.product?._id} className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-[rgba(var(--theme-text-rgb),0.25)] w-4">{i + 1}</span>
                      <div className="w-8 h-8 bg-[var(--theme-surface)] rounded-sm overflow-hidden flex-shrink-0 border border-[rgba(var(--theme-text-rgb),0.1)]">
                        {productImage(item.product) && <img src={productImage(item.product)} alt={item.product?.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-sans text-[var(--theme-text)] truncate">{item.product?.name || 'Unknown product'}</p>
                      </div>
                      <div className="flex items-center gap-3 text-[9px] font-mono text-[rgba(var(--theme-text-rgb),0.4)] flex-shrink-0">
                        <span title="Units ordered">{item.demandCounter} sold</span>
                        {item.notifyCounter > 0 && <span className="text-[var(--theme-accent)]" title="Notify-me signups">{item.notifyCounter} waiting</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={14} className="text-[var(--theme-accent)]" />
                <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)]">Demand by Category</p>
              </div>
              {summary.byCategory.length === 0 ? (
                <p className="text-[11px] font-sans text-[rgba(var(--theme-text-rgb),0.3)] py-6 text-center">No demand data yet.</p>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const maxScore = Math.max(...summary.byCategory.map(c => c.combinedScore), 1);
                    return summary.byCategory.map((cat) => (
                      <div key={cat._id}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] uppercase tracking-wider font-sans text-[rgba(var(--theme-text-rgb),0.7)]">{cat._id || 'Uncategorized'}</span>
                          <span className="text-[9px] font-mono text-[rgba(var(--theme-text-rgb),0.4)]">{cat.productCount} product{cat.productCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-[var(--theme-bg)] rounded-full h-1.5">
                            <div className="bg-[var(--theme-accent)] h-full rounded-full transition-all" style={{ width: `${(cat.combinedScore / maxScore) * 100}%` }} />
                          </div>
                          <span className="text-[9px] font-mono text-[rgba(var(--theme-text-rgb),0.5)] w-16 text-right">{cat.totalDemand} sold / {cat.totalNotify} waiting</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}