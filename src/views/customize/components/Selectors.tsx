import type { CustomizableGarment, GarmentColor } from '../../../api/customization';
import { MAX_QTY_PER_SIZE } from '../../../CartContext';

export function StepLabel({ children }: { children: React.ReactNode }) {
  return <p className="step-label">{children}</p>;
}

export function ClothTypeSelector({
  garments,
  value,
  onChange,
  variant = 'buttons',
}: {
  garments: CustomizableGarment[];
  value: string;
  onChange: (clothType: string) => void;
  variant?: 'buttons' | 'dropdown';
}) {
  if (variant === 'dropdown') {
    return (
      <select
        className="cloth-dropdown"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Choose the cloth type"
      >
        {garments.map((g) => (
          <option key={g.cloth_type} value={g.cloth_type}>
            {g.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="cloth-grid">
      {garments.map((g) => (
        <button
          key={g.cloth_type}
          type="button"
          className={'cloth-btn' + (value === g.cloth_type ? ' active' : '')}
          onClick={() => onChange(g.cloth_type)}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}

export function ColorSelector({
  colors,
  value,
  onChange,
}: {
  colors: GarmentColor[];
  value: string;
  onChange: (colorId: string) => void;
}) {
  return (
    <div className="swatches">
      {colors.map((c) => (
        <button
          key={c.id}
          type="button"
          className={'swatch' + (value === c.id ? ' active' : '')}
          style={{ background: c.hex }}
          title={c.label}
          aria-label={c.label}
          onClick={() => onChange(c.id)}
        />
      ))}
    </div>
  );
}

export function SizeSelector({
  sizes,
  sizeStock,
  size,
  quantity,
  onSizeChange,
  onQuantityChange,
}: {
  sizes: string[];
  sizeStock: Record<string, number>;
  size: string | null;
  quantity: number;
  onSizeChange: (size: string) => void;
  onQuantityChange: (quantity: number) => void;
}) {
  // Cart enforces a hard cap of MAX_QTY_PER_SIZE per product+size — cap the
  // stepper at whichever is lower so "Generate" never produces a quantity
  // the cart would refuse to add in full.
  const maxQty = size ? Math.min(sizeStock[size] ?? 0, MAX_QTY_PER_SIZE) : 0;

  return (
    <div>
      <div className="size-grid">
        {sizes.map((s) => {
          const count = sizeStock[s] ?? 0;
          const outOfStock = count <= 0;
          return (
            <button
              key={s}
              type="button"
              disabled={outOfStock}
              className={'size-btn' + (size === s ? ' active' : '') + (outOfStock ? ' disabled' : '')}
              onClick={() => onSizeChange(s)}
              title={outOfStock ? `${s} — out of stock` : `${s} — ${count} in stock`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {size && (
        <div className="qty-row">
          <span className="qty-label">Quantity</span>
          <div className="qty-stepper">
            <button type="button" onClick={() => onQuantityChange(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
              −
            </button>
            <span>{quantity}</span>
            <button type="button" onClick={() => onQuantityChange(Math.min(maxQty, quantity + 1))} disabled={quantity >= maxQty}>
              +
            </button>
          </div>
          <span className="qty-stock">{maxQty} available to order</span>
        </div>
      )}
    </div>
  );
}
