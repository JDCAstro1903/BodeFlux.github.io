import { ClipboardList, Truck, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, RefreshCw, Package } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { providerOrderApi, type ProviderOrderAPI } from '../services/api';

type StatusFilter = 'all' | 'pending' | 'sent' | 'received' | 'cancelled';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  sent: 'Enviado',
  received: 'Recibido',
  cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: typeof Clock }> = {
  pending: { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', icon: Clock },
  sent: { bg: 'bg-[#0071E3]/10', text: 'text-[#0071E3]', icon: Truck },
  received: { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', icon: CheckCircle },
  cancelled: { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]', icon: XCircle },
};

const NEXT_STATUS: Record<string, string | null> = {
  pending: 'sent',
  sent: 'received',
  received: null,
  cancelled: null,
};

const NEXT_STATUS_LABEL: Record<string, string> = {
  pending: 'Marcar Enviado',
  sent: 'Marcar Recibido',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function ProviderOrders() {
  const [orders, setOrders] = useState<ProviderOrderAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    providerOrderApi
      .list()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleAdvanceStatus = async (order: ProviderOrderAPI) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setUpdatingId(order.id);
    try {
      const updated = await providerOrderApi.update(order.id, { status: next });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (order: ProviderOrderAPI) => {
    if (!confirm('¿Cancelar este pedido?')) return;
    setUpdatingId(order.id);
    try {
      const updated = await providerOrderApi.update(order.id, { status: 'cancelled' });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    sent: orders.filter((o) => o.status === 'sent').length,
    received: orders.filter((o) => o.status === 'received').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1B4332' }}>
            Pedidos a Proveedores
          </h1>
          <p style={{ fontSize: '15px', color: '#6B7280', fontWeight: '400', marginTop: '4px' }}>
            Historial y seguimiento de solicitudes de reabastecimiento
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-3 rounded-[16px] bg-white/75 backdrop-blur-xl border border-white/50 hover:shadow-md transition-all flex items-center gap-2"
          style={{ fontSize: '13px', fontWeight: '600', color: '#1B4332', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total pedidos', value: stats.total, color: '#1B4332', bg: 'from-[#1B4332]/5 to-[#2D6A4F]/5' },
          { label: 'Pendientes', value: stats.pending, color: '#F59E0B', bg: 'from-[#F59E0B]/10 to-[#F59E0B]/5' },
          { label: 'En camino', value: stats.sent, color: '#0071E3', bg: 'from-[#0071E3]/10 to-[#0071E3]/5' },
          { label: 'Recibidos', value: stats.received, color: '#10B981', bg: 'from-[#10B981]/10 to-[#10B981]/5' },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-[20px] bg-gradient-to-br ${s.bg} p-5 bg-white/75 backdrop-blur-xl`}
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
          >
            <div style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'pending', 'sent', 'received', 'cancelled'] as StatusFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full transition-all ${
              filter === f
                ? 'bg-[#1B4332] text-white shadow-md'
                : 'bg-white/75 text-[#6B7280] hover:bg-white border border-white/50'
            }`}
            style={{ fontSize: '13px', fontWeight: '500' }}
          >
            {f === 'all' ? 'Todos' : STATUS_LABELS[f]}
            {f !== 'all' && (
              <span
                className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  filter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {orders.filter((o) => o.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-[24px] bg-white/75 backdrop-blur-xl p-12 text-center"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        >
          <div className="w-16 h-16 rounded-full bg-[#1B4332]/10 flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={28} className="text-[#1B4332]/40" />
          </div>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#1B4332' }}>
            {filter === 'all' ? 'Aún no hay pedidos registrados' : `No hay pedidos ${STATUS_LABELS[filter].toLowerCase()}s`}
          </p>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '6px' }}>
            Usa el catálogo de productos para solicitar reabastecimiento a proveedores.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const statusStyle = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending;
            const StatusIcon = statusStyle.icon;
            const isExpanded = expandedId === order.id;
            const nextStatus = NEXT_STATUS[order.status];
            const isUpdating = updatingId === order.id;

            return (
              <div
                key={order.id}
                className="rounded-[20px] bg-white/75 backdrop-blur-xl border border-white/50 overflow-hidden transition-all"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
              >
                {/* Order header row */}
                <div className="p-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                      {/* Order icon */}
                      <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#1B4332]/10 to-[#0071E3]/10 flex items-center justify-center flex-shrink-0">
                        <Truck size={20} className="text-[#1B4332]" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span style={{ fontSize: '15px', fontWeight: '600', color: '#1B4332' }}>
                            Pedido #{String(order.id).padStart(4, '0')}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text} flex items-center gap-1`}
                            style={{ fontSize: '11px', fontWeight: '600' }}
                          >
                            <StatusIcon size={11} />
                            {STATUS_LABELS[order.status]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span style={{ fontSize: '12px', color: '#6B7280' }}>
                            {formatDate(order.created_at)}
                          </span>
                          <span style={{ fontSize: '12px', color: '#6B7280' }}>•</span>
                          {order.provider_name ? (
                            <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>
                              {order.provider_name}
                            </span>
                          ) : (
                            <span
                              className="px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#B45309]"
                              style={{ fontSize: '11px', fontWeight: '500' }}
                              title="Asigna un proveedor a los productos en Gestión de Proveedores"
                            >
                              ⚠️ Sin proveedor
                            </span>
                          )}
                          <span style={{ fontSize: '12px', color: '#6B7280' }}>•</span>
                          <span style={{ fontSize: '12px', color: '#6B7280' }}>
                            {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {nextStatus && (
                        <button
                          onClick={() => handleAdvanceStatus(order)}
                          disabled={isUpdating}
                          className="px-3 py-2 rounded-[10px] bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white hover:shadow-md transition-all disabled:opacity-50"
                          style={{ fontSize: '12px', fontWeight: '600' }}
                        >
                          {isUpdating ? '...' : NEXT_STATUS_LABEL[order.status]}
                        </button>
                      )}
                      {(order.status === 'pending' || order.status === 'sent') && (
                        <button
                          onClick={() => handleCancel(order)}
                          disabled={isUpdating}
                          className="px-3 py-2 rounded-[10px] bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-all disabled:opacity-50"
                          style={{ fontSize: '12px', fontWeight: '600' }}
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
                      >
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-[#6B7280]" />
                        ) : (
                          <ChevronDown size={16} className="text-[#6B7280]" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded items */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Productos solicitados
                    </p>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-[12px] bg-[#F9FAFB] px-4 py-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-[8px] bg-[#1B4332]/10 flex items-center justify-center">
                              <Package size={14} className="text-[#1B4332]" />
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#1B4332' }}>
                              {item.product_name}
                            </span>
                          </div>
                          <span
                            className="px-3 py-1 rounded-full bg-[#0071E3]/10"
                            style={{ fontSize: '13px', fontWeight: '600', color: '#0071E3' }}
                          >
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                    {order.notes && (
                      <div className="mt-3 px-4 py-3 rounded-[12px] bg-[#F59E0B]/5 border border-[#F59E0B]/20">
                        <p style={{ fontSize: '12px', color: '#92400E' }}>
                          <span style={{ fontWeight: '600' }}>Notas: </span>
                          {order.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
