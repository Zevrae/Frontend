import { jsPDF } from 'jspdf';
import { Order } from '../api/orders';

/**
 * Generates and immediately downloads a ZEVRAE receipt PDF for the given order.
 *
 * @param order          - The completed order object.
 * @param paymentMethod  - Human-readable payment method string (e.g. "Cash on Delivery").
 *                         Derived automatically from order.payment_method when not supplied.
 */
export function generateReceiptPdf(order: Order, paymentMethod?: string): void {
  const resolvedPaymentMethod =
    paymentMethod ??
    (order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment');

  // Size the receipt to fit the content: base height + per-item rows
  // +25mm accounts for the CUSTOMER DETAILS section (heading + up to 3 rows + separators)
  const baseHeight = 155;
  const itemHeight = order.items.length * 9;
  const totalHeight = baseHeight + itemHeight;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, totalHeight],
  });

  // ── Header ──────────────────────────────────────────────────────────────────
  let y = 12;
  doc.setFont('Courier', 'bold');
  doc.setFontSize(10);
  doc.text('ZEVRAE', 40, y, { align: 'center' });
  y += 4;

  doc.setFont('Courier', 'normal');
  doc.setFontSize(8);
  doc.text('LUXURY APPAREL', 40, y, { align: 'center' });
  y += 5;
  doc.text('========================================', 40, y, { align: 'center' });
  y += 5;

  // ── Order meta ──────────────────────────────────────────────────────────────
  doc.text(`ORDER   : #${order.id.slice(-8).toUpperCase()}`, 8, y);
  y += 4;
  doc.text(`DATE    : ${new Date(order.created_at).toLocaleString('en-IN')}`, 8, y);
  y += 4;
  doc.text(`PAYMENT : ${resolvedPaymentMethod}`, 8, y);
  y += 5;
  doc.text('----------------------------------------', 40, y, { align: 'center' });
  y += 4;

  // ── Customer Details ─────────────────────────────────────────────────────────
  doc.setFont('Courier', 'bold');
  doc.text('CUSTOMER DETAILS', 8, y);
  doc.setFont('Courier', 'normal');
  y += 4;
  doc.text('----------------------------------------', 40, y, { align: 'center' });
  y += 4;

  const customerName =
    typeof order.user === 'object' && order.user !== null
      ? order.user.name || ''
      : '';
  const phone = order.shipping_address?.phone || '';
  const addrParts = [
    order.shipping_address?.line1,
    order.shipping_address?.line2,
    order.shipping_address?.city,
    order.shipping_address?.state,
    order.shipping_address?.postal_code,
    order.shipping_address?.country,
  ]
    .filter(Boolean)
    .join(', ');

  if (customerName) {
    doc.text(`NAME    : ${customerName}`, 8, y);
    y += 4;
  }
  if (phone) {
    doc.text(`PHONE   : ${phone}`, 8, y);
    y += 4;
  }
  if (addrParts) {
    // Wrap long addresses within the 64mm text column of an 80mm roll
    const addrLines = doc.splitTextToSize('ADDRESS : ' + addrParts, 64);
    addrLines.forEach((line: string, i: number) => {
      // Indent continuation lines so values stay aligned
      doc.text(i === 0 ? line : '          ' + line.trim(), 8, y);
      y += 4;
    });
  }

  y += 1;
  doc.text('----------------------------------------', 40, y, { align: 'center' });
  y += 4;

  // ── Items ────────────────────────────────────────────────────────────────────
  doc.setFont('Courier', 'bold');
  doc.text('ITEMS', 8, y);
  doc.setFont('Courier', 'normal');
  y += 4;
  doc.text('----------------------------------------', 40, y, { align: 'center' });
  y += 5;

  order.items.forEach((item) => {
    const name = item.name.toUpperCase();
    const truncatedName = name.length > 25 ? name.substring(0, 22) + '...' : name;
    const qtyPrice = `${item.quantity} x Rs.${item.price.toLocaleString('en-IN')}${
      item.size ? ' [Size: ' + item.size + ']' : ''
    }`;
    const totalItemVal = `Rs.${(item.price * item.quantity).toLocaleString('en-IN')}`;

    doc.setFont('Courier', 'bold');
    doc.text(truncatedName, 8, y);
    doc.setFont('Courier', 'normal');
    y += 4;
    doc.text(qtyPrice, 10, y);
    doc.text(totalItemVal, 72, y, { align: 'right' });
    y += 5;
  });

  doc.text('----------------------------------------', 40, y, { align: 'center' });
  y += 5;

  // ── Totals ───────────────────────────────────────────────────────────────────
  doc.text('SUBTOTAL:', 8, y);
  doc.text(
    `Rs.${order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    72,
    y,
    { align: 'right' },
  );
  y += 4;

  doc.text('SHIPPING:', 8, y);
  doc.text(
    order.shipping_fee === 0
      ? 'FREE'
      : `Rs.${order.shipping_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    72,
    y,
    { align: 'right' },
  );
  y += 4;

  if (order.handling_fee > 0) {
    doc.text('HANDLING (COD):', 8, y);
    doc.text(
      `Rs.${order.handling_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      72,
      y,
      { align: 'right' },
    );
    y += 4;
  }

  if (order.discount_code && order.discount_amount > 0) {
    doc.text(`DISCOUNT (${order.discount_code}):`, 8, y);
    doc.text(
      `-Rs.${order.discount_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      72,
      y,
      { align: 'right' },
    );
    y += 4;
  }

  doc.text('========================================', 40, y, { align: 'center' });
  y += 5;

  doc.setFont('Courier', 'bold');
  doc.text('TOTAL:', 8, y);
  doc.text(
    `Rs.${order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    72,
    y,
    { align: 'right' },
  );
  doc.setFont('Courier', 'normal');
  y += 5;
  doc.text('========================================', 40, y, { align: 'center' });
  y += 6;

  // ── Footer ───────────────────────────────────────────────────────────────────
  doc.text('Thank you for shopping with ZEVRAE', 40, y, { align: 'center' });

  doc.save(`ZEVRAE-Receipt-${order.id.slice(-8).toUpperCase()}.pdf`);
}
