/**
 * AgroStack API Client
 * Centralized service layer for all backend communication.
 */

const _rawBase: string = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000/api';
// Ensure the URL is always absolute (guards against missing protocol in env var)
const API_BASE = _rawBase.startsWith('http') ? _rawBase : `https://${_rawBase}`;

function getToken(): string | null {
  return localStorage.getItem('agrostack_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// =====================
// AUTH
// =====================
export interface LoginPayload {
  employee_id: string;
  password: string;
}

export interface UserData {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  role: 'warehouse' | 'sales' | 'executive';
  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserData;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: () => request<UserData>('/auth/me'),
};

// =====================
// INVENTORY
// =====================
export interface InventoryItemAPI {
  id: number;
  product_id: number | null;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  lot_number: string;
  expiry_date: string;
  location: string;
  provider: string | null;
  provider_id: number | null;
  receipt_date: string;
  status: string;
  registered_by_id: number | null;
  registered_by_name: string | null;
  presentation_id: number | null;
  presentation_name?: string | null;
  presentation_value?: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface InventoryItemWithAlertAPI extends InventoryItemAPI {
  days_left: number;
  alert_level: string;
}

export interface InventoryCreatePayload {
  product_id?: number;
  presentation_id?: number;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  lot_number: string;
  expiry_date: string;
  location: string;
  provider?: string;
  provider_id?: number;
  receipt_date: string;
}

export interface OutputPayload {
  quantity: number;
  destination: string;
  lot_number?: string;
  notes?: string;
}

export interface WarehouseProductInfoAPI {
  product_name: string;
  lot_number: string;
  quantity: number;
  unit: string;
  expiry_date: string | null;
  days_left: number | null;
}

export interface WarehouseMapCellAPI {
  code: string;
  row_label: string;
  col_number: number;
  location_type: string;
  is_enabled: boolean;
  max_capacity: number;
  capacity_unit: string;
  used_capacity: number;
  occupancy_percent: number;
  status: string;
  products: WarehouseProductInfoAPI[];
}

export interface WarehouseSummaryAPI {
  total_locations: number;
  occupied_locations: number;
  empty_locations: number;
  full_locations: number;
  overall_occupancy_percent: number;
  alert_level: string;
}

export interface InventoryMovementAPI {
  id: number;
  inventory_item_id: number;
  movement_type: 'entry' | 'output' | 'waste';
  quantity: number;
  user_id: number | null;
  destination: string | null;
  notes: string | null;
  created_at: string | null;
  product_name: string | null;
  unit: string | null;
  lot_number: string | null;
  user_name: string | null;
}

export const inventoryApi = {
  list: (status?: string) =>
    request<InventoryItemAPI[]>(`/inventory/${status ? `?status=${status}` : ''}`),
  alerts: () =>
    request<InventoryItemWithAlertAPI[]>('/inventory/alerts'),
  locations: () =>
    request<WarehouseMapCellAPI[]>('/inventory/locations'),
  locationSummary: () =>
    request<WarehouseSummaryAPI>('/inventory/locations/summary'),
  productNames: () =>
    request<string[]>('/inventory/product-names'),
  movements: (movementType?: string, limit = 200) => {
    const params = new URLSearchParams();
    if (movementType) params.set('movement_type', movementType);
    params.set('limit', String(limit));
    return request<InventoryMovementAPI[]>(`/inventory/movements?${params.toString()}`);
  },
  get: (id: number) =>
    request<InventoryItemAPI>(`/inventory/${id}`),
  create: (payload: InventoryCreatePayload) =>
    request<InventoryItemAPI>('/inventory/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: Partial<InventoryItemAPI>) =>
    request<InventoryItemAPI>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  delete: (id: number) =>
    request<void>(`/inventory/${id}`, { method: 'DELETE' }),
  output: (id: number, payload: OutputPayload) =>
    request<InventoryItemAPI>(`/inventory/${id}/output`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// =====================
// PROVIDERS
// =====================
export interface ProviderAPI {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  status: string;
  created_at: string | null;
}

export interface ProviderCreatePayload {
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  category: string;
}

export const providerApi = {
  list: (search?: string, category?: string, minRating?: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (minRating !== undefined) params.set('min_rating', String(minRating));
    const qs = params.toString();
    return request<ProviderAPI[]>(`/providers/${qs ? `?${qs}` : ''}`);
  },
  get: (id: number) => request<ProviderAPI>(`/providers/${id}`),
  create: (payload: ProviderCreatePayload) =>
    request<ProviderAPI>('/providers/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: Partial<ProviderAPI>) =>
    request<ProviderAPI>(`/providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  delete: (id: number) =>
    request<void>(`/providers/${id}`, { method: 'DELETE' }),
};

// =====================
// PRODUCTS & PRESENTATIONS
// =====================
export interface PresentationAPI {
  id: number;
  presentation_name: string;
  content_value: number;
  content_unit: string;
  price_override: number | null;
  is_default: boolean;
  is_active: boolean;
}

export interface ProductAPI {
  id: number;
  name: string;
  category: string;
  stock: number;
  price: number;
  unit: string;
  status: string;
  image_emoji: string;
  provider_id: number | null;
  provider_name: string | null;
  created_at: string | null;
  presentations: PresentationAPI[];
}

export interface ProductCreatePayload {
  name: string;
  category: string;
  stock?: number;
  price: number;
  unit: string;
  image_emoji?: string;
  provider_id?: number;
  provider_name?: string;
}

export const productApi = {
  list: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    const qs = params.toString();
    return request<ProductAPI[]>(`/products/${qs ? `?${qs}` : ''}`);
  },
  get: (id: number) => request<ProductAPI>(`/products/${id}`),
  create: (payload: ProductCreatePayload) =>
    request<ProductAPI>('/products/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: Partial<ProductAPI>) =>
    request<ProductAPI>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};

// =====================
// SALES
// =====================
export interface SaleItemPayload {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
}

export interface SaleCreatePayload {
  customer_name?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  items: SaleItemPayload[];
}

export interface SaleResponseAPI {
  id: number;
  customer_name?: string | null;
  subtotal: number;
  discount_type: string | null;
  discount_value: number;
  discount_amount: number;
  tax: number;
  total: number;
  status: string;
  items: {
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    original_price: number;
    discount_type: string | null;
    discount_value: number;
    unit_price: number;
    total_price: number;
  }[];
  created_at: string | null;
}

export const salesApi = {
  list: () => request<SaleResponseAPI[]>('/sales/'),
  create: (payload: SaleCreatePayload) =>
    request<SaleResponseAPI>('/sales/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// =====================
// WASTE
// =====================
export interface WasteCreatePayload {
  inventory_item_id?: number;
  lot_number: string;
  product_name: string;
  quantity: number;
  unit: string;
  reason: string;
  has_evidence?: boolean;
  notes?: string;
  waste_date: string;
}

export const wasteApi = {
  list: () => request<any[]>('/waste/'),
  create: (payload: WasteCreatePayload) =>
    request<any>('/waste/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// =====================
// DASHBOARD
// =====================
export interface KPIsAPI {
  inventory_value: string;
  inventory_delta: string;
  avoided_waste: string;
  avoided_waste_delta: string;
  avg_response_time: string;
  avg_response_delta: string;
  active_products: number;
  movements_today: number;
  active_users: number;
  rotation_rate: string;
  rotation_delta: string;
  fulfillment: string;
  fulfillment_delta: string;
  response_time: string;
  response_delta: string;
  stock_accuracy: string;
  stock_delta: string;
  profit_margin: string;
  profit_margin_delta: string;
  waste_this_month: number;
}

export interface ChartPointAPI {
  label: string;
  value: number;
  value2?: number;
}

export interface TopProductAPI {
  name: string;
  sales: number;
  revenue: number;
}

export interface TopProviderAPI {
  name: string;
  rating: number;
  orders: number;
  on_time: number;
}

// =====================
// PROVIDER ORDERS
// =====================
export interface ProviderOrderItemAPI {
  id: number;
  order_id: number;
  product_name: string;
  quantity: number;
  unit: string;
}

export interface ProviderOrderAPI {
  id: number;
  provider_id: number | null;
  provider_name: string | null;
  status: 'pending' | 'sent' | 'received' | 'cancelled';
  notes: string | null;
  created_at: string | null;
  items: ProviderOrderItemAPI[];
}

export interface ProviderOrderCreatePayload {
  provider_id?: number;
  provider_name?: string;
  notes?: string;
  items: { product_name: string; quantity: number; unit: string }[];
}

export const providerOrderApi = {
  list: () => request<ProviderOrderAPI[]>('/provider-orders/'),
  get: (id: number) => request<ProviderOrderAPI>(`/provider-orders/${id}`),
  create: (payload: ProviderOrderCreatePayload) =>
    request<ProviderOrderAPI>('/provider-orders/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: { status?: string; notes?: string }) =>
    request<ProviderOrderAPI>(`/provider-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  delete: (id: number) =>
    request<void>(`/provider-orders/${id}`, { method: 'DELETE' }),
};

// =====================
// USERS (admin)
// =====================
export interface UserCreatePayload {
  name: string;
  employee_id: string;
  email?: string;
  role: 'warehouse' | 'sales';
  password: string;
}

export const usersApi = {
  list: () => request<UserData[]>('/users/'),
  create: (payload: UserCreatePayload) =>
    request<UserData>('/users/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: { is_active: boolean }) =>
    request<UserData>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};

export const dashboardApi = {
  kpis: () => request<KPIsAPI>('/dashboard/kpis'),
  stockChart: () => request<ChartPointAPI[]>('/dashboard/charts/stock'),
  categoriesChart: () => request<ChartPointAPI[]>('/dashboard/charts/categories'),
  revenueChart: () => request<ChartPointAPI[]>('/dashboard/charts/revenue'),
  movementsChart: () => request<ChartPointAPI[]>('/dashboard/charts/movements'),
  wasteChart: () => request<ChartPointAPI[]>('/dashboard/charts/waste'),
  topProducts: () => request<TopProductAPI[]>('/dashboard/top-products'),
  topProviders: () => request<TopProviderAPI[]>('/dashboard/top-providers'),
};
