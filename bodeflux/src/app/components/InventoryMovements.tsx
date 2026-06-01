import { useState, useEffect, useMemo } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Trash2,
  Search,
  RefreshCw,
  ArrowLeftRight,
  User,
  MapPin,
  FileText,
  Hash,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  CalendarRange,
  X,
  Package,
} from 'lucide-react';
import { exportMovementsToExcel } from '../utils/exportExcel';
import { inventoryApi, type InventoryMovementAPI } from '../services/api';

const PAGE_SIZE = 20;

type FilterType = 'all' | 'entry' | 'output' | 'waste';

const FILTER_TABS: { value: FilterType; label: string }[] = [
  { value: 'all',    label: 'Todos'    },
  { value: 'entry',  label: 'Entradas' },
  { value: 'output', label: 'Salidas'  },
  { value: 'waste',  label: 'Mermas'   },
];

const TYPE_META = {
  entry:  { label: 'Entrada', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', borderL: 'border-l-emerald-400', cardBg: 'bg-emerald-50 dark:bg-emerald-900/20', kpiText: 'text-emerald-600 dark:text-emerald-400', ringColor: 'ring-emerald-400', Icon: ArrowDownToLine },
  output: { label: 'Salida',  bg: 'bg-blue-100 dark:bg-blue-900/40',       text: 'text-blue-700 dark:text-blue-300',       borderL: 'border-l-blue-400',    cardBg: 'bg-blue-50 dark:bg-blue-900/20',   kpiText: 'text-blue-600 dark:text-blue-400',   ringColor: 'ring-blue-400',    Icon: ArrowUpFromLine },
  waste:  { label: 'Merma',   bg: 'bg-red-100 dark:bg-red-900/40',         text: 'text-red-700 dark:text-red-300',         borderL: 'border-l-red-400',     cardBg: 'bg-red-50 dark:bg-red-900/20',     kpiText: 'text-red-600 dark:text-red-400',     ringColor: 'ring-red-400',     Icon: Trash2          },
} as const;

// keep old color string for compat — unused now
const _UNUSED_FILTER_TABS_COLOR = { entry: 'text-emerald-600', output: 'text-blue-600', waste: 'text-red-600' };
void _UNUSED_FILTER_TABS_COLOR;

function MovementBadge({ type }: { type: string }) {
  const meta = TYPE_META[type as keyof typeof TYPE_META];
  if (!meta) return null;
  const Icon = meta.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full whitespace-nowrap ${meta.bg} ${meta.text}`} style={{ fontSize: '11px', fontWeight: '600' }}>
      <Icon size={11} /> {meta.label}
    </span>
  );
}

function MovementIconBox({ type }: { type: string }) {
  const meta = TYPE_META[type as keyof typeof TYPE_META];
  if (!meta) return <div className="w-9 h-9 rounded-[10px] bg-gray-100 flex-shrink-0" />;
  const Icon = meta.Icon;
  return (
    <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
      <Icon size={16} className={meta.text} />
    </div>
  );
}

function formatDateShort(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDayGroup(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hoy';
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

function groupByDay(items: InventoryMovementAPI[]): { day: string; items: InventoryMovementAPI[] }[] {
  const map = new Map<string, InventoryMovementAPI[]>();
  for (const m of items) {
    const key = m.created_at ? new Date(m.created_at).toDateString() : 'Sin fecha';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return Array.from(map.entries()).map(([, items]) => ({
    day: items[0]?.created_at ? formatDayGroup(items[0].created_at) : 'Sin fecha',
    items,
  }));
}

// ── keep file compiling with old FILTER_TABS shape gone ──────────────────
const _COMPAT = { value: 'all' as FilterType };
void _COMPAT;

export function InventoryMovements() {
  const [movements, setMovements] = useState<InventoryMovementAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadMovements = async () => {
    setLoading(true);
    try {
      const data = await inventoryApi.movements();
      setMovements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMovements(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const from = dateFrom ? new Date(dateFrom).getTime() : null;
    const to   = dateTo   ? new Date(dateTo + 'T23:59:59').getTime() : null;
    return movements.filter((m) => {
      const matchType   = filter === 'all' || m.movement_type === filter;
      const matchSearch = !q ||
        (m.product_name ?? '').toLowerCase().includes(q) ||
        (m.lot_number   ?? '').toLowerCase().includes(q) ||
        (m.destination  ?? '').toLowerCase().includes(q) ||
        (m.user_name    ?? '').toLowerCase().includes(q) ||
        (m.notes        ?? '').toLowerCase().includes(q);
      const ts = m.created_at ? new Date(m.created_at).getTime() : null;
      const matchDate =
        (!from || (ts !== null && ts >= from)) &&
        (!to   || (ts !== null && ts <= to));
      return matchType && matchSearch && matchDate;
    });
  }, [movements, filter, search, dateFrom, dateTo]);

  useEffect(() => { setPage(1); }, [search, filter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedItems = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  // Global KPI counts
  const entryCount  = movements.filter((m) => m.movement_type === 'entry').length;
  const outputCount = movements.filter((m) => m.movement_type === 'output').length;
  const wasteCount  = movements.filter((m) => m.movement_type === 'waste').length;

  // Filtered KPI counts (for date-range badge)
  const fEntries = filtered.filter((m) => m.movement_type === 'entry').length;
  const fOutputs = filtered.filter((m) => m.movement_type === 'output').length;
  const fWastes  = filtered.filter((m) => m.movement_type === 'waste').length;

  const hasDateFilter = !!(dateFrom || dateTo);
  const dayGroups = useMemo(() => groupByDay(pagedItems), [pagedItems]);

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332] dark:text-[#34D399]">Movimientos</h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
            Bitácora completa de entradas, salidas y mermas
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadMovements}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-[12px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl border border-white/50 dark:border-[#34D399]/20 text-[#1B4332] dark:text-[#34D399] text-sm font-medium hover:shadow-md transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <button
            onClick={() => exportMovementsToExcel(filtered, dateFrom || null, dateTo || null)}
            disabled={loading || filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-[12px] bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-40"
          >
            <FileSpreadsheet size={14} />
            Excel
          </button>
        </div>
      </div>

      {/* ── KPI cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {(['entry', 'output', 'waste'] as const).map((type) => {
          const meta    = TYPE_META[type];
          const Icon    = meta.Icon;
          const total   = type === 'entry' ? entryCount  : type === 'output' ? outputCount  : wasteCount;
          const inRange = type === 'entry' ? fEntries    : type === 'output' ? fOutputs     : fWastes;
          const isActive = filter === type;
          return (
            <button
              key={type}
              onClick={() => setFilter(isActive ? 'all' : type)}
              className={`rounded-[16px] p-4 text-left transition-all ${meta.cardBg} ${isActive ? `ring-2 ${meta.ringColor}` : 'hover:brightness-95'}`}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${meta.bg}`}>
                  <Icon size={16} className={meta.text} />
                </div>
                {hasDateFilter && inRange !== total && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
                    {inRange}/{total}
                  </span>
                )}
              </div>
              <p className={`text-2xl font-bold ${meta.kpiText}`}>
                {hasDateFilter ? inRange : total}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">{meta.label}s</p>
            </button>
          );
        })}
      </div>

      {/* ── Filters panel ──────────────────────────────────── */}
      <div className="rounded-[16px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl border border-white/50 dark:border-[#34D399]/20 p-4 space-y-3">
        {/* Date range */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] min-w-fit">
            <CalendarRange size={13} /> Período:
          </span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="flex-1 min-w-[130px] px-3 py-1.5 rounded-[10px] bg-[#F9FAFB] dark:bg-[#0F172A]/60 border border-gray-200 dark:border-[#2C2C2E] text-sm text-[#1D1D1F] dark:text-[#F5F5F7] outline-none focus:ring-2 focus:ring-[#1B4332]/30 dark:focus:ring-[#34D399]/30 cursor-pointer"
          />
          <span className="text-xs text-[#9CA3AF] font-medium">—</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            className="flex-1 min-w-[130px] px-3 py-1.5 rounded-[10px] bg-[#F9FAFB] dark:bg-[#0F172A]/60 border border-gray-200 dark:border-[#2C2C2E] text-sm text-[#1D1D1F] dark:text-[#F5F5F7] outline-none focus:ring-2 focus:ring-[#1B4332]/30 dark:focus:ring-[#34D399]/30 cursor-pointer"
          />
          {hasDateFilter && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-medium hover:bg-red-100 transition-all"
            >
              <X size={11} /> Limpiar
            </button>
          )}
        </div>

        {/* Search + type tabs */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto, lote, destino, usuario…"
              className="w-full pl-9 pr-4 py-2 rounded-[10px] bg-[#F9FAFB] dark:bg-[#0F172A]/60 border border-gray-200 dark:border-[#2C2C2E] text-sm text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1B4332]/30 dark:focus:ring-[#34D399]/30"
            />
          </div>
          <div className="flex gap-1 p-1 rounded-[10px] bg-[#F3F4F6] dark:bg-[#0F172A]/60 flex-shrink-0">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all whitespace-nowrap ${
                  filter === tab.value
                    ? 'bg-[#1B4332] dark:bg-[#34D399] text-white dark:text-[#0F172A] shadow-sm'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1B4332] dark:hover:text-[#34D399]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] px-1">
        {filtered.length === 0
          ? 'Sin resultados'
          : `${filtered.length} evento${filtered.length !== 1 ? 's' : ''}${filtered.length > PAGE_SIZE ? ` · página ${page} de ${totalPages}` : ''}`}
      </p>

      {/* ── Content ────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-6 h-6 border-2 border-[#1B4332] dark:border-[#34D399] border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#6B7280] dark:text-[#9CA3AF]">
          <ArrowLeftRight size={40} className="mb-3 opacity-20" />
          <p className="font-medium text-sm">Sin movimientos en este período</p>
          <p className="text-xs mt-1">Ajusta los filtros o el rango de fechas</p>
        </div>
      ) : (
        <>
          {/* ── Desktop table ──────────────────────────────── */}
          <div className="hidden md:block rounded-[20px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl overflow-hidden" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <table className="w-full" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '4px'  }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '21%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '9%'  }} />
                <col style={{ width: '17%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '16%' }} />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#2C2C2E] bg-[#F9FAFB] dark:bg-[#1E293B]/50">
                  <th />
                  {['Tipo', 'Producto', 'Lote', 'Cantidad', 'Destino / Nota', 'Usuario', 'Fecha'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#2C2C2E]">
                {pagedItems.map((m) => {
                  const meta = TYPE_META[m.movement_type as keyof typeof TYPE_META];
                  return (
                    <tr key={m.id} className="group hover:bg-[#F9FAFB] dark:hover:bg-white/[0.02] transition-colors">
                      <td className={`w-1 p-0 border-l-4 ${meta?.borderL ?? 'border-l-gray-200'}`} />
                      <td className="px-4 py-3"><MovementBadge type={m.movement_type} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-[8px] bg-[#1B4332]/8 dark:bg-[#34D399]/10 flex items-center justify-center flex-shrink-0">
                            <Package size={12} className="text-[#1B4332] dark:text-[#34D399]" />
                          </div>
                          <span className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7] truncate">{m.product_name ?? '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-mono bg-[#F3F4F6] dark:bg-[#2C2C2E] px-1.5 py-0.5 rounded-[6px]">
                          {m.lot_number ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{m.quantity}</span>
                        <span className="ml-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">{m.unit ?? ''}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate block">{m.destination ?? m.notes ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-5 h-5 rounded-full bg-[#1B4332]/10 dark:bg-[#34D399]/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-[8px] font-bold text-[#1B4332] dark:text-[#34D399]">
                              {(m.user_name ?? '?').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate">{m.user_name ?? '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                          <CalendarDays size={11} className="flex-shrink-0" />
                          <span>{formatDateShort(m.created_at)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Mobile: grouped by day ──────────────────────── */}
          <div className="md:hidden space-y-5">
            {dayGroups.map((group) => (
              <div key={group.day}>
                <div className="flex items-center gap-3 mb-2 px-1">
                  <CalendarDays size={13} className="text-[#9CA3AF]" />
                  <span className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wide capitalize">{group.day}</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-[#2C2C2E]" />
                  <span className="text-[10px] text-[#9CA3AF]">{group.items.length} mov.</span>
                </div>
                <div className="space-y-2">
                  {group.items.map((m) => {
                    const meta = TYPE_META[m.movement_type as keyof typeof TYPE_META];
                    return (
                      <div key={m.id} className={`rounded-[14px] bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl border-l-4 ${meta?.borderL ?? 'border-l-gray-200'} overflow-hidden`} style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                        <div className="p-3.5">
                          <div className="flex items-start gap-3">
                            <MovementIconBox type={m.movement_type} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <p className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate leading-tight">{m.product_name ?? '—'}</p>
                                <MovementBadge type={m.movement_type} />
                              </div>
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                <div className="flex items-center gap-1.5">
                                  <Hash size={10} className="text-[#9CA3AF] flex-shrink-0" />
                                  <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] font-mono truncate">{m.lot_number ?? '—'}</span>
                                </div>
                                <div className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                                  {m.quantity} <span className="text-xs font-normal text-[#6B7280] dark:text-[#9CA3AF]">{m.unit ?? ''}</span>
                                </div>
                                {(m.destination || m.notes) && (
                                  <div className="flex items-center gap-1.5 col-span-2">
                                    {m.destination ? <MapPin size={10} className="text-[#9CA3AF] flex-shrink-0" /> : <FileText size={10} className="text-[#9CA3AF] flex-shrink-0" />}
                                    <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] truncate">{m.destination ?? m.notes}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                  <User size={10} className="text-[#9CA3AF] flex-shrink-0" />
                                  <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] truncate">{m.user_name ?? '—'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <CalendarDays size={10} className="text-[#9CA3AF] flex-shrink-0" />
                                  <span className="text-[11px] text-[#9CA3AF]">
                                    {m.created_at ? new Date(m.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ── Pagination ─────────────────────────────────── */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 rounded-[16px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl border border-white/50 dark:border-[#34D399]/20">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#2C2C2E] disabled:opacity-30 transition-all">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`e-${idx}`} className="px-1 text-xs text-[#9CA3AF]">…</span>
                    ) : (
                      <button key={p} onClick={() => setPage(p as number)} className={`w-8 h-8 rounded-[8px] text-xs font-semibold transition-all ${page === p ? 'bg-[#1B4332] dark:bg-[#34D399] text-white dark:text-[#0F172A]' : 'text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#2C2C2E]'}`}>
                        {p}
                      </button>
                    ),
                  )}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#2C2C2E] disabled:opacity-30 transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

