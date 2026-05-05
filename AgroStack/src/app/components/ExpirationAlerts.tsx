import { AlertTriangle, AlertCircle, CheckCircle, ArrowRight, XCircle, Package, X } from 'lucide-react';
import { useState } from 'react';
import { useInventory, InventoryItemWithAlert } from '../contexts/InventoryContext';
import { useTheme } from '../contexts/ThemeContext';

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function PrioritizeModal({
  item,
  onConfirm,
  onClose,
  isDark,
}: {
  item: InventoryItemWithAlert;
  onConfirm: () => void;
  onClose: () => void;
  isDark: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-[#1C1C1E] rounded-[28px] max-w-md w-full p-6"
        style={{ boxShadow: '0 20px 80px rgba(0,0,0,0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#EF4444] flex items-center justify-center">
              <ArrowRight size={22} className="text-white" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: isDark ? '#F9FAFB' : '#1B4332' }}>
                Priorizar Salida
              </h3>
              <p style={{ fontSize: '12px', color: '#6B7280' }}>Producto crítico</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#2C2C2E] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#3A3A3C] transition-all"
          >
            <X size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Item info */}
        <div className="p-4 rounded-[16px] bg-[#EF4444]/8 dark:bg-[#EF4444]/10 border border-[#EF4444]/20 mb-5">
          <div style={{ fontSize: '16px', fontWeight: '600', color: isDark ? '#FCA5A5' : '#DC2626', marginBottom: '6px' }}>
            {item.productName}
          </div>
          <div className="flex flex-wrap gap-3" style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
            <span>Lote: <strong className={isDark ? 'text-gray-200' : 'text-gray-800'}>{item.lotNumber}</strong></span>
            <span>•</span>
            <span>Cantidad: <strong className={isDark ? 'text-gray-200' : 'text-gray-800'}>{item.quantity} {item.unit}</strong></span>
            <span>•</span>
            <span>Vence: <strong style={{ color: '#EF4444' }}>{formatDate(item.expiryDate)}</strong></span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#EF4444' }}>
              {item.daysLeft < 0 ? 'VENCIDO' : `${item.daysLeft} días restantes`}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '14px', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '20px', lineHeight: '1.6' }}>
          Al confirmar, este producto quedará marcado como <strong>salida registrada</strong> y será retirado del inventario activo. Esta acción no se puede deshacer.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-[14px] bg-gray-100 dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3A3A3C] transition-all"
            style={{ fontSize: '15px', fontWeight: '600' }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-[14px] bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white hover:shadow-lg transition-all"
            style={{ fontSize: '15px', fontWeight: '600' }}
          >
            Confirmar Salida
          </button>
        </div>
      </div>
    </div>
  );
}

function AlertCard({
  item,
  color,
  onPrioritize,
}: {
  item: InventoryItemWithAlert;
  color: 'red' | 'yellow' | 'green';
  onPrioritize?: (item: InventoryItemWithAlert) => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colorMap = {
    red: {
      bg: 'bg-gradient-to-br from-[#EF4444]/10 to-[#EF4444]/5 dark:from-[#EF4444]/15 dark:to-[#EF4444]/5',
      border: 'border-2 border-[#EF4444]/30',
      badge: '#EF4444',
      badgeBg: isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)',
      days: '#EF4444',
      daysSub: isDark ? '#FCA5A5' : '#DC2626',
      divider: 'border-[#EF4444]/20',
      btn: 'bg-[#EF4444] hover:bg-[#DC2626]',
    },
    yellow: {
      bg: 'bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 dark:from-[#F59E0B]/15 dark:to-[#F59E0B]/5',
      border: 'border border-[#F59E0B]/30',
      badge: '#F59E0B',
      badgeBg: isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.1)',
      days: '#F59E0B',
      daysSub: isDark ? '#FCD34D' : '#D97706',
      divider: 'border-[#F59E0B]/20',
      btn: 'bg-[#F59E0B] hover:bg-[#D97706]',
    },
    green: {
      bg: 'bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/5 dark:from-[#10B981]/15 dark:to-[#10B981]/5',
      border: 'border border-[#10B981]/20',
      badge: '#10B981',
      badgeBg: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)',
      days: '#10B981',
      daysSub: isDark ? '#6EE7B7' : '#059669',
      divider: '',
      btn: '',
    },
  };

  const c = colorMap[color];

  return (
    <div className={`rounded-[20px] ${c.bg} backdrop-blur-sm p-5 ${c.border} hover:shadow-lg transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <div
            style={{ fontSize: '17px', fontWeight: '600', color: isDark ? '#F9FAFB' : '#1B4332', marginBottom: '5px' }}
            className="truncate"
          >
            {item.productName}
          </div>
          <div className="flex flex-wrap items-center gap-2" style={{ fontSize: '12px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
            <span
              className="px-2 py-0.5 rounded-full"
              style={{ fontSize: '11px', fontWeight: '600', color: c.badge, backgroundColor: c.badgeBg }}
            >
              {item.lotNumber || item.id}
            </span>
            <span>•</span>
            <span>{item.quantity} {item.unit}</span>
            {item.location && (
              <>
                <span>•</span>
                <span>{item.location}</span>
              </>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div style={{ fontSize: '28px', fontWeight: '700', color: c.days, lineHeight: 1 }}>
            {item.daysLeft < 0 ? '0' : item.daysLeft}
          </div>
          <div style={{ fontSize: '11px', color: c.daysSub, fontWeight: '500' }}>
            {item.daysLeft < 0 ? 'VENCIDO' : 'días'}
          </div>
        </div>
      </div>

      <div className={`flex items-center justify-between pt-3 ${c.divider ? `border-t ${c.divider}` : ''}`}>
        <div style={{ fontSize: '12px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
          Vence: <span style={{ fontWeight: '600', color: isDark ? '#E5E7EB' : '#1B4332' }}>{formatDate(item.expiryDate)}</span>
        </div>
        {onPrioritize && (
          <button
            onClick={() => onPrioritize(item)}
            className={`px-3 py-1.5 rounded-full ${c.btn} text-white transition-all flex items-center gap-1.5 group hover:shadow-md`}
            style={{ fontSize: '12px', fontWeight: '600' }}
          >
            Priorizar Salida
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}

function EmptySection({ label, color }: { label: string; color: string }) {
  return (
    <div
      className="rounded-[16px] border-2 border-dashed py-8 text-center"
      style={{ borderColor: `${color}40` }}
    >
      <Package size={28} style={{ color: `${color}60`, margin: '0 auto 8px' }} />
      <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Sin productos en esta categoría</p>
    </div>
  );
}

export function ExpirationAlerts() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { criticalItems, warningItems, healthyItems, expiredItems, removeItem } = useInventory();

  const [prioritizeTarget, setPrioritizeTarget] = useState<InventoryItemWithAlert | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const totalActive = criticalItems.length + warningItems.length + healthyItems.length + expiredItems.length;

  const handleConfirmPrioritize = () => {
    if (!prioritizeTarget) return;
    removeItem(prioritizeTarget.id, 'output');
    setSuccessMsg(`"${prioritizeTarget.productName}" registrado como salida correctamente.`);
    setPrioritizeTarget(null);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-[#1B4332] dark:text-[#34D399]"
          style={{ fontSize: '28px', fontWeight: '600' }}
        >
          🚦 El Semáforo
        </h1>
        <p style={{ fontSize: '15px', color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '400', marginTop: '4px' }}>
          Sistema inteligente de alertas de vencimiento
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Expired */}
        <div
          className="rounded-[20px] bg-gradient-to-br from-gray-800/10 to-gray-900/5 dark:from-gray-700/30 dark:to-gray-800/20 p-4 border border-gray-400/20"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        >
          <div style={{ fontSize: '30px', fontWeight: '700', color: isDark ? '#9CA3AF' : '#374151' }}>
            {expiredItems.length}
          </div>
          <div style={{ fontSize: '12px', color: isDark ? '#6B7280' : '#6B7280', fontWeight: '500', marginTop: '2px' }}>
            Vencidos
          </div>
        </div>

        {/* Critical */}
        <div
          className="rounded-[20px] bg-gradient-to-br from-[#EF4444]/10 to-[#EF4444]/5 p-4 border border-[#EF4444]/20"
          style={{ boxShadow: '0 4px 16px rgba(239,68,68,0.1)' }}
        >
          <div style={{ fontSize: '30px', fontWeight: '700', color: '#EF4444' }}>
            {criticalItems.length}
          </div>
          <div style={{ fontSize: '12px', color: isDark ? '#FCA5A5' : '#DC2626', fontWeight: '500', marginTop: '2px' }}>
            Crítico (&lt;15 días)
          </div>
        </div>

        {/* Warning */}
        <div
          className="rounded-[20px] bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 p-4 border border-[#F59E0B]/20"
          style={{ boxShadow: '0 4px 16px rgba(245,158,11,0.1)' }}
        >
          <div style={{ fontSize: '30px', fontWeight: '700', color: '#F59E0B' }}>
            {warningItems.length}
          </div>
          <div style={{ fontSize: '12px', color: isDark ? '#FCD34D' : '#D97706', fontWeight: '500', marginTop: '2px' }}>
            Advertencia (15-30)
          </div>
        </div>

        {/* Healthy */}
        <div
          className="rounded-[20px] bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/5 p-4 border border-[#10B981]/20"
          style={{ boxShadow: '0 4px 16px rgba(16,185,129,0.1)' }}
        >
          <div style={{ fontSize: '30px', fontWeight: '700', color: '#10B981' }}>
            {healthyItems.length}
          </div>
          <div style={{ fontSize: '12px', color: isDark ? '#6EE7B7' : '#059669', fontWeight: '500', marginTop: '2px' }}>
            Saludable (&gt;30 días)
          </div>
        </div>
      </div>

      {/* Empty state when no inventory */}
      {totalActive === 0 && (
        <div
          className="rounded-[24px] bg-white/70 dark:bg-[#1E293B]/70 backdrop-blur-xl p-10 text-center"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
        >
          <div className="text-5xl mb-4">🌾</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: isDark ? '#E5E7EB' : '#1B4332', marginBottom: '8px' }}>
            Sin productos en inventario
          </div>
          <div style={{ fontSize: '14px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
            Registra entradas en <strong>Control de Almacén</strong> para ver el estado de vencimiento aquí.
          </div>
        </div>
      )}

      {totalActive > 0 && (
        <>
          {/* Expired Items */}
          {expiredItems.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-600 dark:bg-gray-700 flex items-center justify-center">
                  <XCircle size={20} className="text-white" />
                </div>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: '600', color: isDark ? '#D1D5DB' : '#374151' }}>
                    Vencidos
                  </h2>
                  <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Deben retirarse inmediatamente</p>
                </div>
                <span className="ml-auto px-3 py-1 rounded-full bg-gray-500/10 text-gray-500 dark:text-gray-400 text-xs font-semibold">
                  {expiredItems.length} productos
                </span>
              </div>
              <div className="space-y-3">
                {expiredItems.map((item) => (
                  <AlertCard key={item.id} item={item} color="red" onPrioritize={setPrioritizeTarget} />
                ))}
              </div>
            </section>
          )}

          {/* Critical Items */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#EF4444] flex items-center justify-center">
                <AlertTriangle size={20} className="text-white" />
              </div>
              <div>
                <h2 style={{ fontSize: '19px', fontWeight: '600', color: isDark ? '#FCA5A5' : '#DC2626' }}>
                  Crítico
                </h2>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Menos de 15 días para vencer</p>
              </div>
              <span className="ml-auto px-3 py-1 rounded-full bg-[#EF4444]/10 text-[#EF4444] text-xs font-semibold">
                {criticalItems.length} productos
              </span>
            </div>
            <div className="space-y-3">
              {criticalItems.length === 0
                ? <EmptySection label="Crítico" color="#EF4444" />
                : criticalItems
                    .sort((a, b) => a.daysLeft - b.daysLeft)
                    .map((item) => (
                      <AlertCard key={item.id} item={item} color="red" onPrioritize={setPrioritizeTarget} />
                    ))}
            </div>
          </section>

          {/* Warning Items */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#F59E0B] flex items-center justify-center">
                <AlertCircle size={20} className="text-white" />
              </div>
              <div>
                <h2 style={{ fontSize: '19px', fontWeight: '600', color: isDark ? '#FCD34D' : '#D97706' }}>
                  Advertencia
                </h2>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Entre 15 y 30 días para vencer</p>
              </div>
              <span className="ml-auto px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-semibold">
                {warningItems.length} productos
              </span>
            </div>
            <div className="space-y-3">
              {warningItems.length === 0
                ? <EmptySection label="Advertencia" color="#F59E0B" />
                : warningItems
                    .sort((a, b) => a.daysLeft - b.daysLeft)
                    .map((item) => (
                      <AlertCard key={item.id} item={item} color="yellow" onPrioritize={setPrioritizeTarget} />
                    ))}
            </div>
          </section>

          {/* Healthy Items */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center">
                <CheckCircle size={20} className="text-white" />
              </div>
              <div>
                <h2 style={{ fontSize: '19px', fontWeight: '600', color: isDark ? '#6EE7B7' : '#059669' }}>
                  Saludable
                </h2>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Más de 30 días para vencer</p>
              </div>
              <span className="ml-auto px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-semibold">
                {healthyItems.length} productos
              </span>
            </div>
            <div className="space-y-3">
              {healthyItems.length === 0
                ? <EmptySection label="Saludable" color="#10B981" />
                : healthyItems
                    .sort((a, b) => a.daysLeft - b.daysLeft)
                    .map((item) => (
                      <AlertCard key={item.id} item={item} color="green" />
                    ))}
            </div>
          </section>
        </>
      )}

      {/* Prioritize Modal */}
      {prioritizeTarget && (
        <PrioritizeModal
          item={prioritizeTarget}
          isDark={isDark}
          onConfirm={handleConfirmPrioritize}
          onClose={() => setPrioritizeTarget(null)}
        />
      )}

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed bottom-24 md:bottom-8 right-6 max-w-sm z-50">
          <div
            className="rounded-[18px] p-4 text-white flex items-center gap-3 bg-gradient-to-br from-[#10B981] to-[#059669]"
            style={{ boxShadow: '0 12px 40px rgba(16,185,129,0.4)' }}
          >
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={18} />
            </div>
            <p style={{ fontSize: '13px', fontWeight: '600' }}>{successMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
