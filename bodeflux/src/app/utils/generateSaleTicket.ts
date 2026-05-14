import { jsPDF } from 'jspdf';
import type { SaleResponseAPI } from '../services/api';

export function generateSaleTicket(sale: SaleResponseAPI): void {
  const doc = new jsPDF({ format: 'a5', unit: 'mm', orientation: 'portrait' });
  const pageW = 148;
  const margin = 12;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ── Header band ────────────────────────────────────────────
  doc.setFillColor(27, 67, 50);
  doc.rect(0, 0, pageW, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('AgroStack', pageW / 2, 12, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gestion Agricola  -  Ticket de Venta', pageW / 2, 21, { align: 'center' });

  y = 36;

  // ── Folio + Date ───────────────────────────────────────────
  const date = sale.created_at ? new Date(sale.created_at) : new Date();
  const dateStr = date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + '  ' + date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Folio: #${String(sale.id).padStart(5, '0')}`, margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(dateStr, pageW - margin, y, { align: 'right' });

  y += 7;

  // ── Customer box ───────────────────────────────────────────
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(margin, y - 3.5, contentW, 10, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text('CLIENTE', margin + 4, y + 0.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(27, 67, 50);
  const customerLabel = sale.customer_name || 'Consumidor Final';
  doc.text(customerLabel, margin + 4, y + 5.5);

  y += 14;

  // ── Divider ────────────────────────────────────────────────
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 5;

  // ── Items table header ─────────────────────────────────────
  doc.setFillColor(230, 230, 230);
  doc.rect(margin, y - 3, contentW, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);

  const col1 = margin + 2;
  const col2 = margin + contentW * 0.56;
  const col3 = margin + contentW * 0.74;
  const col4 = pageW - margin - 1;

  doc.text('PRODUCTO', col1, y + 1);
  doc.text('CANT.', col2, y + 1, { align: 'right' });
  doc.text('P.UNIT', col3, y + 1, { align: 'right' });
  doc.text('TOTAL', col4, y + 1, { align: 'right' });

  y += 7;

  // ── Items ──────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  for (const item of sale.items) {
    doc.setTextColor(25, 25, 25);
    const name =
      item.product_name.length > 28
        ? item.product_name.substring(0, 26) + '...'
        : item.product_name;

    doc.text(name, col1, y);
    doc.text(String(item.quantity), col2, y, { align: 'right' });
    doc.text(`$${item.unit_price.toFixed(2)}`, col3, y, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(`$${item.total_price.toFixed(2)}`, col4, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += 5.5;

    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.2);
    doc.line(margin, y - 1.5, pageW - margin, y - 1.5);
  }

  y += 2;

  // ── Totals ─────────────────────────────────────────────────
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  y += 5;

  const totalsX = pageW - margin - 44;

  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  doc.setFont('helvetica', 'normal');

  doc.text('Subtotal:', totalsX, y);
  doc.text(`$${sale.subtotal.toFixed(2)}`, col4, y, { align: 'right' });
  y += 5;

  doc.text('IVA (16%):', totalsX, y);
  doc.text(`$${sale.tax.toFixed(2)}`, col4, y, { align: 'right' });
  y += 5;

  // Total banner
  const bannerX = totalsX - 4;
  const bannerW = pageW - margin - bannerX;
  doc.setFillColor(27, 67, 50);
  doc.roundedRect(bannerX, y - 4, bannerW, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL', bannerX + 4, y + 2.5);
  doc.text(`$${sale.total.toFixed(2)}`, col4, y + 2.5, { align: 'right' });

  y += 16;

  // ── Status badge ───────────────────────────────────────────
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(margin, y - 3.5, 28, 7, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('PAGADO', margin + 14, y + 0.5, { align: 'center' });

  // ── Footer ─────────────────────────────────────────────────
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(170, 170, 170);
  doc.text('Gracias por su compra!', pageW / 2, y + 12, { align: 'center' });
  const genDate = new Date();
  const genStr = genDate.toLocaleDateString('es-MX') + '  ' + genDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  doc.text(`Generado el ${genStr}`, pageW / 2, y + 17, { align: 'center' });

  doc.save(`ticket-venta-${String(sale.id).padStart(5, '0')}.pdf`);
}

