import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, User as UserIcon, Package, MapPin, Plus, Edit2, Trash2,
  CheckCircle2, Truck, Clock, XCircle, Save, X as XIcon, Sparkles, Ban, CalendarClock,
} from 'lucide-react';
import { useAuth } from './hooks/UseAuth';
import { usersApi, Address } from './api/users';
import { ordersApi, Order } from './api/orders';
import { tryonApi, TryonResult } from './api/tryon';
import { formatSoftToySize } from './utils/sizeFormatter';


const formatVal = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const emptyAddress: Address = { label: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India', is_default: false };

// The order lifecycle a tracking card visualizes. "payment_pending" and
// "cancelled" are handled separately since they aren't steps along this line.
const TRACK_STEPS: { key: Order['order_status']; label: string; icon: React.ReactNode }[] = [
  { key: 'placed', label: 'Placed', icon: <Clock size={14} /> },
  { key: 'processing', label: 'Processing', icon: <Package size={14} /> },
  { key: 'shipped', label: 'Shipped', icon: <Truck size={14} /> },
  { key: 'delivered', label: 'Delivered', icon: <CheckCircle2 size={14} /> },
];

// Self-serve cancellation is only offered for paid online orders, within
// 24 hours of placement, and before the order has shipped. The backend
// re-checks all of this — this is just what decides whether to show the
// button at all.
const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000;
function canCancelOrder(order: Order): boolean {
  if (order.payment_method !== 'online') return false;
  if (order.payment_status !== 'paid') return false;
  if (!['placed', 'processing'].includes(order.order_status)) return false;
  const elapsed = Date.now() - new Date(order.created_at).getTime();
  return elapsed <= CANCELLATION_WINDOW_MS;
}

function OrderTrackingCard({ order, onCancelled }: { order: Order; onCancelled: (updated: Order) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const isCancelled = order.order_status === 'cancelled';
  const isAwaitingPayment = order.order_status === 'payment_pending';
  const currentIndex = TRACK_STEPS.findIndex(s => s.key === order.order_status);

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Cancel this order? This cannot be undone.')) return;
    setCancelling(true);
    setCancelError('');
    try {
      const updated = await ordersApi.cancel(order.id);
      onCancelled(updated);
    } catch (err: any) {
      setCancelError(err?.response?.data?.message || err.message || 'Could not cancel this order.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm overflow-hidden">
      <button onClick={() => setExpanded(e => !e)} className="w-full p-5 flex items-center justify-between text-left hover:bg-[var(--theme-bg)] transition-colors">
        <div>
          <p className="text-[11px] font-mono text-[var(--theme-text)]">Order #{order.id.slice(-8).toUpperCase()}</p>
          <p className="text-[10px] font-sans text-[rgba(var(--theme-text-rgb),0.6)] mt-1">{formatDate(order.created_at)} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="text-right">
          <p className="text-[12px] font-mono text-[var(--theme-accent)]">{formatVal(order.total)}</p>
          <p className="text-[9px] uppercase tracking-wider font-sans text-[rgba(var(--theme-text-rgb),0.6)] mt-1">{expanded ? 'Hide details' : 'View details'}</p>
        </div>
      </button>

      {/* Tracking progress */}
      <div className="px-5 pb-5">
        {isCancelled ? (
          <div className="flex items-center gap-2 text-[11px] font-sans text-red-500 bg-red-500/10 border border-red-500/30 rounded-sm px-3 py-2">
            <XCircle size={14} /> This order was cancelled.
          </div>
        ) : isAwaitingPayment ? (
          <div className="flex items-center gap-2 text-[11px] font-sans text-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.1)] border border-[rgba(var(--theme-accent-rgb),0.3)] rounded-sm px-3 py-2">
            <Clock size={14} /> Awaiting payment confirmation — this order will be placed once payment succeeds.
          </div>
        ) : (
          <div className="flex items-center">
            {TRACK_STEPS.map((step, i) => (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${i <= currentIndex ? 'bg-[var(--theme-accent)] border-[var(--theme-accent)] text-[var(--theme-bg)]' : 'border-[rgba(var(--theme-text-rgb),0.15)] text-[rgba(var(--theme-text-rgb),0.4)]'}`}>
                    {step.icon}
                  </div>
                  <span className={`text-[8px] uppercase tracking-wider font-sans ${i <= currentIndex ? 'text-[var(--theme-accent)]' : 'text-[rgba(var(--theme-text-rgb),0.4)]'}`}>{step.label}</span>
                </div>
                {i < TRACK_STEPS.length - 1 && (
                  <div className={`flex-1 h-[1px] mx-1 mb-4 ${i < currentIndex ? 'bg-[var(--theme-accent)]' : 'bg-[rgba(var(--theme-text-rgb),0.1)]'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {!isCancelled && order.order_status !== 'delivered' && order.expected_delivery_date && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-sans text-[rgba(var(--theme-text-rgb),0.6)]">
            <CalendarClock size={12} className="text-[var(--theme-accent)]" />
            <span>Expected delivery by <span className="text-[var(--theme-text)]">{formatDate(order.expected_delivery_date)}</span></span>
          </div>
        )}

        {canCancelOrder(order) && (
          <div className="mt-4">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-sans text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-colors px-3 py-1.5 rounded-sm disabled:opacity-50"
            >
              <Ban size={12} /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
            <p className="text-[9px] font-sans text-[rgba(var(--theme-text-rgb),0.4)] mt-1.5">Cancellable within 24 hours of placement.</p>
            {cancelError && <p className="text-[10px] font-sans text-red-500 mt-1.5">{cancelError}</p>}
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-[rgba(var(--theme-text-rgb),0.1)]"
          >
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)] mb-2">Items</p>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] font-sans text-[rgba(var(--theme-text-rgb),0.8)]">
                      <span>{item.name} {item.size ? `(${formatSoftToySize(item.size)})` : ''} × {item.quantity}</span>
                      <span className="font-mono">{formatVal(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-[rgba(var(--theme-text-rgb),0.1)] space-y-1 text-[10px] font-sans text-[rgba(var(--theme-text-rgb),0.6)]">
                  <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{formatVal(order.subtotal)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span className="font-mono">{order.shipping_fee === 0 ? 'Free' : formatVal(order.shipping_fee)}</span></div>
                  {order.handling_fee > 0 && (
                    <div className="flex justify-between"><span>Handling Charge (COD)</span><span className="font-mono">{formatVal(order.handling_fee)}</span></div>
                  )}
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-[var(--theme-accent)]"><span>Discount {order.discount_code ? `(${order.discount_code})` : ''}</span><span className="font-mono">−{formatVal(order.discount_amount)}</span></div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)] mb-2">Shipping Address</p>
                <p className="text-[11px] font-sans text-[rgba(var(--theme-text-rgb),0.8)]">
                  {[order.shipping_address.line1, order.shipping_address.line2, order.shipping_address.city, order.shipping_address.state, order.shipping_address.postal_code, order.shipping_address.country].filter(Boolean).join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-sans text-[rgba(var(--theme-text-rgb),0.6)] pt-2 border-t border-[rgba(var(--theme-text-rgb),0.1)]">
                <span>Payment: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</span>
                <span>·</span>
                <span className="capitalize">{order.payment_status}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'profile' | 'orders' | 'tryons'>('profile');

  useEffect(() => {
    if (!authLoading && user === null) navigate('/');
  }, [user, authLoading, navigate]);

  // ── Profile form ──────────────────────────────────────────────────────────
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addresses, setAddresses] = useState<Address[]>(user?.addresses || []);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [editingAddrIdx, setEditingAddrIdx] = useState<number | null>(null);
  const [addrForm, setAddrForm] = useState<Address>(emptyAddress);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddresses(user.addresses || []);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await usersApi.updateMe({ name, phone, addresses });
      await refreshUser();
      setSaveMsg('Profile updated.');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err: any) {
      setSaveMsg(err?.response?.data?.message || err.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const openAddAddress = () => { setEditingAddrIdx(null); setAddrForm(emptyAddress); setAddrModalOpen(true); };
  const openEditAddress = (idx: number) => { setEditingAddrIdx(idx); setAddrForm(addresses[idx]); setAddrModalOpen(true); };

  const saveAddress = () => {
    if (!addrForm.line1.trim() || !addrForm.city.trim() || !addrForm.postal_code.trim()) return;
    setAddresses(prev => {
      const next = [...prev];
      if (editingAddrIdx !== null) next[editingAddrIdx] = addrForm;
      else next.push(addrForm);
      return next;
    });
    setAddrModalOpen(false);
  };

  const removeAddress = (idx: number) => {
    setAddresses(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Orders ────────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (tab !== 'orders' || !user) return;
    setOrdersLoading(true);
    setOrdersError('');
    ordersApi.list({ limit: 50 })
      .then(({ data }) => setOrders(data))
      .catch(() => setOrdersError('Could not load your orders. Please try again.'))
      .finally(() => setOrdersLoading(false));
  }, [tab, user]);

  // ── Try-Ons ───────────────────────────────────────────────────────────────
  const [tryons, setTryons] = useState<TryonResult[]>([]);
  const [tryonsLoading, setTryonsLoading] = useState(true);
  const [tryonsError, setTryonsError] = useState('');

  useEffect(() => {
    if (tab !== 'tryons' || !user) return;
    setTryonsLoading(true);
    setTryonsError('');
    tryonApi.history({ limit: 50 })
      .then(({ data }) => setTryons(data))
      .catch(() => setTryonsError('Could not load your try-on history. Please try again.'))
      .finally(() => setTryonsLoading(false));
  }, [tab, user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--theme-bg)] flex items-center justify-center">
        <div className="text-[var(--theme-accent)] animate-pulse text-[11px] uppercase tracking-[0.2em] font-plex-mono">Loading...</div>
      </div>
    );
  }

  const inputCls = "w-full bg-[var(--theme-bg)] border border-[rgba(var(--theme-text-rgb),0.2)] px-4 py-2.5 text-[12px] font-sans text-[var(--theme-text)] placeholder:text-[rgba(var(--theme-text-rgb),0.4)] focus:border-[var(--theme-accent)] focus:outline-none rounded-sm transition-colors";

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans pt-[140px] pb-24">
      {/* Back button wrapper - aligned with navbar/page edge */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-10">
        <button onClick={() => navigate('/')} className="flex items-center text-[10px] uppercase font-plex-mono tracking-[0.2em] text-[rgba(var(--theme-text-rgb),0.6)] hover:text-[var(--theme-accent)] transition-colors">
          <ChevronLeft size={16} className="mr-2" /> Back to Home
        </button>
      </div>

      <div className="max-w-[900px] mx-auto px-6">
        <h1 className="text-[13px] uppercase tracking-[0.3em] font-plex-mono text-[var(--theme-accent)] mb-2">My Account</h1>
        <p className="text-[12px] font-sans text-[rgba(var(--theme-text-rgb),0.6)] mb-8">{user.name} · {user.email}</p>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-[rgba(var(--theme-text-rgb),0.1)] mb-8">
          <button
            onClick={() => setTab('profile')}
            className={`pb-3 text-[10px] uppercase tracking-[0.2em] font-plex-mono flex items-center gap-2 border-b-2 transition-colors ${tab === 'profile' ? 'text-[var(--theme-accent)] border-[var(--theme-accent)]' : 'text-[rgba(var(--theme-text-rgb),0.5)] border-transparent hover:text-[var(--theme-text)]'}`}
          >
            <UserIcon size={13} /> Profile
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`pb-3 text-[10px] uppercase tracking-[0.2em] font-plex-mono flex items-center gap-2 border-b-2 transition-colors ${tab === 'orders' ? 'text-[var(--theme-accent)] border-[var(--theme-accent)]' : 'text-[rgba(var(--theme-text-rgb),0.5)] border-transparent hover:text-[var(--theme-text)]'}`}
          >
            <Package size={13} /> Orders
          </button>
          <button
            onClick={() => setTab('tryons')}
            className={`pb-3 text-[10px] uppercase tracking-[0.2em] font-plex-mono flex items-center gap-2 border-b-2 transition-colors ${tab === 'tryons' ? 'text-[var(--theme-accent)] border-[var(--theme-accent)]' : 'text-[rgba(var(--theme-text-rgb),0.5)] border-transparent hover:text-[var(--theme-text)]'}`}
          >
            <Sparkles size={13} /> Try-Ons
          </button>
        </div>

        {tab === 'profile' ? (
          <div className="space-y-8">
            <div className="bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] font-plex-mono text-[var(--theme-accent)] mb-5">Personal Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[9px] uppercase tracking-wider font-sans text-[rgba(var(--theme-text-rgb),0.6)] mb-1.5 block">Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider font-sans text-[rgba(var(--theme-text-rgb),0.6)] mb-1.5 block">Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="10-digit mobile number" />
                </div>
              </div>
              <div className="mb-2">
                <label className="text-[9px] uppercase tracking-wider font-sans text-[rgba(var(--theme-text-rgb),0.6)] mb-1.5 block">Email</label>
                <input value={user.email} disabled className={`${inputCls} opacity-50 cursor-not-allowed`} />
              </div>
              {saveMsg && <p className="text-[10px] font-sans text-[var(--theme-accent)] mt-3">{saveMsg}</p>}
              <button onClick={handleSaveProfile} disabled={saving} className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-accent)] text-[var(--theme-bg)] text-[10px] uppercase tracking-[0.2em] font-sans rounded-sm hover:opacity-80 transition-opacity disabled:opacity-50">
                <Save size={12} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] uppercase tracking-[0.2em] font-plex-mono text-[var(--theme-accent)] flex items-center gap-2"><MapPin size={13} /> Saved Addresses</p>
                <button onClick={openAddAddress} className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-sans text-[var(--theme-accent)] hover:opacity-80 transition-opacity">
                  <Plus size={12} /> Add Address
                </button>
              </div>
              {addresses.length === 0 ? (
                <p className="text-[11px] font-sans text-[rgba(var(--theme-text-rgb),0.5)]">No saved addresses yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr, idx) => (
                    <div key={idx} className="border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm p-4 relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-wider font-sans text-[var(--theme-accent)]">{addr.label || 'Address'} {addr.is_default && '· Default'}</span>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEditAddress(idx)} className="text-[rgba(var(--theme-text-rgb),0.4)] hover:text-[var(--theme-accent)] transition-colors"><Edit2 size={11} /></button>
                          <button onClick={() => removeAddress(idx)} className="text-[rgba(var(--theme-text-rgb),0.4)] hover:text-red-500 transition-colors"><Trash2 size={11} /></button>
                        </div>
                      </div>
                      <p className="text-[11px] font-sans text-[rgba(var(--theme-text-rgb),0.8)] leading-relaxed">
                        {[addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[9px] font-sans text-[rgba(var(--theme-text-rgb),0.4)] mt-4">Address changes are saved together with "Save Changes" above.</p>
            </div>
          </div>
        ) : tab === 'orders' ? (
          <div className="space-y-4">
            {ordersError && (
              <p className="text-[11px] font-sans text-red-500 bg-red-500/10 border border-red-500/30 rounded-sm px-4 py-3">{ordersError}</p>
            )}
            {ordersLoading ? (
              <p className="text-[11px] uppercase tracking-[0.2em] font-plex-mono text-[var(--theme-accent)] animate-pulse text-center py-16">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[12px] font-sans text-[rgba(var(--theme-text-rgb),0.6)] mb-4">You haven't placed any orders yet.</p>
                <button onClick={() => navigate('/')} className="text-[10px] uppercase tracking-[0.2em] font-plex-mono text-[var(--theme-accent)] hover:opacity-80 transition-opacity">Start Shopping</button>
              </div>
            ) : (
              orders.map(order => (
                <OrderTrackingCard
                  key={order.id}
                  order={order}
                  onCancelled={updated => setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))}
                />
              ))
            )}
          </div>
        ) : (
          <div>
            {tryonsError && (
              <p className="text-[11px] font-sans text-red-500 bg-red-500/10 border border-red-500/30 rounded-sm px-4 py-3 mb-4">{tryonsError}</p>
            )}
            {tryonsLoading ? (
              <p className="text-[11px] uppercase tracking-[0.2em] font-plex-mono text-[var(--theme-accent)] animate-pulse text-center py-16">Loading try-ons...</p>
            ) : tryons.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[12px] font-sans text-[rgba(var(--theme-text-rgb),0.6)] mb-4">You haven't generated any try-ons yet.</p>
                <button onClick={() => navigate('/')} className="text-[10px] uppercase tracking-[0.2em] font-plex-mono text-[var(--theme-accent)] hover:opacity-80 transition-opacity">Browse Products</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {tryons.filter(t => t.status === 'completed' && t.imageUrl).map(t => {
                  const productInfo = typeof t.product === 'object' ? t.product : null;
                  return (
                    <div key={t.id} className="bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm overflow-hidden group">
                      <div className="aspect-[3/4] bg-[var(--theme-surface)] overflow-hidden">
                        <img src={t.imageUrl} alt={productInfo?.name || 'Try-on result'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] font-sans text-[var(--theme-text)] truncate">{productInfo?.name || 'Product'}</p>
                        <p className="text-[9px] font-sans text-[rgba(var(--theme-text-rgb),0.5)] mt-0.5">{formatDate(t.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Address Modal */}
      <AnimatePresence>
        {addrModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            onClick={() => setAddrModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              onClick={e => e.stopPropagation()}
              className="bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <p className="text-[11px] uppercase tracking-[0.2em] font-plex-mono text-[var(--theme-accent)]">{editingAddrIdx !== null ? 'Edit Address' : 'Add Address'}</p>
                <button onClick={() => setAddrModalOpen(false)} className="text-[rgba(var(--theme-text-rgb),0.4)] hover:text-[var(--theme-text)] transition-colors"><XIcon size={16} /></button>
              </div>
              <div className="space-y-3">
                <input value={addrForm.label || ''} onChange={e => setAddrForm(f => ({ ...f, label: e.target.value }))} placeholder="Label (e.g. Home, Work)" className={inputCls} />
                <input value={addrForm.line1} onChange={e => setAddrForm(f => ({ ...f, line1: e.target.value }))} placeholder="Address line 1 *" className={inputCls} />
                <input value={addrForm.line2 || ''} onChange={e => setAddrForm(f => ({ ...f, line2: e.target.value }))} placeholder="Address line 2" className={inputCls} />
                <div className="grid grid-cols-2 gap-3">
                  <input value={addrForm.city} onChange={e => setAddrForm(f => ({ ...f, city: e.target.value }))} placeholder="City *" className={inputCls} />
                  <input value={addrForm.state || ''} onChange={e => setAddrForm(f => ({ ...f, state: e.target.value }))} placeholder="State" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={addrForm.postal_code} onChange={e => setAddrForm(f => ({ ...f, postal_code: e.target.value }))} placeholder="Postal code *" className={inputCls} />
                  <input value={addrForm.country} onChange={e => setAddrForm(f => ({ ...f, country: e.target.value }))} placeholder="Country" className={inputCls} />
                </div>
                <label className="flex items-center gap-2 text-[10px] font-sans text-[rgba(var(--theme-text-rgb),0.7)] pt-1 cursor-pointer">
                  <input type="checkbox" checked={!!addrForm.is_default} onChange={e => setAddrForm(f => ({ ...f, is_default: e.target.checked }))} className="accent-[var(--theme-accent)]" />
                  Set as default address
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={saveAddress} className="flex-1 py-2.5 bg-[var(--theme-accent)] text-[var(--theme-bg)] text-[10px] uppercase tracking-[0.2em] font-sans rounded-sm hover:opacity-80 transition-opacity">
                  {editingAddrIdx !== null ? 'Save Address' : 'Add Address'}
                </button>
                <button onClick={() => setAddrModalOpen(false)} className="px-4 py-2.5 border border-[rgba(var(--theme-text-rgb),0.2)] text-[10px] uppercase tracking-[0.2em] font-sans text-[rgba(var(--theme-text-rgb),0.7)] rounded-sm hover:border-[rgba(var(--theme-text-rgb),0.4)] transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}