import { Package, QrCode, MapPin, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { ProviderManagement } from './ProviderManagement';
import { RegisterEntry, EntryData } from './RegisterEntry';
import { ScanOutput, OutputData } from './ScanOutput';
import { RegisterWaste, WasteData } from './RegisterWaste';
import { useState, useEffect } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { wasteApi, inventoryApi, productApi } from '../services/api';

export function WarehouseControl() {
  const { items, addItem, removeItem, locations, refreshInventory } = useInventory();
  const [showRegisterEntry, setShowRegisterEntry] = useState(false);
  const [showScanOutput, setShowScanOutput] = useState(false);
  const [showRegisterWaste, setShowRegisterWaste] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [lastEntry, setLastEntry] = useState<{ product: string; quantity: string; type: 'entry' | 'output' | 'waste' } | null>(null);

  // Active items as recent shipments
  const recentShipments = items
    .filter((i) => i.status === 'active')
    .slice(0, 10)
    .map((i) => ({
      id: i.lotNumber,
      product: i.productName,
      quantity: `${i.quantity} ${i.unit}`,
      location: i.location,
      expiry: i.expiryDate,
      status: 'Activo',
      inventoryId: i.id,
    }));

  const gridLocations = [...locations].sort((a, b) => {
    if (a.row_label !== b.row_label) return a.row_label.localeCompare(b.row_label);
    return a.col_number - b.col_number;
  });

  const handleEntrySubmit = async (entry: EntryData) => {
    try {
      let productId = entry.productId;

      if (!productId) {
        // New product — create it in the catalog first
        const created = await productApi.create({
          name: entry.productName,
          category: entry.category,
          stock: 0,
          price: entry.price,
          unit: entry.unit,
          provider_id: entry.providerId,
          provider_name: entry.provider || undefined,
        });
        productId = created.id;
      } else {
        // Update price and provider on existing product
        const updates: Record<string, unknown> = {};
        if (entry.price > 0) updates.price = entry.price;
        if (entry.providerId != null) {
          updates.provider_id = entry.providerId;
          updates.provider_name = entry.provider || undefined;
        }
        if (Object.keys(updates).length > 0) {
          await productApi.update(productId, updates);
        }
      }

      await addItem({
        productId: productId,
        presentationName: entry.presentationName,
        presentationValue: entry.presentationValue,
        productName: entry.productName,
        category: entry.category,
        quantity: entry.quantity,
        unit: entry.unit,
        lotNumber: entry.lotNumber,
        expiryDate: entry.expiryDate,
        location: entry.location,
        provider: entry.provider,
        providerId: entry.providerId,
        receiptDate: entry.receiptDate,
      });
      setLastEntry({
        product: entry.productName,
        quantity: entry.presentationValue
          ? `${entry.quantity} ${entry.presentationName} (${entry.quantity * entry.presentationValue} ${entry.unit})`
          : `${entry.quantity} ${entry.unit}`,
        type: 'entry',
      });
      setShowSuccessToast(true);
    } catch (err) {
      console.error('Error registering entry:', err);
    }
  };

  const handleOutputSubmit = async (output: OutputData) => {
    try {
      const itemId = output.inventoryItemId
        || items.find((i) => i.status === 'active' && i.lotNumber === output.lotNumber)?.numericId;
      if (itemId) {
        await inventoryApi.output(itemId, {
          quantity: output.quantity,
          destination: output.destination,
          lot_number: output.lotNumber,
        });
        await refreshInventory();
      }
      setLastEntry({ product: output.productName, quantity: `${output.quantity} ${output.unit}`, type: 'output' });
      setShowSuccessToast(true);
    } catch (err) {
      console.error('Error registering output:', err);
    }
  };

  const handleWasteSubmit = async (waste: WasteData) => {
    try {
      await wasteApi.create({
        inventory_item_id: waste.inventoryItemId || undefined,
        lot_number: waste.lotNumber,
        product_name: waste.productName,
        quantity: waste.quantity,
        unit: waste.unit,
        reason: waste.reason || 'otro',
        has_evidence: waste.hasEvidence || false,
        notes: waste.notes || '',
        waste_date: waste.wasteDate || new Date().toISOString().split('T')[0],
      });
      await refreshInventory();
      setLastEntry({ product: waste.productName, quantity: `${waste.quantity} ${waste.unit}`, type: 'waste' });
      setShowSuccessToast(true);
    } catch (err) {
      console.error('Error registering waste:', err);
    }
  };

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-[#1B4332] dark:text-[#34D399]">
          Control de Almacén
        </h1>
        <p className="text-sm md:text-base text-[#6B7280] dark:text-[#CBD5E1] mt-1">
          Gestión de entradas y salidas
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Register Entry Button */}
        <button
          onClick={() => setShowRegisterEntry(true)}
          className="group relative overflow-hidden rounded-[20px] md:rounded-[24px] bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] dark:from-[#34D399] dark:to-[#10B981] p-6 md:p-8 text-left hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ boxShadow: '0 12px 40px rgba(27, 67, 50, 0.2)' }}
        >
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-sm mb-3 md:mb-4">
              <Package size={24} className="md:w-7 md:h-7 text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
              Registrar Entrada
            </h3>
            <p className="text-xs md:text-sm text-white/80">
              Ingrese nuevos productos al inventario
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Scan Outgoing Button */}
        <button
          onClick={() => setShowScanOutput(true)}
          className="group relative overflow-hidden rounded-[20px] md:rounded-[24px] bg-gradient-to-br from-[#0071E3] to-[#005BB5] dark:from-[#60A5FA] dark:to-[#3B82F6] p-6 md:p-8 text-left hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ boxShadow: '0 12px 40px rgba(0, 113, 227, 0.2)' }}
        >
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-sm mb-3 md:mb-4">
              <QrCode size={24} className="md:w-7 md:h-7 text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
              Registrar Salida
            </h3>
            <p className="text-xs md:text-sm text-white/80">
              Registrar salida de productos del inventario
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Register Waste Button */}
        <button
          onClick={() => setShowRegisterWaste(true)}
          className="group relative overflow-hidden rounded-[20px] md:rounded-[24px] bg-gradient-to-br from-[#EF4444] to-[#DC2626] dark:from-[#DC2626] dark:to-[#991B1B] p-6 md:p-8 text-left hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] md:col-span-2 lg:col-span-1"
          style={{ boxShadow: '0 12px 40px rgba(239, 68, 68, 0.2)' }}
        >
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-sm mb-3 md:mb-4">
              <AlertTriangle size={24} className="md:w-7 md:h-7 text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
              Registrar Merma
            </h3>
            <p className="text-xs md:text-sm text-white/80">
              Documentar pérdidas de inventario
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Location Map Widget */}
      <div
        className="rounded-[20px] md:rounded-[24px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl p-4 md:p-6"
        style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }}
      >
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#1B4332] to-[#0071E3] dark:from-[#34D399] dark:to-[#60A5FA] flex items-center justify-center">
              <MapPin size={16} className="md:w-5 md:h-5 text-white" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-[#1B4332] dark:text-[#34D399]">
              Mapa de Ubicaciones
            </h3>
          </div>
          <span
            className="px-2 md:px-3 py-1 rounded-full bg-[#10B981]/10 dark:bg-[#34D399]/20 text-xs font-semibold text-[#10B981]"
          >
            En tiempo real
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 md:gap-3">
          {gridLocations.map((loc) => {
            return (
              <div
                key={loc.code}
                title={loc.products.map(p => `${p.product_name} (${p.quantity}${p.unit})`).join('\n')}
                className={`rounded-[12px] md:rounded-[16px] p-2 md:p-4 text-center transition-all hover:scale-105 cursor-pointer ${
                  loc.status === 'empty'
                    ? 'bg-white/50 dark:bg-[#334155]/50 border border-gray-200 dark:border-gray-600'
                    : loc.status === 'full'
                    ? 'bg-gradient-to-br from-[#EF4444]/20 to-[#DC2626]/20 border-2 border-[#DC2626]/50 dark:border-[#EF4444]/50'
                    : 'bg-gradient-to-br from-[#1B4332]/20 to-[#0071E3]/20 dark:from-[#10B981]/20 dark:to-[#3B82F6]/20 border-2 border-[#0071E3]/50 dark:border-[#3B82F6]/50'
                }`}
              >
                <div className="text-xs md:text-sm font-semibold text-[#1B4332] dark:text-[#34D399]">{loc.code}</div>
                <div className="text-[10px] md:text-xs text-[#6B7280] dark:text-[#CBD5E1] mt-0.5 md:mt-1">
                  {loc.occupancy_percent.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Inbound Shipments */}
      <div
        className="rounded-[20px] md:rounded-[24px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl p-4 md:p-6"
        style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }}
      >
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#1B4332] to-[#0071E3] dark:from-[#34D399] dark:to-[#60A5FA] flex items-center justify-center">
            <TrendingUp size={16} className="md:w-5 md:h-5 text-white" />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-[#1B4332] dark:text-[#34D399]">
            Ingresos Recientes
          </h3>
        </div>

        <div className="space-y-2 md:space-y-3">
          {recentShipments.length === 0 && (
            <div className="text-xs md:text-sm text-[#6B7280] dark:text-[#CBD5E1] py-6 text-center">
              Sin ingresos registrados
            </div>
          )}
          {recentShipments.map((shipment) => (
            <div
              key={shipment.id}
              className="rounded-[16px] md:rounded-[20px] bg-white/60 dark:bg-[#334155]/60 backdrop-blur-sm p-4 md:p-5 border border-white/50 dark:border-gray-600/50 hover:bg-white/80 dark:hover:bg-[#334155]/80 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div className="flex-1">
                  <div className="text-sm md:text-base font-semibold text-[#1B4332] dark:text-[#34D399] mb-1">
                    {shipment.product}
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-[#6B7280] dark:text-[#CBD5E1]">
                    <span className="px-2 py-0.5 rounded-full bg-[#0071E3]/10 dark:bg-[#60A5FA]/20 text-[10px] md:text-xs font-semibold text-[#0071E3] dark:text-[#60A5FA]">
                      {shipment.id}
                    </span>
                    <span>•</span>
                    <span>{shipment.quantity}</span>
                  </div>
                </div>
                <span
                  className="px-2 md:px-3 py-1 rounded-full bg-[#10B981]/10 dark:bg-[#34D399]/20 whitespace-nowrap text-[10px] md:text-xs font-semibold text-[#10B981]"
                >
                  {shipment.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 md:gap-3 pt-2 md:pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#6B7280] dark:text-[#CBD5E1]" />
                  <span className="text-xs md:text-sm text-[#6B7280] dark:text-[#CBD5E1]">{shipment.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#6B7280] dark:text-[#CBD5E1]" />
                  <span className="text-xs md:text-sm text-[#6B7280] dark:text-[#CBD5E1]">Vence: {shipment.expiry}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Provider Management */}
      <ProviderManagement />

      {/* Register Entry Modal */}
      <RegisterEntry
        isOpen={showRegisterEntry}
        onClose={() => setShowRegisterEntry(false)}
        onSubmit={handleEntrySubmit}
      />

      {/* Scan Output Modal */}
      <ScanOutput
        isOpen={showScanOutput}
        onClose={() => setShowScanOutput(false)}
        onSubmit={handleOutputSubmit}
      />

      {/* Register Waste Modal */}
      <RegisterWaste
        isOpen={showRegisterWaste}
        onClose={() => setShowRegisterWaste(false)}
        onSubmit={handleWasteSubmit}
      />

      {/* Success Toast */}
      {showSuccessToast && lastEntry && (
        <div className="fixed bottom-24 md:bottom-8 right-8 max-w-sm animate-slide-in-up z-50">
          <div
            className={`rounded-[20px] p-4 text-white flex items-center gap-3 ${
              lastEntry.type === 'entry'
                ? 'bg-gradient-to-br from-[#10B981] to-[#059669]'
                : lastEntry.type === 'output'
                ? 'bg-gradient-to-br from-[#0071E3] to-[#005BB5]'
                : 'bg-gradient-to-br from-[#EF4444] to-[#DC2626]'
            }`}
            style={{
              boxShadow: lastEntry.type === 'entry'
                ? '0 12px 40px rgba(16, 185, 129, 0.4)'
                : lastEntry.type === 'output'
                ? '0 12px 40px rgba(0, 113, 227, 0.4)'
                : '0 12px 40px rgba(239, 68, 68, 0.4)',
            }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              {lastEntry.type === 'waste' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                {lastEntry.type === 'entry' && '✓ Entrada Registrada'}
                {lastEntry.type === 'output' && '✓ Salida Procesada'}
                {lastEntry.type === 'waste' && '⚠ Merma Registrada'}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
                {lastEntry.product} - {lastEntry.quantity}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}