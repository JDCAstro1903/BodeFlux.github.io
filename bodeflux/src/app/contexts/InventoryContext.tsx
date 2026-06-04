import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  inventoryApi,
  wasteApi,
  type InventoryItemAPI,
  type InventoryItemWithAlertAPI,
  type InventoryCreatePayload,
  type OutputPayload,
  type WasteCreatePayload,
  type WarehouseMapCellAPI,
  type WarehouseSummaryAPI,
} from '../services/api';

export interface InventoryItem {
  id: string;
  numericId: number;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  lotNumber: string;
  expiryDate: string; // YYYY-MM-DD
  location: string;
  provider: string;
  receiptDate: string;
  status: 'active' | 'output' | 'waste';
}

export interface InventoryItemWithAlert extends InventoryItem {
  daysLeft: number;
  alertLevel: 'critical' | 'warning' | 'healthy' | 'expired';
}

/** Map an API item to our frontend format */
function mapItem(api: InventoryItemAPI): InventoryItem {
  return {
    id: `INV-${api.id}`,
    numericId: api.id,
    productName: api.product_name,
    category: api.category,
    quantity: api.quantity,
    unit: api.unit,
    lotNumber: api.lot_number,
    expiryDate: api.expiry_date,
    location: api.location,
    provider: api.provider || '',
    receiptDate: api.receipt_date,
    status: api.status as InventoryItem['status'],
  };
}

function mapAlertItem(api: InventoryItemWithAlertAPI): InventoryItemWithAlert {
  return {
    ...mapItem(api),
    daysLeft: api.days_left,
    alertLevel: api.alert_level as InventoryItemWithAlert['alertLevel'],
  };
}

interface InventoryContextType {
  items: InventoryItem[];
  itemsWithAlerts: InventoryItemWithAlert[];
  criticalItems: InventoryItemWithAlert[];
  warningItems: InventoryItemWithAlert[];
  healthyItems: InventoryItemWithAlert[];
  expiredItems: InventoryItemWithAlert[];
  locations: WarehouseMapCellAPI[];
  locationSummary: WarehouseSummaryAPI | null;
  addItem: (item: Omit<InventoryItem, 'id' | 'status' | 'numericId'> & { productId?: number; providerId?: number; presentationName?: string; presentationValue?: number }) => Promise<void>;
  removeItem: (id: string, reason: 'output' | 'waste') => Promise<void>;
  registerWaste: (data: WasteCreatePayload) => Promise<void>;
  prioritizeItem: (id: string) => void;
  prioritizedId: string | null;
  refreshInventory: () => Promise<void>;
  isLoading: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [itemsWithAlerts, setItemsWithAlerts] = useState<InventoryItemWithAlert[]>([]);
  const [locations, setLocations] = useState<WarehouseMapCellAPI[]>([]);
  const [locationSummary, setLocationSummary] = useState<WarehouseSummaryAPI | null>(null);
  const [prioritizedId, setPrioritizedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshInventory = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rawItems, alertItems, locs, summary] = await Promise.all([
        inventoryApi.list('active'),
        inventoryApi.alerts(),
        inventoryApi.locations(),
        inventoryApi.locationSummary(),
      ]);
      setItems(rawItems.map(mapItem));
      setItemsWithAlerts(alertItems.map(mapAlertItem));
      setLocations(locs);
      setLocationSummary(summary);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshInventory();
  }, [refreshInventory]);

  const criticalItems = itemsWithAlerts.filter((i) => i.alertLevel === 'critical');
  const warningItems = itemsWithAlerts.filter((i) => i.alertLevel === 'warning');
  const healthyItems = itemsWithAlerts.filter((i) => i.alertLevel === 'healthy');
  const expiredItems = itemsWithAlerts.filter((i) => i.alertLevel === 'expired');

  const addItem = async (item: Omit<InventoryItem, 'id' | 'status' | 'numericId'> & { productId?: number; providerId?: number; presentationName?: string; presentationValue?: number }) => {
    const payload: InventoryCreatePayload = {
      product_id: item.productId,
      presentation_name: item.presentationName,
      presentation_value: item.presentationValue,
      product_name: item.productName,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      lot_number: item.lotNumber,
      expiry_date: item.expiryDate,
      location: item.location,
      provider: item.provider,
      provider_id: item.providerId,
      receipt_date: item.receiptDate,
    };
    await inventoryApi.create(payload);
    await refreshInventory();
  };

  const removeItem = async (id: string, reason: 'output' | 'waste') => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (reason === 'output') {
      const outputPayload: OutputPayload = {
        quantity: item.quantity,
        destination: 'Salida general',
      };
      await inventoryApi.output(item.numericId, outputPayload);
    }
    // For waste, use registerWaste separately
    await refreshInventory();
  };

  const registerWaste = async (data: WasteCreatePayload) => {
    await wasteApi.create(data);
    await refreshInventory();
  };

  const prioritizeItem = (id: string) => {
    setPrioritizedId(id);
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        itemsWithAlerts,
        criticalItems,
        warningItems,
        healthyItems,
        expiredItems,
        locations,
        locationSummary,
        addItem,
        removeItem,
        registerWaste,
        prioritizeItem,
        prioritizedId,
        refreshInventory,
        isLoading,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within an InventoryProvider');
  return context;
}
