import { X, AlertTriangle, Hash, Weight, FileText, Camera, Upload, Package, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { inventoryApi, type InventoryItemAPI } from '../services/api';

interface RegisterWasteProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (waste: WasteData) => void;
}

export interface WasteData {
  inventoryItemId: number;
  lotNumber: string;
  productName: string;
  quantity: number;
  unit: string;
  reason: string;
  hasEvidence: boolean;
  notes: string;
  wasteDate: string;
}

export function RegisterWaste({ isOpen, onClose, onSubmit }: RegisterWasteProps) {
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
      setFormData((prev) => ({
        ...prev,
        inventoryItemId: item.id,
        lotNumber: item.lot_number,
        productName: item.product_name,
        unit: item.unit,
      }));
      setProductSearch(`${item.product_name} — ${item.lot_number}`);
    } else {
      setFormData((prev) => ({ ...prev, inventoryItemId: 0, lotNumber: '', productName: '', unit: 'kg' }));
      setProductSearch('');
    }
    setShowDropdown(false);
  };

  const [formData, setFormData] = useState<WasteData>({
    inventoryItemId: 0,
    lotNumber: '',
    productName: '',
    quantity: 0,
    unit: 'kg',
    reason: '',
    hasEvidence: false,
    notes: '',
    wasteDate: new Date().toISOString().split('T')[0],
  });

  const selectedItem = inventoryItems.find((i) => i.id === formData.inventoryItemId) ?? null;

  // Packaging multiple validation (same rule as output)
  const packSize = selectedItem?.presentation_value ?? null;
  const packUnit = selectedItem?.unit ?? '';
  const packName = selectedItem?.presentation_name ?? '';
  const breaksPackage =
    packSize !== null &&
    packSize > 0 &&
    formData.quantity > 0 &&
    formData.quantity < (selectedItem?.quantity ?? 0) &&
    Math.round(formData.quantity % packSize * 10000) / 10000 !== 0;

  const validMultiples: number[] = packSize && selectedItem
    ? Array.from({ length: Math.floor(selectedItem.quantity / packSize) }, (_, i) => (i + 1) * packSize)
    : [];

  const [evidenceFile, setEvidenceFile] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.lotNumber || !formData.productName || formData.quantity <= 0 || !formData.reason) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (selectedItem && formData.quantity > selectedItem.quantity) {
      alert(`La cantidad de merma (${formData.quantity} ${formData.unit}) excede el stock disponible en este lote (${selectedItem.quantity} ${selectedItem.unit}).`);
      return;
    }

    if (breaksPackage) {
      alert(`No puedes registrar ${formData.quantity} ${packUnit} de merma porque los empaques son de ${packSize} ${packUnit} (${packName}).\nCantidades v\u00e1lidas: ${validMultiples.slice(0, 6).join(', ')}\u2026`);
      return;
    }

    onSubmit(formData);
    setFormData({
      inventoryItemId: 0,
      lotNumber: '',
      productName: '',
      quantity: 0,
      unit: 'kg',
      reason: '',
      hasEvidence: false,
      notes: '',
      wasteDate: new Date().toISOString().split('T')[0],
    });
    setEvidenceFile('');
    setProductSearch('');
    setShowDropdown(false);
    onClose();
  };

  const handleFileUpload = () => {
    // Simulate file upload
    setEvidenceFile('evidencia_merma_' + Date.now() + '.jpg');
    setFormData({ ...formData, hasEvidence: true });
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
          <div
            className="bg-gradient-to-br from-[#EF4444] to-[#DC2626] p-6 flex items-center justify-between"
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <AlertTriangle size={24} className="text-white" />
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>
                  Registrar Merma
                </h2>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Documentar pérdida de producto
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
            {/* Alert Notice */}
            <div className="rounded-[16px] bg-[#FEF2F2] dark:bg-[#3B1515] border border-[#EF4444]/20 dark:border-[#EF4444]/30 p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: isDark ? '#FCA5A5' : '#DC2626', marginBottom: '4px' }}>
                  Registro de Merma
                </div>
                <div style={{ fontSize: '12px', color: isDark ? '#FCA5A5' : '#991B1B', lineHeight: '1.5' }}>
                  Este registro es importante para el control de inventario y el análisis de pérdidas.
                  Asegúrate de proporcionar información precisa.
                </div>
              </div>
            </div>

            {/* Lot & Product Info */}
            <div className="space-y-4">
              <h3 className="text-[#1B4332] dark:text-emerald-300" style={{ fontSize: '16px', fontWeight: '600' }}>
                Información del Lote
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
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
                            setFormData((prev) => ({ ...prev, inventoryItemId: 0, lotNumber: '', productName: '', unit: 'kg' }));
                          }
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Buscar producto o número de lote…"
                        className="w-full pl-9 pr-8 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white dark:placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
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
                                className={`w-full px-4 py-2.5 text-left hover:bg-[#F3F4F6] dark:hover:bg-[#3A3A3C] transition-colors first:rounded-t-[14px] last:rounded-b-[14px] ${formData.inventoryItemId === item.id ? 'bg-[#EF4444]/10 dark:bg-[#EF4444]/20' : ''}`}
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

                {selectedItem && (
                  <div className="md:col-span-2 rounded-[12px] bg-[#FEF2F2] dark:bg-[#3B1515] border border-[#EF4444]/20 px-4 py-3 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[#9CA3AF]" style={{ fontSize: '11px' }}>Número de lote</p>
                      <p className="font-mono font-semibold text-[#DC2626] dark:text-[#FCA5A5]" style={{ fontSize: '13px' }}>{selectedItem.lot_number}</p>
                    </div>
                    <div>
                      <p className="text-[#9CA3AF]" style={{ fontSize: '11px' }}>Stock disponible</p>
                      <p className="font-bold text-[#1B4332] dark:text-[#E5E7EB]" style={{ fontSize: '13px' }}>{selectedItem.quantity} {selectedItem.unit}</p>
                    </div>
                    <div>
                      <p className="text-[#9CA3AF]" style={{ fontSize: '11px' }}>Categoría</p>
                      <p className="font-semibold text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px' }}>{selectedItem.category}</p>
                    </div>
                  </div>
                )}

                {/* Lot Number (read-only) */}
                <div>
                  <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                    <Hash size={16} />
                    Número de Lote
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formData.lotNumber}
                    className="w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white opacity-70 cursor-default"
                    placeholder="Se rellena al seleccionar lote"
                    style={{ fontSize: '14px' }}
                  />
                </div>

                {/* Product Name (read-only) */}
                <div>
                  <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                    <FileText size={16} />
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formData.productName}
                    className="w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white opacity-70 cursor-default"
                    placeholder="Se rellena al seleccionar lote"
                    style={{ fontSize: '14px' }}
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                    <Weight size={16} />
                    Cantidad de Merma
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step={packSize || '0.01'}
                    max={selectedItem?.quantity}
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className={`w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border-2 dark:text-white dark:placeholder-[#6B7280] focus:outline-none transition-all ${
                      (selectedItem && formData.quantity > selectedItem.quantity) || breaksPackage
                        ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/50'
                        : 'border-gray-200 dark:border-[#3A3A3C] focus:ring-2 focus:ring-[#EF4444]/50 focus:bg-white dark:focus:bg-[#3A3A3C]'
                    }`}
                    placeholder="0"
                    style={{ fontSize: '14px' }}
                  />
                  {selectedItem && formData.quantity > selectedItem.quantity && (
                    <p className="mt-1.5 text-xs font-semibold text-[#EF4444]">
                      ⚠️ Excede el stock disponible ({selectedItem.quantity} {selectedItem.unit})
                    </p>
                  )}
                  {breaksPackage && !(selectedItem && formData.quantity > selectedItem.quantity) && (
                    <p className="mt-1.5 text-xs font-semibold text-[#EF4444]">
                      ❌ {formData.quantity} {packUnit} rompe un empaque — solo múltiplos de {packSize} {packUnit} ({packName})
                    </p>
                  )}
                  {packSize && selectedItem && validMultiples.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {validMultiples.slice(0, 8).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setFormData({ ...formData, quantity: v })}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                            formData.quantity === v
                              ? 'bg-[#EF4444] text-white shadow'
                              : 'bg-[#FEF2F2] dark:bg-[#3B1515] text-[#EF4444] hover:bg-[#EF4444] hover:text-white'
                          }`}
                        >
                          {v} {packUnit}
                        </button>
                      ))}
                      {validMultiples.length > 8 && (
                        <span className="px-2.5 py-1 text-[11px] text-[#9CA3AF]">+{validMultiples.length - 8} más</span>
                      )}
                    </div>
                  )}
                  {selectedItem && formData.quantity <= selectedItem.quantity && formData.quantity > 0 && !breaksPackage && (
                    <p className="mt-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      Disponible: {selectedItem.quantity} {selectedItem.unit}
                    </p>
                  )}
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
                    className="w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EF4444]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
                    style={{ fontSize: '14px' }}
                  >
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="L">Litros (L)</option>
                    <option value="caja">Cajas (varios pesos/vol.)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reason & Evidence */}
            <div className="space-y-4">
              <h3 className="text-[#1B4332] dark:text-emerald-300" style={{ fontSize: '16px', fontWeight: '600' }}>
                Motivo y Evidencia
              </h3>

              {/* Reason */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                  <FileText size={16} />
                  Motivo de la Merma
                </label>
                <select
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EF4444]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
                  style={{ fontSize: '14px' }}
                >
                  <option value="">Seleccionar motivo</option>
                  <option value="vencimiento">Producto Vencido</option>
                  <option value="daño">Daño en Empaque</option>
                  <option value="contaminacion">Contaminación</option>
                  <option value="plagas">Plagas</option>
                  <option value="humedad">Daño por Humedad</option>
                  <option value="derrame">Derrame o Fuga</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Evidence Upload */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                  <Camera size={16} />
                  Evidencia Fotográfica (Opcional)
                </label>

                {!evidenceFile ? (
                  <button
                    type="button"
                    onClick={handleFileUpload}
                    className="w-full p-6 rounded-[16px] border-2 border-dashed border-gray-300 dark:border-[#3A3A3C] hover:border-[#0071E3] dark:hover:border-[#0071E3] hover:bg-[#0071E3]/5 dark:hover:bg-[#0071E3]/10 transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#2C2C2E] group-hover:bg-[#0071E3]/10 flex items-center justify-center transition-all">
                      <Upload size={24} className="text-gray-400 group-hover:text-[#0071E3]" />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: isDark ? '#9CA3AF' : '#6B7280' }}>
                      Subir Foto
                    </div>
                    <div style={{ fontSize: '12px', color: isDark ? '#6B7280' : '#9CA3AF' }}>
                      JPG, PNG (Max 5MB)
                    </div>
                  </button>
                ) : (
                  <div className="p-4 rounded-[16px] bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center">
                        <Camera size={20} className="text-white" />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#059669' }}>
                          Evidencia Cargada
                        </div>
                        <div style={{ fontSize: '11px', color: '#047857' }}>
                          {evidenceFile}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEvidenceFile('');
                        setFormData({ ...formData, hasEvidence: false });
                      }}
                      className="text-[#EF4444] hover:text-[#DC2626] transition-colors"
                      style={{ fontSize: '12px', fontWeight: '500' }}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                  <FileText size={16} />
                  Notas Adicionales (Opcional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white dark:placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all resize-none"
                  placeholder="Descripción adicional del incidente..."
                  style={{ fontSize: '14px' }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className="flex gap-3 pt-6 mt-2 border-t border-gray-200 dark:border-[#3A3A3C]"
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
                boxShadow: isDark ? '0 -4px 12px rgba(0, 0, 0, 0.3)' : '0 -4px 12px rgba(0, 0, 0, 0.05)',
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
                className="flex-1 py-3 rounded-[16px] bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ fontSize: '15px', fontWeight: '600', boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)' }}
              >
                Registrar Merma
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}