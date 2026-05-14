import { Package, Search, Filter, MapPin, Calendar, Hash, Building2, TrendingDown, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { inventoryApi, type InventoryItemAPI } from '../services/api';

const CATEGORIES = ['Todos', 'Fertilizantes', 'Semillas', 'Pesticidas', 'Herbicidas', 'Otros'];
const STATUSES: { value: string; label: string; color: string }[] = [
  { value: 'all', label: 'Todos', color: '' },
  { value: 'active', label: 'Activo', color: 'emerald' },
  { value: 'output', label: 'Salida', color: 'blue' },
  { value: 'waste', label: 'Merma', color: 'red' },
];

function StatusBadge({ status }: { status: string }) {
  if (status === 'active')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 whitespace-nowrap" style={{ fontSize: '11px', fontWeight: '600' }}>
        <CheckCircle size={11} /> Activo
      </span>
    );
  if (status === 'output')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 whitespace-nowrap" style={{ fontSize: '11px', fontWeight: '600' }}>
        <TrendingDown size={11} /> Salida
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 whitespace-nowrap" style={{ fontSize: '11px', fontWeight: '600' }}>
      <XCircle size={11} /> Merma
    </span>
  );
}

function ExpiryBadge({ date }: { date: string }) {
  const daysLeft = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  if (daysLeft <= 0)
    return <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 whitespace-nowrap" style={{ fontSize: '12px' }}><AlertTriangle size={12} /> Vencido</span>;
  if (daysLeft <= 30)
    return <span className="inline-flex items-center gap-1 text-orange-500 dark:text-orange-400 whitespace-nowrap" style={{ fontSize: '12px' }}><AlertTriangle size={12} /> {daysLeft}d</span>;
  if (daysLeft <= 90)
    return <span className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-400 whitespace-nowrap" style={{ fontSize: '12px' }}><Calendar size={12} /> {date}</span>;
  return <span className="inline-flex items-center gap-1 text-[#6B7280] dark:text-[#9CA3AF] whitespace-nowrap" style={{ fontSize: '12px' }}><Calendar size={12} /> {date}</span>;
}

export function InventoryView() {
  const [items, setItems] = useState<InventoryItemAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadItems = async () => {
    setLoading(true);
    try {
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const data = await inventoryApi.list(status);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, [statusFilter]);

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      item.product_name.toLowerCase().includes(q) ||
      item.lot_number.toLowerCase().includes(q) ||
      (item.provider ?? '').toLowerCase().includes(q);
    const matchCategory = categoryFilter === 'Todos' || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const activeCount = filtered.filter(i => i.status === 'active').length;
  const totalQty = filtered.filter(i => i.status === 'active').reduce((s, i) => s + i.quantity, 0);
  const expiringCount = filtered.filter(i => {
    const d = Math.ceil((new Date(i.expiry_date).getTime() - Date.now()) / 86400000);
    return d <= 30 && d > 0 && i.status === 'active';
  }).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332] dark:text-[#34D399]">Inventario</h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">{filtered.length} registros encontrados</p>
        </div>
        <button
          onClick={loadItems}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-[12px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl border border-white/50 dark:border-[#34D399]/20 text-[#1B4332] dark:text-[#34D399] text-sm font-medium hover:shadow-md transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Lotes activos', value: activeCount, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Unidades en stock', value: totalQty.toLocaleString(), color: 'text-[#0071E3] dark:text-[#60A5FA]', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Por vencer (30d)', value: expiringCount, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((s) => (
          <div key={s.label} className={`rounded-[16px] ${s.bg} p-4`} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-[20px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl p-4 space-y-3" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Buscar por producto, lote o proveedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-[12px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-transparent focus:border-[#0071E3]/40 text-[#1B4332] dark:text-[#E5E7EB] placeholder-[#9CA3AF] focus:outline-none transition-colors"
            style={{ fontSize: '14px' }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            <Filter size={13} className="text-[#9CA3AF] flex-shrink-0" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-[#1B4332] text-white dark:bg-[#34D399] dark:text-[#0F172A]'
                    : 'bg-[#F3F4F6] dark:bg-[#2C2C2E] text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#E5E7EB]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#9CA3AF] text-xs">Estado:</span>
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === s.value
                    ? 'bg-[#0071E3] text-white'
                    : 'bg-[#F3F4F6] dark:bg-[#2C2C2E] text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#E5E7EB]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[20px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl overflow-hidden" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#6B7280] dark:text-[#9CA3AF]">
            <div className="animate-spin w-6 h-6 border-2 border-[#1B4332] dark:border-[#34D399] border-t-transparent rounded-full mr-3" />
            Cargando inventario...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#6B7280] dark:text-[#9CA3AF]">
            <Package size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Sin resultados</p>
            <p className="text-sm mt-1">Intenta cambiar los filtros</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto pr-1">
              <table className="w-full" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '26%' }} />
                  <col style={{ width: '17%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '15%' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#2C2C2E] bg-[#F9FAFB] dark:bg-[#1E293B]/50">
                    {['Producto', 'Lote', 'Categoría', 'Cantidad', 'Ubicación', 'Vencimiento'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-[#2C2C2E]">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B]/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#1B4332]/10 to-[#0071E3]/10 dark:from-[#34D399]/10 dark:to-[#60A5FA]/10 flex items-center justify-center flex-shrink-0">
                            <Package size={14} className="text-[#1B4332] dark:text-[#34D399]" />
                          </div>
                          <span className="font-semibold text-[#1B4332] dark:text-[#E5E7EB] truncate" style={{ fontSize: '13px' }}>
                            {item.product_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[#6B7280] dark:text-[#9CA3AF] whitespace-nowrap" style={{ fontSize: '11px' }}>
                          {item.lot_number}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-[#F3F4F6] dark:bg-[#2C2C2E] text-[#6B7280] dark:text-[#9CA3AF] whitespace-nowrap" style={{ fontSize: '11px', fontWeight: '600' }}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-bold text-[#1B4332] dark:text-[#E5E7EB]" style={{ fontSize: '13px' }}>{item.quantity}</span>
                        <span className="ml-1 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '12px' }}>{item.unit}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-[#6B7280] dark:text-[#9CA3AF] whitespace-nowrap" style={{ fontSize: '12px' }}>
                          <MapPin size={11} /> {item.location}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ExpiryBadge date={item.expiry_date} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-[#2C2C2E]">
              {filtered.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="font-semibold text-[#1B4332] dark:text-[#E5E7EB] leading-snug" style={{ fontSize: '14px' }}>{item.product_name}</p>
                      <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-0.5" style={{ fontSize: '11px' }}>{item.category}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 mt-2">
                    <span className="flex items-center gap-1 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '12px' }}><Hash size={11} /><span className="font-mono">{item.lot_number}</span></span>
                    <span className="flex items-center gap-1 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '12px' }}><MapPin size={11} /> {item.location}</span>
                    <span className="font-bold text-[#1B4332] dark:text-[#E5E7EB]" style={{ fontSize: '13px' }}>{item.quantity} <span className="font-normal text-[#6B7280]">{item.unit}</span></span>
                    <ExpiryBadge date={item.expiry_date} />
                    {item.provider && <span className="col-span-2 flex items-center gap-1 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '12px' }}><Building2 size={11} /> {item.provider}</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

