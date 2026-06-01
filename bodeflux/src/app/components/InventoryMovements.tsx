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
  Clock,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  CalendarRange,
  X,
} from 'lucide-react';
import { exportMovementsToExcel } from '../utils/exportExcel';

const PAGE_SIZE = 20;
import { inventoryApi, type InventoryMovementAPI } from '../services/api';

type FilterType = 'all' | 'entry' | 'output' | 'waste';

const FILTER_TABS: { value: FilterType; label: string; color: string }[] = [
  { value: 'all',    label: 'Todos',    color: '' },
  { value: 'entry',  label: 'Entradas', color: 'text-emerald-600 dark:text-emerald-400' },
  { value: 'output', label: 'Salidas',  color: 'text-blue-600 dark:text-blue-400' },
  { value: 'waste',  label: 'Mermas',   color: 'text-red-600 dark:text-red-400' },
];

function MovementBadge({ type }: { type: string }) {
  if (type === 'entry')
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 whitespace-nowrap" style={{ fontSize: '11px', fontWeight: '600' }}>
        <ArrowDownToLine size={11} /> Entrada
      </span>
    );
  if (type === 'output')
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 whitespace-nowrap" style={{ fontSize: '11px', fontWeight: '600' }}>
        <ArrowUpFromLine size={11} /> Salida
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 whitespace-nowrap" style={{ fontSize: '11px', fontWeight: '600' }}>
      <Trash2 size={11} /> Merma
    </span>
  );
}

function MovementIcon({ type }: { type: string }) {
  if (type === 'entry')
    return (
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/40 flex-shrink-0">
        <ArrowDownToLine size={16} className="text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  if (type === 'output')
    return (
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 flex-shrink-0">
        <ArrowUpFromLine size={16} className="text-blue-600 dark:text-blue-400" />
      </div>
    );
  return (
    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-red-100 dark:bg-red-900/40 flex-shrink-0">
      <Trash2 size={16} className="text-red-600 dark:text-red-400" />
    </div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return 'â€”';
  const d = new Date(iso);
  return d.toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)   return 'ahora';
  if (mins < 60)  return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7)   return `hace ${days}d`;
  return formatDate(iso);
}

export function InventoryMovements() {
  const [movements, setMovements] = useState<InventoryMovementAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]   = useState('');

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
    // dateTo: include the full day by setting to 23:59:59
    const to   = dateTo   ? new Date(dateTo + 'T23:59:59').getTime() : null;
    return movements.filter((m) => {
      const matchType = filter === 'all' || m.movement_type === filter;
      const matchSearch =
        !q ||
        (m.product_name ?? '').toLowerCase().includes(q) ||
        (m.lot_number ?? '').toLowerCase().includes(q) ||
        (m.destination ?? '').toLowerCase().includes(q) ||
        (m.user_name ?? '').toLowerCase().includes(q);
      const ts = m.created_at ? new Date(m.created_at).getTime() : null;
      const matchDate =
        (!from || (ts !== null && ts >= from)) &&
        (!to   || (ts !== null && ts <= to));
      return matchType && matchSearch && matchDate;
    });
  }, [movements, filter, search, dateFrom, dateTo]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, filter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedItems = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  const entryCount  = movements.filter((m) => m.movement_type === 'entry').length;
  const outputCount = movements.filter((m) => m.movement_type === 'output').length;
  const wasteCount  = movements.filter((m) => m.movement_type === 'waste').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332] dark:text-[#34D399]">Movimientos</h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
            Bitácora de eventos ·{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{entryCount} entradas</span>
            {' · '}
            <span className="text-blue-600 dark:text-blue-400 font-medium">{outputCount} salidas</span>
            {' · '}
            <span className="text-red-600 dark:text-red-400 font-medium">{wasteCount} mermas</span>
          </p>
        </div>
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

      {/* Date range + Search + Type filter */}
      <div className="flex flex-col gap-3">
        {/* Date range row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-[12px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl border border-white/50 dark:border-[#34D399]/20 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <CalendarRange size={14} className="flex-shrink-0" />
            <span className="hidden sm:inline font-medium">Rango:</span>
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 rounded-[12px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl border border-white/50 dark:border-[#34D399]/20 text-sm text-[#1D1D1F] dark:text-[#F5F5F7] outline-none focus:ring-2 focus:ring-[#1B4332]/30 dark:focus:ring-[#34D399]/30 cursor-pointer"
          />
          <span className="text-xs text-[#9CA3AF]">—</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 rounded-[12px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl border border-white/50 dark:border-[#34D399]/20 text-sm text-[#1D1D1F] dark:text-[#F5F5F7] outline-none focus:ring-2 focus:ring-[#1B4332]/30 dark:focus:ring-[#34D399]/30 cursor-pointer"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="flex items-center gap-1 px-2.5 py-2 rounded-[10px] bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
            >
              <X size={12} /> Limpiar
            </button>
          )}
        </div>

        {/* Search + type filter row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto, lote, destino, usuario…"
              className="w-full pl-9 pr-4 py-2.5 rounded-[12px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl border border-white/50 dark:border-[#34D399]/20 text-sm text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1B4332]/30 dark:focus:ring-[#34D399]/30"
            />
          </div>
          <div className="flex gap-1 p-1 rounded-[12px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl border border-white/50 dark:border-[#34D399]/20">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all whitespace-nowrap ${
                  filter === tab.value
                    ? 'bg-[#1B4332] dark:bg-[#34D399] text-white dark:text-[#0F172A] shadow-sm'
                    : `${tab.color || 'text-[#6B7280] dark:text-[#9CA3AF]'} hover:opacity-80`
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
        {filtered.length} evento{filtered.length !== 1 ? 's' : ''}
        {filtered.length > PAGE_SIZE && ` · página ${page} de ${totalPages}`}
      </p>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={20} className="animate-spin text-[#1B4332] dark:text-[#34D399]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[#6B7280] dark:text-[#9CA3AF]">
          <ArrowLeftRight size={36} className="mb-3 opacity-30" />
          <p className="text-sm">No hay movimientos registrados</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-[16px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl border border-white/50 dark:border-[#34D399]/20 overflow-hidden">
            <table className="w-full" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '12%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#34D399]/10 bg-[#F9FAFB] dark:bg-[#1E293B]/50">
                  {['Tipo', 'Producto', 'Lote', 'Cantidad', 'Destino / Nota', 'Usuario', 'Cuándo'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#2C2C2E]">
                {pagedItems.map((m, idx) => (
                  <tr
                    key={m.id}
                    className={`transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-white/[0.02]'} hover:bg-[#1B4332]/5 dark:hover:bg-[#34D399]/5`}
                  >
                    <td className="px-4 py-3"><MovementBadge type={m.movement_type} /></td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7] truncate block">{m.product_name ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-mono">{m.lot_number ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {m.quantity} <span className="text-xs font-normal text-[#6B7280] dark:text-[#9CA3AF]">{m.unit ?? ''}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate block">
                        {m.destination ?? m.notes ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{m.user_name ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] whitespace-nowrap" title={formatDate(m.created_at)}>
                        {relativeTime(m.created_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {pagedItems.map((m) => (
              <div
                key={m.id}
                className="rounded-[16px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl border border-white/50 dark:border-[#34D399]/20 p-4"
              >
                <div className="flex items-start gap-3">
                  <MovementIcon type={m.movement_type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate">{m.product_name ?? '—'}</p>
                      <MovementBadge type={m.movement_type} />
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        <Hash size={11} /><span className="font-mono">{m.lot_number ?? '—'}</span>
                      </div>
                      <div className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {m.quantity} <span className="font-normal text-[#6B7280] dark:text-[#9CA3AF]">{m.unit ?? ''}</span>
                      </div>
                      {m.destination && (
                        <div className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF] col-span-2">
                          <MapPin size={11} /><span className="truncate">{m.destination}</span>
                        </div>
                      )}
                      {!m.destination && m.notes && (
                        <div className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF] col-span-2">
                          <FileText size={11} /><span className="truncate">{m.notes}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        <User size={11} />{m.user_name ?? '—'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        <Clock size={11} />
                        <span title={formatDate(m.created_at)}>{relativeTime(m.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 mt-2 rounded-[16px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl border border-white/50 dark:border-[#34D399]/20">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#2C2C2E] disabled:opacity-30 transition-all"
                >
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
                      <span key={`ellipsis-${idx}`} className="px-1 text-xs text-[#9CA3AF]">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`w-8 h-8 rounded-[8px] text-xs font-semibold transition-all ${
                          page === p
                            ? 'bg-[#1B4332] dark:bg-[#34D399] text-white dark:text-[#0F172A]'
                            : 'text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#2C2C2E]'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#2C2C2E] disabled:opacity-30 transition-all"
                >
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
