import { X, Package, Hash, Weight, TrendingDown, LogOut, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { inventoryApi, type InventoryItemAPI } from '../services/api';

interface ScanOutputProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (output: OutputData) => void;
}

export interface OutputData {
  inventoryItemId: number;
  productName: string;
  quantity: number;
  unit: string;
  lotNumber: string;
  destination: string;
  outputDate: string;
}

export function ScanOutput({ isOpen, onClose, onSubmit }: ScanOutputProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [inventoryItems, setInventoryItems] = useState<InventoryItemAPI[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const productDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      inventoryApi.list().then(setInventoryItems).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleItemChange = (itemId: string) => {
    const item = inventoryItems.find((i) => String(i.id) === itemId);
    if (item) {
      setFormData({ ...formData, inventoryItemId: item.id, productName: item.product_name, unit: item.unit, lotNumber: item.lot_number });
      setProductSearch(`${item.product_name} — ${item.lot_number}`);
    } else {
      setFormData({ ...formData, inventoryItemId: 0, productName: '', unit: 'kg', lotNumber: '' });
      setProductSearch('');
    }
    setShowDropdown(false);
  };

  const [formData, setFormData] = useState<OutputData>({
    inventoryItemId: 0,
    productName: '',
    quantity: 0,
    unit: 'kg',
    lotNumber: '',
    destination: '',
    outputDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.inventoryItemId) return;
    onSubmit(formData);
    setFormData({
      inventoryItemId: 0,
      productName: '',
      quantity: 0,
      unit: 'kg',
      lotNumber: '',
      destination: '',
      outputDate: new Date().toISOString().split('T')[0],
    });
    setProductSearch('');
    setShowDropdown(false);
    onClose();
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full flex items-center justify-center py-8">
        <div
          className="bg-white dark:bg-[#1C1C1E] rounded-[32px] max-w-2xl w-full overflow-hidden"
          style={{ boxShadow: '0 20px 80px rgba(0, 0, 0, 0.3)' }}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0071E3] to-[#005BB5] p-6 rounded-t-[32px] flex items-center justify-between"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <LogOut size={24} className="text-white" />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>
                Registrar Salida
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
                Registrar salida de productos del inventario
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Product Information */}
          <div className="space-y-4">
            <h3 className="text-[#1B4332] dark:text-emerald-300" style={{ fontSize: '16px', fontWeight: '600' }}>
              Información de Salida
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                  <Package size={16} />
                  Producto / Lote
                </label>
                <div ref={productDropdownRef} className="relative">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowDropdown(true);
                        if (formData.inventoryItemId > 0) {
                          setFormData({ ...formData, inventoryItemId: 0, productName: '', unit: 'kg', lotNumber: '' });
                        }
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Buscar producto o número de lote…"
                      className="w-full pl-9 pr-8 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white dark:placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
                      style={{ fontSize: '14px' }}
                    />
                    {formData.inventoryItemId > 0 && (
                      <button
                        type="button"
                        onClick={() => handleItemChange('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {showDropdown && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1.5 max-h-52 overflow-y-auto rounded-[14px] bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] shadow-xl">
                      {inventoryItems.filter((item) => {
                        const q = productSearch.toLowerCase();
                        return !q || item.product_name.toLowerCase().includes(q) || item.lot_number.toLowerCase().includes(q);
                      }).length === 0 ? (
                        <div className="px-4 py-3 text-sm text-[#9CA3AF] text-center">Sin resultados</div>
                      ) : (
                        inventoryItems
                          .filter((item) => {
                            const q = productSearch.toLowerCase();
                            return !q || item.product_name.toLowerCase().includes(q) || item.lot_number.toLowerCase().includes(q);
                          })
                          .map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleItemChange(String(item.id))}
                              className={`w-full px-4 py-2.5 text-left hover:bg-[#F3F4F6] dark:hover:bg-[#3A3A3C] transition-colors first:rounded-t-[14px] last:rounded-b-[14px] ${formData.inventoryItemId === item.id ? 'bg-[#0071E3]/10 dark:bg-[#0071E3]/20' : ''}`}
                            >
                              <div className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">{item.product_name}</div>
                              <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">{item.lot_number} · {item.quantity} {item.unit}</div>
                            </button>
                          ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Lot Number (from scan) */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                  <Hash size={16} />
                  Lote
                </label>
                <input
                  type="text"
                  required
                  value={formData.lotNumber}
                  onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white dark:placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
                  placeholder="Escanear código QR"
                  style={{ fontSize: '14px' }}
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                  <Weight size={16} />
                  Cantidad a Retirar
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white dark:placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
                  placeholder="0"
                  style={{ fontSize: '14px' }}
                />
              </div>

              {/* Unit */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                  <Hash size={16} />
                  Unidad
                </label>
                <select
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
                  style={{ fontSize: '14px' }}
                >
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="L">Litros (L)</option>
                  <option value="bolsa">Bolsas</option>
                  <option value="unidad">Unidades</option>
                  <option value="caja">Cajas</option>
                </select>
              </div>

              {/* Destination */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                  <TrendingDown size={16} />
                  Destino / Cliente
                </label>
                <input
                  type="text"
                  required
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white dark:placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
                  placeholder="Ej: Cliente ABC, Distribuidora XYZ"
                  style={{ fontSize: '14px' }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 mt-2 border-t border-gray-200 dark:border-[#3A3A3C]"
            style={{
              position: 'sticky',
              bottom: 0,
              backgroundColor: isDark ? '#1C1C1E' : 'white',
              marginLeft: '-24px',
              marginRight: '-24px',
              marginBottom: '-24px',
              paddingLeft: '24px',
              paddingRight: '24px',
              paddingBottom: '24px',
              borderBottomLeftRadius: '32px',
              borderBottomRightRadius: '32px',
              boxShadow: isDark ? '0 -4px 12px rgba(0, 0, 0, 0.3)' : '0 -4px 12px rgba(0, 0, 0, 0.05)'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-[16px] bg-gray-200 dark:bg-[#3A3A3C] text-gray-700 dark:text-[#E5E7EB] hover:bg-gray-300 dark:hover:bg-[#4A4A4C] transition-all"
              style={{ fontSize: '15px', fontWeight: '600' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-[16px] bg-gradient-to-br from-[#0071E3] to-[#005BB5] text-white hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontSize: '15px', fontWeight: '600', boxShadow: '0 8px 24px rgba(0, 113, 227, 0.3)' }}
            >
              Registrar Salida
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}