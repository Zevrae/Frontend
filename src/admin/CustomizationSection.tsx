import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Upload, Save, X, RefreshCw, Palette } from 'lucide-react';
import { customizableGarmentsApi, CustomizableGarment, GarmentColor } from '../api/customization';

// ─── Shared styling, mirrored from AdminSections.tsx so this file stays
// visually consistent without needing those (unexported) helpers ──────────
const baseInputCls =
  'bg-[var(--theme-bg)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm px-3 text-[12px] text-[var(--theme-text)] font-mono placeholder:text-[rgba(var(--theme-text-rgb),0.2)] focus:outline-none focus:border-[rgba(var(--theme-accent-rgb),0.4)] transition-colors';
const inputCls = `w-full py-2.5 ${baseInputCls}`;
const selectCls = `${inputCls} cursor-pointer`;

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

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[10px] uppercase tracking-[0.15em] font-sans text-[rgba(var(--theme-text-rgb),0.5)] mb-2">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8" onClick={onClose}>
      <div
        className="bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm w-full max-w-2xl max-h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(var(--theme-text-rgb),0.1)] flex-shrink-0">
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)]">{title}</h3>
          <button onClick={onClose} className="text-[rgba(var(--theme-text-rgb),0.4)] hover:text-[var(--theme-text)] transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto" data-lenis-prevent>{children}</div>
      </div>
    </div>
  );
}

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

type GarmentForm = {
  cloth_type: string;
  label: string;
  price: number;
  sizes: string[];
  print_areas: {
    front: { left: number; top: number; width: number; height: number };
    back: { left: number; top: number; width: number; height: number };
  };
  status: 'active' | 'inactive';
};

const emptyGarmentForm = (): GarmentForm => ({
  cloth_type: '',
  label: '',
  price: 0,
  sizes: ['S', 'M', 'L', 'XL'],
  print_areas: {
    front: { left: 0.29, top: 0.24, width: 0.42, height: 0.42 },
    back: { left: 0.29, top: 0.22, width: 0.42, height: 0.42 },
  },
  status: 'active',
});

const formatVal = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export function CustomizationSection() {
  const [garments, setGarments] = useState<CustomizableGarment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showGarmentModal, setShowGarmentModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GarmentForm>(emptyGarmentForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [colorsGarmentId, setColorsGarmentId] = useState<string | null>(null);

  const fetchGarments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await customizableGarmentsApi.list();
      setGarments(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Could not load customizable garment stock.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGarments(); }, [fetchGarments]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyGarmentForm());
    setFormError('');
    setShowGarmentModal(true);
  };

  const openEdit = (g: CustomizableGarment) => {
    setEditingId(g.id);
    setForm({
      cloth_type: g.cloth_type,
      label: g.label,
      price: g.price,
      sizes: g.sizes,
      print_areas: g.print_areas,
      status: g.status,
    });
    setFormError('');
    setShowGarmentModal(true);
  };

  const toggleSize = (s: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s],
    }));
  };

  const validate = (): string | null => {
    if (!editingId && !/^[a-z0-9-]+$/.test(form.cloth_type.trim())) {
      return 'Cloth type id must be lowercase letters, numbers, and hyphens only (e.g. "tshirt").';
    }
    if (!form.label.trim()) return 'Label is required.';
    if (!form.price || form.price <= 0) return 'Price must be greater than 0.';
    if (form.sizes.length === 0) return 'Select at least one size.';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setFormError(err); return; }
    setFormError('');
    setSaving(true);
    try {
      if (editingId) {
        await customizableGarmentsApi.update(editingId, {
          label: form.label,
          price: form.price,
          sizes: form.sizes,
          print_areas: form.print_areas,
          status: form.status,
        });
      } else {
        await customizableGarmentsApi.create({
          cloth_type: form.cloth_type.trim().toLowerCase(),
          label: form.label,
          price: form.price,
          sizes: form.sizes,
          print_areas: form.print_areas,
          status: form.status,
        });
      }
      setShowGarmentModal(false);
      fetchGarments();
    } catch (e: any) {
      setFormError(e?.response?.data?.message || e.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cloth type and all of its color/stock data? This cannot be undone.')) return;
    try {
      await customizableGarmentsApi.remove(id);
      fetchGarments();
    } catch (e: any) {
      alert('Delete failed: ' + (e?.response?.data?.message || e.message));
    }
  };

  const colorsGarment = garments.find((g) => g.id === colorsGarmentId) || null;

  return (
    <div>
      <SectionHeader title="Customization Stock" action="Add Cloth Type" onAction={openAdd} />
      <p className="text-[11px] text-[rgba(var(--theme-text-rgb),0.4)] font-sans mb-6 max-w-2xl">
        Manage the blank garments customers can design on the "Customize" page — cloth types, colors, per-size
        stock, template photography, and the print-area each design gets placed inside.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 text-[11px] font-sans text-red-400 bg-red-900/10 border border-red-900/30 rounded-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-[11px] text-[rgba(var(--theme-text-rgb),0.4)] font-sans">
          <RefreshCw size={12} className="animate-spin" /> Loading...
        </div>
      ) : garments.length === 0 ? (
        <div className="text-[11px] text-[rgba(var(--theme-text-rgb),0.4)] font-sans">
          No cloth types yet — add one to enable the Customize page.
        </div>
      ) : (
        <div className="border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[rgba(var(--theme-text-rgb),0.1)] bg-[var(--theme-surface)]">
                {['Cloth Type', 'Price', 'Sizes', 'Colors', 'Total Stock', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-[9px] uppercase tracking-[0.15em] font-sans text-[rgba(var(--theme-text-rgb),0.4)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {garments.map((g) => {
                const totalStock = g.colors.reduce(
                  (sum, c) => sum + Object.values(c.size_stock).reduce((a, b) => a + (b || 0), 0),
                  0,
                );
                return (
                  <tr key={g.id} className="border-b border-[rgba(var(--theme-text-rgb),0.06)] last:border-0">
                    <td className="px-4 py-3 text-[11px] font-sans text-[var(--theme-text)]">{g.label}</td>
                    <td className="px-4 py-3 text-[11px] font-mono text-[var(--theme-text)]">{formatVal(g.price)}</td>
                    <td className="px-4 py-3 text-[10px] font-sans text-[rgba(var(--theme-text-rgb),0.5)]">{g.sizes.join(', ')}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {g.colors.map((c) => (
                          <span key={c.id} title={c.label} className="w-4 h-4 rounded-full border border-[rgba(var(--theme-text-rgb),0.2)]" style={{ background: c.hex }} />
                        ))}
                        {g.colors.length === 0 && <span className="text-[10px] text-[rgba(var(--theme-text-rgb),0.3)] font-sans">None</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] font-mono text-[var(--theme-text)]">{totalStock}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-sans rounded-sm border ${g.status === 'active' ? 'bg-emerald-900/25 text-emerald-400 border-emerald-900/40' : 'bg-[var(--theme-surface)] text-[rgba(var(--theme-text-rgb),0.4)] border-[rgba(var(--theme-text-rgb),0.1)]'}`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setColorsGarmentId(g.id)}
                          className="p-1.5 text-[rgba(var(--theme-text-rgb),0.4)] hover:text-[var(--theme-accent)] transition-colors border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm hover:border-[rgba(var(--theme-accent-rgb),0.3)]"
                          title="Manage colors & stock"
                        >
                          <Palette size={12} />
                        </button>
                        <button
                          onClick={() => openEdit(g)}
                          className="p-1.5 text-[rgba(var(--theme-text-rgb),0.4)] hover:text-[var(--theme-accent)] transition-colors border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm hover:border-[rgba(var(--theme-accent-rgb),0.3)]"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(g.id)}
                          className="p-1.5 text-[rgba(var(--theme-text-rgb),0.4)] hover:text-red-400 transition-colors border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm hover:border-red-900/50"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showGarmentModal && (
        <Modal title={editingId ? 'Edit Cloth Type' : 'Add Cloth Type'} onClose={() => setShowGarmentModal(false)}>
          {formError && (
            <div className="mb-4 px-3 py-2 text-[11px] font-sans text-red-400 bg-red-900/10 border border-red-900/30 rounded-sm">{formError}</div>
          )}

          <FormField label="Cloth Type Id (slug)">
            <input
              className={inputCls}
              value={form.cloth_type}
              disabled={!!editingId}
              onChange={(e) => setForm((f) => ({ ...f, cloth_type: e.target.value }))}
              placeholder="tshirt"
            />
          </FormField>
          <FormField label="Label">
            <input className={inputCls} value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="T-Shirt" />
          </FormField>
          <FormField label="Price (₹, charged per generated design)">
            <input
              type="number"
              className={inputCls}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: parseInt(e.target.value, 10) || 0 }))}
            />
          </FormField>
          <FormField label="Available Sizes">
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className={`px-3 py-1.5 text-[11px] font-mono rounded-sm border transition-colors ${
                    form.sizes.includes(s)
                      ? 'bg-[var(--theme-accent)] text-[var(--theme-bg)] border-[var(--theme-accent)]'
                      : 'bg-[var(--theme-bg)] text-[rgba(var(--theme-text-rgb),0.5)] border-[rgba(var(--theme-text-rgb),0.15)]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </FormField>

          {(['front', 'back'] as const).map((view) => (
            <FormField key={view} label={`Print Area — ${view} (fraction of stage, 0–1)`}>
              <div className="grid grid-cols-4 gap-2">
                {(['left', 'top', 'width', 'height'] as const).map((k) => (
                  <div key={k}>
                    <span className="block text-[8px] uppercase text-[rgba(var(--theme-text-rgb),0.4)] font-sans mb-1">{k}</span>
                    <input
                      type="number"
                      step={0.01}
                      min={0}
                      max={1}
                      className={inputCls}
                      value={form.print_areas[view][k]}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          print_areas: {
                            ...f.print_areas,
                            [view]: { ...f.print_areas[view], [k]: parseFloat(e.target.value) || 0 },
                          },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </FormField>
          ))}

          <FormField label="Status">
            <select className={selectCls} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 text-[11px] uppercase tracking-[0.15em] font-sans bg-[var(--theme-accent)] text-[var(--theme-bg)] hover:brightness-110 transition-colors rounded-sm disabled:opacity-50"
          >
            <Save size={13} />
            {saving ? 'Saving…' : 'Save Cloth Type'}
          </button>
        </Modal>
      )}

      {colorsGarment && (
        <ColorsModal garment={colorsGarment} onClose={() => setColorsGarmentId(null)} onChanged={fetchGarments} />
      )}
    </div>
  );
}

// ─── Colors & stock modal ──────────────────────────────────────────────────

function ColorsModal({ garment, onClose, onChanged }: { garment: CustomizableGarment; onClose: () => void; onChanged: () => void }) {
  const [newColor, setNewColor] = useState({ id: '', label: '', hex: '#111111' });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [busyColorId, setBusyColorId] = useState<string | null>(null);
  const [localStock, setLocalStock] = useState<Record<string, Record<string, number>>>(
    Object.fromEntries(garment.colors.map((c) => [c.id, { ...c.size_stock }])),
  );

  const setStockValue = (colorId: string, size: string, qty: number) => {
    setLocalStock((prev) => ({ ...prev, [colorId]: { ...prev[colorId], [size]: qty } }));
  };

  const handleAddColor = async () => {
    if (!/^[a-z0-9-]+$/.test(newColor.id.trim())) {
      setAddError('Color id must be lowercase letters, numbers, and hyphens only (e.g. "black").');
      return;
    }
    if (!newColor.label.trim()) {
      setAddError('Color label is required.');
      return;
    }
    setAddError('');
    setAdding(true);
    try {
      await customizableGarmentsApi.addColor(garment.id, {
        id: newColor.id.trim().toLowerCase(),
        label: newColor.label,
        hex: newColor.hex,
        size_stock: Object.fromEntries(garment.sizes.map((s) => [s, 0])),
      });
      setNewColor({ id: '', label: '', hex: '#111111' });
      onChanged();
    } catch (e: any) {
      setAddError(e?.response?.data?.message || e.message || 'Could not add color.');
    } finally {
      setAdding(false);
    }
  };

  const handleSaveColor = async (color: GarmentColor) => {
    setBusyColorId(color.id);
    try {
      await customizableGarmentsApi.updateColor(garment.id, color.id, {
        label: color.label,
        hex: color.hex,
        size_stock: localStock[color.id] || {},
      });
      onChanged();
    } catch (e: any) {
      alert('Could not save: ' + (e?.response?.data?.message || e.message));
    } finally {
      setBusyColorId(null);
    }
  };

  const handleDeleteColor = async (colorId: string) => {
    if (!confirm('Remove this color and its stock?')) return;
    setBusyColorId(colorId);
    try {
      await customizableGarmentsApi.removeColor(garment.id, colorId);
      onChanged();
    } catch (e: any) {
      alert('Delete failed: ' + (e?.response?.data?.message || e.message));
    } finally {
      setBusyColorId(null);
    }
  };

  const handleUploadImage = async (colorId: string, view: 'front' | 'back', file: File) => {
    setBusyColorId(colorId);
    try {
      await customizableGarmentsApi.uploadColorImages(garment.id, colorId, { [view]: file });
      onChanged();
    } catch (e: any) {
      alert('Image upload failed: ' + (e?.response?.data?.message || e.message));
    } finally {
      setBusyColorId(null);
    }
  };

  return (
    <Modal title={`Colors & Stock — ${garment.label}`} onClose={onClose}>
      <div className="space-y-6">
        {garment.colors.map((color) => (
          <div key={color.id} className="border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-6 rounded-full border border-[rgba(var(--theme-text-rgb),0.2)] flex-shrink-0" style={{ background: color.hex }} />
              <input
                className={`${baseInputCls} flex-1 py-2`}
                defaultValue={color.label}
                onChange={(e) => { color.label = e.target.value; }}
                placeholder="Color label"
              />
              <input
                type="color"
                defaultValue={color.hex}
                onChange={(e) => { color.hex = e.target.value; }}
                className="w-9 h-9 rounded-sm border border-[rgba(var(--theme-text-rgb),0.15)] bg-transparent cursor-pointer"
              />
              <button
                onClick={() => handleDeleteColor(color.id)}
                disabled={busyColorId === color.id}
                className="p-2 text-[rgba(var(--theme-text-rgb),0.4)] hover:text-red-400 transition-colors border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm hover:border-red-900/50"
              >
                <Trash2 size={12} />
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mb-3">
              {(['front', 'back'] as const).map((view) => (
                <div key={view} className="flex items-center gap-2">
                  {color.images[view] ? (
                    <img src={color.images[view]!} alt={`${color.label} ${view}`} className="w-10 h-12 object-cover rounded-sm border border-[rgba(var(--theme-text-rgb),0.1)]" />
                  ) : (
                    <div className="w-10 h-12 flex items-center justify-center rounded-sm border border-dashed border-[rgba(var(--theme-text-rgb),0.2)] text-[8px] text-[rgba(var(--theme-text-rgb),0.3)] font-sans text-center">
                      No {view}
                    </div>
                  )}
                  <label className="flex items-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-[0.1em] font-sans border border-[rgba(var(--theme-text-rgb),0.15)] rounded-sm cursor-pointer hover:border-[rgba(var(--theme-accent-rgb),0.4)] hover:text-[var(--theme-accent)] transition-colors">
                    <Upload size={11} />
                    {view}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadImage(color.id, view, file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
              {garment.sizes.map((size) => (
                <div key={size}>
                  <span className="block text-[8px] uppercase text-[rgba(var(--theme-text-rgb),0.4)] font-sans mb-1">{size}</span>
                  <input
                    type="number"
                    min={0}
                    className={`${baseInputCls} w-full py-2`}
                    value={localStock[color.id]?.[size] ?? 0}
                    onChange={(e) => setStockValue(color.id, size, parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSaveColor(color)}
              disabled={busyColorId === color.id}
              className="flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-[0.15em] font-sans bg-[var(--theme-accent)] text-[var(--theme-bg)] hover:brightness-110 transition-colors rounded-sm disabled:opacity-50"
            >
              <Save size={12} />
              {busyColorId === color.id ? 'Saving…' : 'Save Color'}
            </button>
          </div>
        ))}

        <div className="border border-dashed border-[rgba(var(--theme-text-rgb),0.2)] rounded-sm p-4">
          <p className="text-[10px] uppercase tracking-[0.15em] font-sans text-[rgba(var(--theme-text-rgb),0.5)] mb-3">Add a color</p>
          {addError && <div className="mb-3 px-3 py-2 text-[11px] font-sans text-red-400 bg-red-900/10 border border-red-900/30 rounded-sm">{addError}</div>}
          <div className="flex flex-wrap gap-2 items-center">
            <input
              className={`${baseInputCls} py-2 w-28`}
              placeholder="id (black)"
              value={newColor.id}
              onChange={(e) => setNewColor((c) => ({ ...c, id: e.target.value }))}
            />
            <input
              className={`${baseInputCls} py-2 flex-1 min-w-[120px]`}
              placeholder="Label (Black)"
              value={newColor.label}
              onChange={(e) => setNewColor((c) => ({ ...c, label: e.target.value }))}
            />
            <input
              type="color"
              value={newColor.hex}
              onChange={(e) => setNewColor((c) => ({ ...c, hex: e.target.value }))}
              className="w-9 h-9 rounded-sm border border-[rgba(var(--theme-text-rgb),0.15)] bg-transparent cursor-pointer"
            />
            <button
              onClick={handleAddColor}
              disabled={adding}
              className="flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-[0.15em] font-sans bg-[var(--theme-accent)] text-[var(--theme-bg)] hover:brightness-110 transition-colors rounded-sm disabled:opacity-50"
            >
              <Plus size={12} />
              Add
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
