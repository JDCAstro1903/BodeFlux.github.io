import { createContext, useContext, useState, ReactNode } from 'react';

export interface InventoryItem {
  id: string;
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

function getDaysLeft(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getAlertLevel(daysLeft: number): InventoryItemWithAlert['alertLevel'] {
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 15) return 'critical';
  if (daysLeft <= 30) return 'warning';
  return 'healthy';
}

interface InventoryContextType {
  items: InventoryItem[];
  itemsWithAlerts: InventoryItemWithAlert[];
  criticalItems: InventoryItemWithAlert[];
  warningItems: InventoryItemWithAlert[];
  healthyItems: InventoryItemWithAlert[];
  expiredItems: InventoryItemWithAlert[];
  addItem: (item: Omit<InventoryItem, 'id' | 'status'>) => void;
  removeItem: (id: string, reason: 'output' | 'waste') => void;
  prioritizeItem: (id: string) => void;
  prioritizedId: string | null;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [prioritizedId, setPrioritizedId] = useState<string | null>(null);

  const activeItems = items.filter((i) => i.status === 'active');

  const itemsWithAlerts: InventoryItemWithAlert[] = activeItems.map((item) => {
    const daysLeft = getDaysLeft(item.expiryDate);
    return { ...item, daysLeft, alertLevel: getAlertLevel(daysLeft) };
  });

  const criticalItems = itemsWithAlerts.filter((i) => i.alertLevel === 'critical');
  const warningItems = itemsWithAlerts.filter((i) => i.alertLevel === 'warning');
  const healthyItems = itemsWithAlerts.filter((i) => i.alertLevel === 'healthy');
  const expiredItems = itemsWithAlerts.filter((i) => i.alertLevel === 'expired');

  const addItem = (item: Omit<InventoryItem, 'id' | 'status'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `INV-${Date.now()}`,
      status: 'active',
    };
    setItems((prev) => [newItem, ...prev]);
  };

  const removeItem = (id: string, reason: 'output' | 'waste') => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: reason } : item))
    );
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
        addItem,
        removeItem,
        prioritizeItem,
        prioritizedId,
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
