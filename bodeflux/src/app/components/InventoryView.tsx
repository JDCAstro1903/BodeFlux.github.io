import { Package, Search, MapPin, AlertTriangle, CheckCircle, TrendingDown, XCircle, RefreshCw, Hash, Building2, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { inventoryApi, productApi, type InventoryItemAPI, type ProductAPI } from '../services/api';

const CATEGORIES = ['Todos', 'Fertilizantes', 'Semillas', 'Pesticidas', 'Herbicidas', 'Otros'];
const PAGE_SIZE = 20;

// Inventory = current stock snapshot. Salidas/Mermas live in Movimientos (event log).
type StatusTab = 'active' | 'expiring' | 'nostock' | 'all';

const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: 'active', label: 'Activos' },
  { value: 'expiring', label: 'Por vencer' },
  { value: 'nostock', label: 'Sin stock' },
  { value: 'all', label: 'Todos' },
];

function expiryInfo(dateStr: string) {
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
  if (days <= 0)  return { days, label: 'Vencido', pill: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400', icon: true };
  if (days <= 15) return { days, label: `${days}d`, pill: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400', icon: true };
  if (days <= 30) return { days, label: `${days}d`, pill: 'bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400', icon: true };
  return { days, label: dateStr, pill: '', icon: false };
}

function ExpiryCell({ date }: { date: string }) {
  const info = expiryInfo(date);
  if (info.pill)
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${info.pill}`}>
        <AlertTriangle size={10} /> {info.label}
      </span>
    );
  return <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{info.label}</span>;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'active')
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold whitespace-nowrap"><CheckCircle size={11} /> Activo</span>;
  if (status === 'output')
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[11px] font-semibold whitespace-nowrap"><TrendingDown size={11} /> Salida</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-[11px] font-semibold whitespace-nowrap"><XCircle size={11} /> Merma</span>;
}

export function InventoryView() {
  const [allItems, setAllItems] = useState<InventoryItemAPI[]>([]);
  const [products, setProducts] = useState<ProductAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [statusTab, setStatusTab] = useState<StatusTab>('active');
  const [page, setPage] = useState(1);

  const loadItems = async () => {
    setLoading(true);
    try {
      const [items, prods] = await Promise.all([
        inventoryApi.list('all'),
        productApi.list(),
      ]);
      setAllItems(items);
      setProducts(prods);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, []);

  // Stats: always from all active items regardless of current tab/filter
  const activeItems = useMemo(() => allItems.filter(i => i.status === 'active'), [allItems]);
  const expiredCount = useMemo(() => activeItems.filter(i => expiryInfo(i.expiry_date).days <= 0).length, [activeItems]);
  const soonCount = useMemo(() => activeItems.filter(i => { const d = expiryInfo(i.expiry_date).days; return d > 0 && d <= 30; }).length, [activeItems]);
  const outOfStockProducts = useMemo(() => products.filter(p => p.status === 'out' || p.stock <= 0), [products]);

  // Table rows: filter by tab + search + category
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allItems.filter((item) => {
      let matchStatus = true;
      if (statusTab === 'active') matchStatus = item.status === 'active';
      else if (statusTab === 'expiring') matchStatus = item.status === 'active' && expiryInfo(item.expiry_date).days <= 30;
      else if (statusTab === 'all') matchStatus = true;
      // 'nostock' is handled separately via filteredNoStock
      const matchSearch = !q ||
        item.product_name.toLowerCase().includes(q) ||
        item.lot_number.toLowerCase().includes(q) ||
        (item.provider ?? '').toLowerCase().includes(q);
      const matchCat = categoryFilter === 'Todos' || item.category === categoryFilter;
      return matchStatus && matchSearch && matchCat;
    });
  }, [allItems, statusTab, search, categoryFilter]);

  // Filtered out-of-stock products (for nostock tab)
  const filteredNoStock = useMemo(() => {
    const q = search.toLowerCase();
    return outOfStockProducts.filter(p =>
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.provider_name ?? '').toLowerCase().includes(q)
    );
  }, [outOfStockProducts, search]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [search, categoryFilter, statusTab]);

  const isNoStock = statusTab === 'nostock';
  const displayCount = isNoStock ? filteredNoStock.length : filtered.length;

  // Paginated slices
  const totalPages = Math.max(1, Math.ceil((isNoStock ? filteredNoStock.length : filtered.length) / PAGE_SIZE));
  const pagedItems = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);
  const pagedNoStock = useMemo(() => filteredNoStock.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredNoStock, page]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332] dark:text-[#34D399]">Inventario</h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
            {isNoStock ? `${displayCount} producto${displayCount !== 1 ? 's' : ''} sin existencias` : `${displayCount} lote${displayCount !== 1 ? 's' : ''} Â· estado actual del stock`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status tabs */}
          <div className="flex gap-1 p-1 rounded-[12px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl border border-white/50 dark:border-[#34D399]/20">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusTab(tab.value)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all whitespace-nowrap ${
                  statusTab === tab.value
                    ? 'bg-[#1B4332] dark:bg-[#34D399] text-white dark:text-[#0F172A] shadow-sm'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1B4332] dark:hover:text-[#34D399]'
                }`}
              >
                {tab.label}
              </button>
            ))}
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
      </div>

      {/* Stats â€” always from all active items */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button onClick={() => setStatusTab('active')} className={`rounded-[16px] bg-emerald-50 dark:bg-emerald-900/20 p-4 text-left transition-all ${statusTab === 'active' ? 'ring-2 ring-emerald-400' : 'hover:brightness-95'}`} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeItems.length}</p>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">Lotes activos</p>
        </button>
        <button onClick={() => setStatusTab('expiring')} className={`rounded-[16px] bg-orange-50 dark:bg-orange-900/20 p-4 text-left transition-all ${statusTab === 'expiring' ? 'ring-2 ring-orange-400' : 'hover:brightness-95'}`} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p className="text-2xl font-bold text-orange-500 dark:text-orange-400">{soonCount}</p>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">Por vencer (30d)</p>
        </button>
        <button onClick={() => setStatusTab('expiring')} className="rounded-[16px] bg-red-50 dark:bg-red-900/20 p-4 text-left hover:brightness-95 transition-all" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{expiredCount}</p>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">Vencidos</p>
        </button>
        <button onClick={() => setStatusTab('nostock')} className={`rounded-[16px] bg-gray-100 dark:bg-gray-800/40 p-4 text-left transition-all ${statusTab === 'nostock' ? 'ring-2 ring-gray-400' : 'hover:brightness-95'}`} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p className="text-2xl font-bold text-gray-500 dark:text-gray-400">{outOfStockProducts.length}</p>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">Sin stock</p>
        </button>
      </div>

      {/* Search + Category filter â€” hidden on nostock tab */}
      {!isNoStock && (
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Buscar producto, lote o proveedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-[12px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl border border-white/50 dark:border-[#34D399]/20 text-sm text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1B4332]/30 dark:focus:ring-[#34D399]/30"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto flex-shrink-0 pb-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-2 rounded-[10px] text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                categoryFilter === cat
                  ? 'bg-[#1B4332] text-white dark:bg-[#34D399] dark:text-[#0F172A]'
                  : 'bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl border border-white/50 dark:border-[#34D399]/20 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1B4332] dark:hover:text-[#34D399]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Table */}
      <div className="rounded-[20px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl overflow-hidden" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#6B7280] dark:text-[#9CA3AF]">
            <div className="animate-spin w-5 h-5 border-2 border-[#1B4332] dark:border-[#34D399] border-t-transparent rounded-full mr-3" />
            Cargando inventario...
          </div>
        ) : isNoStock ? (
          /* â”€â”€ Sin stock view â”€â”€ */
          filteredNoStock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#6B7280] dark:text-[#9CA3AF]">
              <CheckCircle size={40} className="mb-3 text-emerald-400 opacity-60" />
              <p className="font-medium">Todo en stock</p>
              <p className="text-sm mt-1">No hay productos sin existencias</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '35%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '15%' }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-[#2C2C2E] bg-[#F9FAFB] dark:bg-[#1E293B]/50">
                      {['Producto', 'CategorÃ­a', 'Unidad', 'Proveedor', 'Estado'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-[#2C2C2E]">
                    {pagedNoStock.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B]/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xl flex-shrink-0">{p.image_emoji}</span>
                            <span className="font-semibold text-[#1B4332] dark:text-[#E5E7EB] truncate" style={{ fontSize: '13px' }}>{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-[#F3F4F6] dark:bg-[#2C2C2E] text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '11px', fontWeight: '600' }}>{p.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{p.unit}</span>
                        </td>
                        <td className="px-4 py-3">
                          {p.provider_name
                            ? <span className="flex items-center gap-1 text-[#6B7280] dark:text-[#9CA3AF] truncate" style={{ fontSize: '12px' }}><Building2 size={11} />{p.provider_name}</span>
                            : <span className="text-[#9CA3AF]" style={{ fontSize: '12px' }}>â€”</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 text-[11px] font-semibold whitespace-nowrap">
                            <ShoppingBag size={11} /> Sin stock
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile */}
              <div className="md:hidden divide-y divide-gray-100 dark:divide-[#2C2C2E]">
                {pagedNoStock.map((p) => (
                  <div key={p.id} className="p-4 flex items-center gap-3">
                    <span className="text-2xl flex-shrink-0">{p.image_emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1B4332] dark:text-[#E5E7EB] truncate" style={{ fontSize: '14px' }}>{p.name}</p>
                      <p className="text-[#9CA3AF] mt-0.5" style={{ fontSize: '11px' }}>{p.category} Â· {p.unit}{p.provider_name ? ` Â· ${p.provider_name}` : ''}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 text-[11px] font-semibold whitespace-nowrap flex-shrink-0">
                      <ShoppingBag size={11} /> Sin stock
                    </span>
                  </div>
                ))}
              </div>
            </>
          )
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#6B7280] dark:text-[#9CA3AF]">
            <Package size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Sin resultados</p>
            <p className="text-sm mt-1">Intenta cambiar los filtros</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '28%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '11%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '18%' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#2C2C2E] bg-[#F9FAFB] dark:bg-[#1E293B]/50">
                    {['Producto', 'Lote', 'Cantidad', 'UbicaciÃ³n', 'Vencimiento', 'Estado'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-[#2C2C2E]">
                  {pagedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B]/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#1B4332]/10 to-[#0071E3]/10 dark:from-[#34D399]/10 dark:to-[#60A5FA]/10 flex items-center justify-center flex-shrink-0">
                            <Package size={14} className="text-[#1B4332] dark:text-[#34D399]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1B4332] dark:text-[#E5E7EB] truncate" style={{ fontSize: '13px' }}>
                              {item.product_name}
                            </p>
                            {item.provider ? (
                              <p className="flex items-center gap-1 text-[#9CA3AF] dark:text-[#6B7280] truncate" style={{ fontSize: '11px' }}>
                                <Building2 size={10} /> {item.provider}
                              </p>
                            ) : (
                              <p className="text-[#9CA3AF] dark:text-[#6B7280] truncate" style={{ fontSize: '11px' }}>{item.category}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[#6B7280] dark:text-[#9CA3AF] whitespace-nowrap" style={{ fontSize: '11px' }}>
                          {item.lot_number}
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
                        <ExpiryCell date={item.expiry_date} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-[#2C2C2E]">
              {pagedItems.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="font-semibold text-[#1B4332] dark:text-[#E5E7EB] leading-snug" style={{ fontSize: '14px' }}>{item.product_name}</p>
                      {item.provider
                        ? <p className="flex items-center gap-1 text-[#9CA3AF] mt-0.5" style={{ fontSize: '11px' }}><Building2 size={10} />{item.provider}</p>
                        : <p className="text-[#9CA3AF] mt-0.5" style={{ fontSize: '11px' }}>{item.category}</p>
                      }
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 mt-2">
                    <span className="flex items-center gap-1 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '12px' }}><Hash size={11} /><span className="font-mono truncate">{item.lot_number}</span></span>
                    <span className="flex items-center gap-1 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '12px' }}><MapPin size={11} /> {item.location}</span>
                    <span className="font-bold text-[#1B4332] dark:text-[#E5E7EB]" style={{ fontSize: '13px' }}>{item.quantity} <span className="font-normal text-[#6B7280]">{item.unit}</span></span>
                    <ExpiryCell date={item.expiry_date} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination bar */}
        {!loading && displayCount > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-[#2C2C2E]">
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, displayCount)} de {displayCount}
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
      </div>
    </div>
  );
}
