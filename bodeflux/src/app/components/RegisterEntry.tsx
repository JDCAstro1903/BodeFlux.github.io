import { X, Package, Calendar, MapPin, Building2, Hash, Weight, Search, Star, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { providerApi, type ProviderAPI, productApi, type ProductAPI } from '../services/api';

interface RegisterEntryProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: EntryData) => void;
}

export interface EntryData {
  productId?: number;
  presentationId?: number;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  lotNumber: string;
  expiryDate: string;
  location: string;
  provider: string;
  providerId?: number;
  receiptDate: string;
  price: number;
}

export function RegisterEntry({ isOpen, onClose, onSubmit }: RegisterEntryProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [providers, setProviders] = useState<ProviderAPI[]>([]);
  const [providerSearch, setProviderSearch] = useState('');
  const [products, setProducts] = useState<ProductAPI[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductAPI | null>(null);

  useEffect(() => {
    providerApi.list().then(setProviders).catch(console.error);
    productApi.list().then(setProducts).catch(console.error);
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleSelectProduct = (product: ProductAPI) => {
    setSelectedProduct(product);
    const date = new Date();
    const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const idPart = String(product.id).padStart(3, '0');
    const lotNumber = `LOT-${idPart}-${stamp}`;
    setFormData({
      ...formData,
      productId: product.id,
      productName: product.name,
      category: product.category,
      unit: product.unit,
      lotNumber,
      price: product.price,
      provider: product.provider_name || formData.provider,
      providerId: product.provider_id ?? formData.providerId,
    });
    if (product.provider_name) setProviderSearch(product.provider_name);
    setProductSearch(product.name);
    setShowProductDropdown(false);
  };

  const [formData, setFormData] = useState<EntryData>({
    productId: undefined,
    presentationId: undefined,
    productName: '',
    category: '',
    quantity: 0,
    unit: 'kg',
    lotNumber: '',
    expiryDate: '',
    location: '',
    provider: '',
    providerId: undefined,
    receiptDate: new Date().toISOString().split('T')[0],
    price: 0,
  });

  // Track occupied locations
  const occupiedLocations = ['A-3', 'B-1', 'C-2']; // In production, this would come from API/state

  const isLocationOccupied = (location: string) => {
    return occupiedLocations.includes(location);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate location is selected
    if (!formData.location) {
      alert('Por favor selecciona una ubicación en el almacén');
      return;
    }

    onSubmit(formData);
    setFormData({
      productId: undefined,
      presentationId: undefined,
      productName: '',
      category: '',
      quantity: 0,
      unit: 'kg',
      lotNumber: '',
      expiryDate: '',
      location: '',
      provider: '',
      providerId: undefined,
      receiptDate: new Date().toISOString().split('T')[0],
      price: 0,
    });
    setSelectedProduct(null);
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
        <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] p-6 rounded-t-[32px] flex items-center justify-between"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Package size={24} className="text-white" />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>
                Registrar Entrada
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
                Nueva entrada de producto al inventario
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
              Información del Producto
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="relative">
                <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                  <Package size={16} />
                  Nombre del Producto
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    required
                    value={productSearch || formData.productName}
                    onFocus={() => setShowProductDropdown(true)}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setFormData({ ...formData, productName: e.target.value });
                      setShowProductDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowProductDropdown(false), 150)}
                    className="w-full pl-8 pr-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white dark:placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
                    placeholder="Buscar producto..."
                    style={{ fontSize: '14px' }}
                  />
                </div>
                {showProductDropdown && filteredProducts.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full rounded-[14px] bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                    {filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onMouseDown={() => handleSelectProduct(p)}
                        className="w-full px-4 py-2.5 text-left hover:bg-[#F3F4F6] dark:hover:bg-[#3A3A3C] flex items-center gap-3 transition-colors"
                      >
                        <span style={{ fontSize: '18px' }}>{p.image_emoji}</span>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: isDark ? '#E5E7EB' : '#1B4332' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: '#6B7280' }}>{p.category} · {p.unit}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Presentation (if available) */}
              {selectedProduct?.presentations && selectedProduct.presentations.length > 0 && (
                <div>
                  <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                    <Package size={16} />
                    Presentación
                  </label>
                  <select
                    value={formData.presentationId || ''}
                    onChange={(e) => setFormData({ ...formData, presentationId: Number(e.target.value) || undefined })}
                    className="w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
                    style={{ fontSize: '14px' }}
                  >
                    <option value="">Cantidad unitaria / sin presentación</option>
                    {selectedProduct.presentations.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.presentation_name} ({p.content_value} {p.content_unit})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                  <Package size={16} />
                  Categoría
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
                  style={{ fontSize: '14px' }}
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="Fertilizantes">Fertilizantes</option>
                  <option value="Semillas">Semillas</option>
                  <option value="Pesticidas">Pesticidas</option>
                  <option value="Herbicidas">Herbicidas</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                  <Weight size={16} />
                  Cantidad
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

              {/* Price */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                  <DollarSign size={16} />
                  Precio Unitario
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" style={{ fontSize: '14px', fontWeight: '600' }}>$</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-7 pr-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white dark:placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
                    placeholder="0.00"
                    style={{ fontSize: '14px' }}
                  />
                </div>
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
            </div>
          </div>

          {/* Lot & Dates */}
          <div className="space-y-4">
            <h3 className="text-[#1B4332] dark:text-emerald-300" style={{ fontSize: '16px', fontWeight: '600' }}>
              Información de Lote y Fechas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Lot Number */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                  <Hash size={16} />
                  Número de Lote
                </label>
                <input
                  type="text"
                  required
                  value={formData.lotNumber}
                  onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white dark:placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
                  placeholder="LOT-2026-XXX"
                  style={{ fontSize: '14px' }}
                />
              </div>

              {/* Receipt Date */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                  <Calendar size={16} />
                  Fecha de Recepción
                </label>
                <input
                  type="date"
                  required
                  value={formData.receiptDate}
                  onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
                  style={{ fontSize: '14px' }}
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                  <Calendar size={16} />
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
                  style={{ fontSize: '14px' }}
                />
              </div>
            </div>
          </div>

          {/* Location & Provider */}
          <div className="space-y-4">
            <h3 className="text-[#1B4332] dark:text-emerald-300" style={{ fontSize: '16px', fontWeight: '600' }}>
              Ubicación y Proveedor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location Visual Selector */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 mb-3 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                  <MapPin size={16} />
                  Ubicación en Almacén
                </label>

                <div
                  className="p-5 rounded-[20px] bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] dark:from-[#2C2C2E] dark:to-[#1C1C1E] border border-gray-200 dark:border-[#3A3A3C]"
                >
                  {/* Selected Location Display */}
                  {formData.location ? (
                    <div className="mb-4 p-3 rounded-[12px] bg-white dark:bg-[#3A3A3C] border-2 border-[#0071E3]/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[#0071E3]" />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: isDark ? '#E5E7EB' : '#1B4332' }}>
                          {formData.location}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, location: '' })}
                        className="text-[#6B7280] hover:text-[#EF4444] transition-colors"
                        style={{ fontSize: '12px', fontWeight: '500' }}
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 rounded-[12px] bg-[#0071E3]/10 border border-[#0071E3]/20 flex items-center gap-2">
                      <MapPin size={16} className="text-[#0071E3]" />
                      <span style={{ fontSize: '13px', fontWeight: '500', color: isDark ? '#93C5FD' : '#1B4332' }}>
                        Selecciona una ubicación disponible
                      </span>
                    </div>
                  )}

                  {/* Location Grid */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {['A-1', 'A-2', 'A-3', 'B-1', 'B-2', 'B-3', 'C-1', 'C-2', 'C-3'].map((location) => {
                      const isOccupied = isLocationOccupied(location);
                      const isSelected = formData.location === `Pasillo ${location}`;

                      return (
                        <button
                          key={location}
                          type="button"
                          onClick={() => !isOccupied && setFormData({ ...formData, location: `Pasillo ${location}` })}
                          disabled={isOccupied}
                          className={`
                            relative p-3 sm:p-4 rounded-[12px] sm:rounded-[16px] transition-all transform
                            ${isSelected
                              ? 'bg-gradient-to-br from-[#0071E3] to-[#005BB5] border-2 border-[#0071E3] scale-105 shadow-lg'
                              : isOccupied
                              ? 'bg-gray-300 dark:bg-[#3A3A3C] border-2 border-gray-400 dark:border-[#4A4A4C] cursor-not-allowed opacity-60'
                              : 'bg-white dark:bg-[#2C2C2E] border-2 border-gray-200 dark:border-[#4A4A4C] hover:border-[#0071E3]/50 hover:shadow-md hover:scale-105'
                            }
                          `}
                        >
                          {/* Location Label */}
                          <div
                            className="text-center mb-1 sm:mb-2"
                            style={{
                              fontSize: '14px',
                              fontWeight: '700',
                              color: isSelected ? 'white' : isOccupied ? '#6B7280' : isDark ? '#E5E7EB' : '#1B4332',
                            }}
                          >
                            {location}
                          </div>

                          {/* Status Badge */}
                          <div className="text-center">
                            {isSelected ? (
                              <span
                                className="inline-block px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20"
                                style={{ fontSize: '9px', fontWeight: '600', color: 'white' }}
                              >
                                Selec.
                              </span>
                            ) : isOccupied ? (
                              <span
                                className="inline-block px-1.5 sm:px-2 py-0.5 rounded-full bg-[#EF4444]/20"
                                style={{ fontSize: '9px', fontWeight: '600', color: '#DC2626' }}
                              >
                                Ocup.
                              </span>
                            ) : (
                              <span
                                className="inline-block px-1.5 sm:px-2 py-0.5 rounded-full bg-[#10B981]/10"
                                style={{ fontSize: '9px', fontWeight: '600', color: '#059669' }}
                              >
                                Disp.
                              </span>
                            )}
                          </div>

                          {/* Selection Indicator */}
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                              <span style={{ fontSize: '14px' }}>✓</span>
                            </div>
                          )}

                          {/* Occupied Indicator */}
                          {isOccupied && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#EF4444] flex items-center justify-center">
                              <X size={14} className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-300 dark:border-[#3A3A3C]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                      <span className="text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '11px' }}>Disponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      <span className="text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '11px' }}>Ocupado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#0071E3]" />
                      <span className="text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '11px' }}>Seleccionado</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Provider Visual Selector */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 mb-3 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                  <Building2 size={16} />
                  Proveedor
                </label>

                <div className="p-4 rounded-[20px] bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] dark:from-[#2C2C2E] dark:to-[#1C1C1E] border border-gray-200 dark:border-[#3A3A3C]">
                  {/* Selected Provider Display */}
                  {formData.provider ? (
                    <div className="mb-3 p-3 rounded-[12px] bg-white dark:bg-[#3A3A3C] border-2 border-[#0071E3]/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-[#0071E3]" />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: isDark ? '#E5E7EB' : '#1B4332' }}>
                          {formData.provider}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, provider: '' })}
                        className="text-[#6B7280] hover:text-[#EF4444] transition-colors"
                        style={{ fontSize: '12px', fontWeight: '500' }}
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <div className="mb-3 p-3 rounded-[12px] bg-[#0071E3]/10 border border-[#0071E3]/20 flex items-center gap-2">
                      <Building2 size={16} className="text-[#0071E3]" />
                      <span style={{ fontSize: '13px', fontWeight: '500', color: isDark ? '#93C5FD' : '#1B4332' }}>
                        Selecciona un proveedor
                      </span>
                    </div>
                  )}

                  {/* Search */}
                  <div className="relative mb-3">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      type="text"
                      placeholder="Buscar proveedor..."
                      value={providerSearch}
                      onChange={(e) => setProviderSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-[10px] bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#4A4A4C] text-[#1B4332] dark:text-[#E5E7EB] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0071E3]/50 transition-colors"
                      style={{ fontSize: '13px' }}
                    />
                  </div>

                  {/* Providers Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {providers
                      .filter((p) => p.name.toLowerCase().includes(providerSearch.toLowerCase()))
                      .map((provider) => {
                      const isSelected = formData.provider === provider.name;

                      return (
                        <button
                          key={provider.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, provider: provider.name, providerId: provider.id })}
                          className={`
                            relative p-3 rounded-[12px] transition-all text-left
                            ${isSelected
                              ? 'bg-gradient-to-br from-[#0071E3] to-[#005BB5] border-2 border-[#0071E3] shadow-md'
                              : 'bg-white dark:bg-[#2C2C2E] border-2 border-gray-200 dark:border-[#4A4A4C] hover:border-[#0071E3]/50 hover:shadow-sm'
                            }
                          `}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1 min-w-0 pr-2">
                              <div
                                className="truncate"
                                style={{
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  color: isSelected ? 'white' : isDark ? '#E5E7EB' : '#1B4332',
                                }}
                              >
                                {provider.name}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                                <span style={{ fontSize: '12px' }}>✓</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span
                              className="inline-block px-2 py-0.5 rounded-full"
                              style={{
                                fontSize: '10px',
                                fontWeight: '600',
                                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : isDark ? '#3A3A3C' : '#F3F4F6',
                                color: isSelected ? 'rgba(255, 255, 255, 0.9)' : isDark ? '#9CA3AF' : '#6B7280',
                              }}
                            >
                              {provider.category}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star size={11} className={isSelected ? 'text-yellow-300' : 'text-yellow-400'} fill="currentColor" />
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  color: isSelected ? 'rgba(255, 255, 255, 0.9)' : isDark ? '#9CA3AF' : '#6B7280',
                                }}
                              >
                                {provider.rating}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
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
              className="flex-1 py-3 rounded-[16px] bg-gradient-to-br from-[#1B4332] to-[#0071E3] text-white hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontSize: '15px', fontWeight: '600', boxShadow: '0 8px 24px rgba(27, 67, 50, 0.3)' }}
            >
              Registrar Entrada
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}