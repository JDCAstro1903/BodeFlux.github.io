import { X, AlertTriangle, Hash, Weight, FileText, Camera, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface RegisterWasteProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (waste: WasteData) => void;
}

export interface WasteData {
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

  const [formData, setFormData] = useState<WasteData>({
    lotNumber: '',
    productName: '',
    quantity: 0,
    unit: 'kg',
    reason: '',
    hasEvidence: false,
    notes: '',
    wasteDate: new Date().toISOString().split('T')[0],
  });

  const [evidenceFile, setEvidenceFile] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.lotNumber || !formData.productName || formData.quantity <= 0 || !formData.reason) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    onSubmit(formData);
    setFormData({
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
                {/* Lot Number */}
                <div>
                  <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                    <Hash size={16} />
                    Número de Lote
                  </label>
                  <select
                    required
                    value={formData.lotNumber}
                    onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EF4444]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
                    style={{ fontSize: '14px' }}
                  >
                    <option value="">Seleccionar lote</option>
                    {/* TODO: populate from backend lots list */}
                  </select>
                </div>

                {/* Product Name */}
                <div>
                  <label className="flex items-center gap-2 mb-2 text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: '13px', fontWeight: '500' }}>
                    <FileText size={16} />
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white dark:placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
                    placeholder="Ej: Fertilizante Orgánico Premium"
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
                    step="0.01"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white dark:placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
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
                    className="w-full px-4 py-3 rounded-[16px] bg-[#F3F4F6] dark:bg-[#2C2C2E] border border-gray-200 dark:border-[#3A3A3C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EF4444]/50 focus:bg-white dark:focus:bg-[#3A3A3C] transition-all"
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