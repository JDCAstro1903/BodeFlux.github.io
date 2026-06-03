import { X, Download, Receipt, CheckCircle } from 'lucide-react';
import type { SaleResponseAPI } from '../services/api';
import { generateSaleTicket } from '../utils/generateSaleTicket';

interface SaleTicketPreviewProps {
  sale: SaleResponseAPI | null;
  onClose: () => void;
}

export function SaleTicketPreview({ sale, onClose }: SaleTicketPreviewProps) {
  if (!sale) return null;

  const date = sale.created_at ? new Date(sale.created_at) : new Date();
  const dateStr = date.toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' });

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] w-full max-w-[420px] max-h-[92vh] flex flex-col overflow-hidden"
        style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.35)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1B4332]/10 flex items-center justify-center">
              <Receipt size={16} className="text-[#1B4332]" />
            </div>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#1B4332' }}>
              Vista Previa del Ticket
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
          >
            <X size={15} className="text-gray-600" />
          </button>
        </div>

        {/* Scrollable ticket area */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Ticket paper */}
          <div
            className="rounded-[16px] overflow-hidden border border-gray-200"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
          >
            {/* Header band */}
            <div className="bg-[#1B4332] px-6 py-5 text-center">
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>
                BodeFlux
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '3px' }}>
                Sistema de Gestion Agricola · Ticket de Venta
              </div>
            </div>

            <div className="px-5 py-4 space-y-4 bg-white">
              {/* Folio + Date row */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Folio
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#1B4332' }}>
                    #{String(sale.id).padStart(5, '0')}
                  </div>
                </div>
                <div className="text-right">
                  <div style={{ fontSize: '10px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Fecha
                  </div>
                  <div style={{ fontSize: '11px', color: '#374151', marginTop: '2px' }}>{dateStr}</div>
                </div>
              </div>

              {/* Customer */}
              <div
                className="rounded-[12px] px-4 py-3"
                style={{ background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)', border: '1px solid #BBF7D0' }}
              >
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                  Cliente
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#1B4332' }}>
                  {sale.customer_name || 'Consumidor Final'}
                </div>
              </div>

              {/* Items table */}
              <div>
                {/* Column headers */}
                <div
                  className="grid gap-1 pb-2 border-b border-gray-200"
                  style={{ gridTemplateColumns: '1fr 40px 60px 64px', fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  <span>Producto</span>
                  <span className="text-center">Cant.</span>
                  <span className="text-right">P.Unit</span>
                  <span className="text-right">Total</span>
                </div>

                {/* Items */}
                {sale.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-1 py-2.5 border-b border-gray-50 last:border-0 items-center"
                    style={{ gridTemplateColumns: '1fr 40px 60px 64px' }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#1F2937' }}>
                      {item.product_name}
                    </div>
                    <div className="text-center" style={{ fontSize: '13px', color: '#6B7280' }}>
                      {item.quantity}
                    </div>
                    <div className="text-right" style={{ fontSize: '12px', color: '#6B7280' }}>
                      ${item.unit_price.toFixed(2)}
                    </div>
                    <div className="text-right" style={{ fontSize: '13px', fontWeight: '700', color: '#1B4332' }}>
                      ${item.total_price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals block */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center" style={{ fontSize: '13px', color: '#6B7280' }}>
                  <span>Subtotal</span>
                  <span>${sale.subtotal.toFixed(2)}</span>
                </div>
                {sale.discount_amount > 0 && (
                  <div className="flex justify-between items-center" style={{ fontSize: '13px', color: '#10B981', fontWeight: '500' }}>
                    <span>Descuento {sale.discount_type === 'percentage' ? `(${sale.discount_value}%)` : ''}</span>
                    <span>-${sale.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center" style={{ fontSize: '13px', color: '#6B7280' }}>
                  <span>IVA (16%)</span>
                  <span>${sale.tax.toFixed(2)}</span>
                </div>
                <div
                  className="flex justify-between items-center rounded-[10px] px-4 py-3 mt-1"
                  style={{ background: '#1B4332', fontSize: '16px', fontWeight: '800', color: 'white' }}
                >
                  <span>TOTAL</span>
                  <span>${sale.total.toFixed(2)}</span>
                </div>
              </div>

              {/* PAGADO badge */}
              <div className="flex items-center justify-center gap-2 py-1">
                <span
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full"
                  style={{ background: '#DCFCE7', fontSize: '12px', fontWeight: '700', color: '#15803D' }}
                >
                  <CheckCircle size={13} />
                  PAGADO
                </span>
              </div>

              {/* Footer */}
              <div
                className="text-center border-t border-dashed border-gray-200 pt-3"
                style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic' }}
              >
                ¡Gracias por su compra!
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-[14px] bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
            style={{ fontSize: '14px', fontWeight: '600' }}
          >
            Cerrar
          </button>
          <button
            onClick={() => generateSaleTicket(sale)}
            className="flex-1 py-3 rounded-[14px] bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
            style={{ fontSize: '14px', fontWeight: '600' }}
          >
            <Download size={16} />
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
