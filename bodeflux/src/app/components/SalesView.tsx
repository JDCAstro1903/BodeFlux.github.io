import { Search, ShoppingCart, Package, TrendingUp, CheckCircle, AlertCircle, Plus, Minus, Truck, Send, Trash2, History, Receipt, ChevronDown, ChevronUp, RefreshCw, Download, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ShoppingCartModal } from './ShoppingCart';
import { productApi, salesApi, providerOrderApi, type ProductAPI, type SaleResponseAPI } from '../services/api';
import { generateSaleTicket } from '../utils/generateSaleTicket';
import { SaleTicketPreview } from './SaleTicketPreview';

interface Product {
  id: string;
  numericId: number;
  name: string;
  category: string;
  stock: number;
  price: number;
  unit: string;
  status: 'available' | 'low' | 'out';
  image: string;
  providerId: number | null;
  providerName: string | null;
}

function mapProduct(api: ProductAPI): Product {
  return {
    id: String(api.id),
    numericId: api.id,
    name: api.name,
    category: api.category,
    stock: api.stock,
    price: api.price,
    unit: api.unit,
    status: api.status as Product['status'],
    image: api.image_emoji,
    providerId: api.provider_id,
    providerName: api.provider_name,
  };
}

export function SalesView() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [showSupplierRequest, setShowSupplierRequest] = useState(false);
  const [supplierRequests, setSupplierRequests] = useState<{ [key: string]: number }>({});
  const [showCart, setShowCart] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [sales, setSales] = useState<SaleResponseAPI[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [expandedSale, setExpandedSale] = useState<number | null>(null);
  const [previewSale, setPreviewSale] = useState<SaleResponseAPI | null>(null);

  // Fetch products from API
  useEffect(() => {
    productApi.list().then((data) => {
      setProducts(data.map(mapProduct));
    }).catch(console.error);
  }, []);

  const fetchSales = () => {
    setLoadingSales(true);
    salesApi.list().then(setSales).catch(console.error).finally(() => setLoadingSales(false));
  };

  useEffect(() => {
    if (activeTab === 'history') fetchSales();
  }, [activeTab]);

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const cartTotal = Object.entries(cart).reduce((total, [productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return total + (product?.price || 0) * quantity;
  }, 0);

  const cartItems = Object.keys(cart).length;
  const supplierRequestItems = Object.keys(supplierRequests).length;

  const addToSupplierRequest = (productId: string) => {
    setSupplierRequests(prev => ({
      ...prev,
      [productId]: prev[productId] || 10,
    }));
  };

  const setRequestQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setSupplierRequests(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    } else {
      setSupplierRequests(prev => ({ ...prev, [productId]: quantity }));
    }
  };

  const removeFromSupplierRequest = (productId: string) => {
    setSupplierRequests(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const handleSendSupplierRequest = async () => {
    if (Object.keys(supplierRequests).length === 0) return;
    setSendingRequest(true);
    try {
      // Group items by provider — one order per provider (null = no provider)
      const groups = new Map<string, { providerId: number | null; providerName: string | null; items: { product_name: string; quantity: number; unit: string }[] }>();
      for (const [productId, quantity] of Object.entries(supplierRequests)) {
        const product = products.find((p) => p.id === productId)!;
        const key = product.providerId != null ? String(product.providerId) : 'none';
        if (!groups.has(key)) {
          groups.set(key, { providerId: product.providerId, providerName: product.providerName, items: [] });
        }
        groups.get(key)!.items.push({ product_name: product.name, quantity, unit: product.unit });
      }
      await Promise.all(
        [...groups.values()].map((g) =>
          providerOrderApi.create({
            provider_id: g.providerId ?? undefined,
            provider_name: g.providerName ?? undefined,
            items: g.items,
          })
        )
      );
      setSupplierRequests({});
      setShowSupplierRequest(false);
    } catch (err: any) {
      alert(`Error al enviar pedido: ${err.message}`);
    } finally {
      setSendingRequest(false);
    }
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      const newCart = { ...cart };
      delete newCart[productId];
      setCart(newCart);
    } else {
      setCart({ ...cart, [productId]: quantity });
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    const newCart = { ...cart };
    delete newCart[productId];
    setCart(newCart);
  };

  const handleCheckout = async (payload: { customerName: string; discountType?: 'percentage' | 'fixed'; discountValue?: number; customPrices: Record<string, number> }) => {
    try {
      const saleItems = Object.entries(cart).map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId)!;
        const unit_price = payload.customPrices[productId] ?? product.price;
        return {
          product_id: product.numericId,
          product_name: product.name,
          quantity,
          unit_price,
        };
      });
      const result = await salesApi.create({ 
        customer_name: payload.customerName || undefined, 
        discount_type: payload.discountType,
        discount_value: payload.discountValue,
        items: saleItems 
      });
      setPreviewSale(result);
      setCart({});
      setShowCart(false);
      // Refresh products and sales history
      const updated = await productApi.list();
      setProducts(updated.map(mapProduct));
      salesApi.list().then(setSales).catch(console.error);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalUnitsSold = sales.reduce((sum, s) => sum + s.items.reduce((a, i) => a + i.quantity, 0), 0);
  const formatUnits = (value: number) => new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1B4332' }}>
            {activeTab === 'catalog' ? 'Catálogo de Productos' : 'Historial de Ventas'}
          </h1>
          <p style={{ fontSize: '15px', color: '#6B7280', fontWeight: '400', marginTop: '4px' }}>
            {activeTab === 'catalog' ? 'Consulta disponibilidad y crea pedidos' : 'Registro de todas las ventas realizadas'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex rounded-[16px] bg-white/75 backdrop-blur-xl border border-white/50 p-1" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-[12px] transition-all flex items-center gap-2 ${
                activeTab === 'catalog'
                  ? 'bg-gradient-to-br from-[#0071E3] to-[#005BB5] text-white shadow-md'
                  : 'text-[#6B7280] hover:text-[#1B4332]'
              }`}
              style={{ fontSize: '13px', fontWeight: '600' }}
            >
              <ShoppingCart size={15} />
              <span className="hidden sm:inline">Catálogo</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-[12px] transition-all flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-gradient-to-br from-[#0071E3] to-[#005BB5] text-white shadow-md'
                  : 'text-[#6B7280] hover:text-[#1B4332]'
              }`}
              style={{ fontSize: '13px', fontWeight: '600' }}
            >
              <History size={15} />
              <span className="hidden sm:inline">Historial</span>
            </button>
          </div>

          {/* Supplier Request Button - catalog only */}
          {activeTab === 'catalog' && <button
            onClick={() => setShowSupplierRequest(!showSupplierRequest)}
            className="px-4 py-3 rounded-[16px] bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white hover:shadow-lg transition-all flex items-center gap-2 relative"
            style={{ fontSize: '13px', fontWeight: '600' }}
          >
            <Truck size={18} />
            <span className="hidden md:inline">Pedir a Proveedor</span>
            {supplierRequestItems > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#EF4444] flex items-center justify-center border-2 border-white">
                <span style={{ fontSize: '10px', fontWeight: '700' }}>{supplierRequestItems}</span>
              </div>
            )}
          </button>}

          {/* Cart Summary - Clickable - catalog only */}
          {activeTab === 'catalog' && <button
            onClick={() => setShowCart(true)}
            className="rounded-[20px] bg-gradient-to-br from-[#0071E3] to-[#005BB5] px-3 sm:px-6 py-2 sm:py-4 text-white relative hover:shadow-2xl transition-all"
            style={{ boxShadow: '0 8px 24px rgba(0, 113, 227, 0.3)' }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <ShoppingCart size={20} />
              <div>
                <div className="hidden sm:block" style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Carrito
                </div>
                <div className="text-sm sm:text-xl" style={{ fontWeight: '700' }}>
                  ${cartTotal.toFixed(2)}
                </div>
              </div>
            </div>
            {cartItems > 0 && (
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#EF4444] flex items-center justify-center border-2 border-white">
                <span style={{ fontSize: '12px', fontWeight: '700' }}>{cartItems}</span>
              </div>
            )}
          </button>}

          {/* Refresh button - history only */}
          {activeTab === 'history' && (
            <button
              onClick={fetchSales}
              disabled={loadingSales}
              className="w-10 h-10 rounded-full bg-white/75 backdrop-blur-xl border border-white/50 flex items-center justify-center hover:bg-white transition-all disabled:opacity-50"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
            >
              <RefreshCw size={16} className={`text-[#6B7280] ${loadingSales ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* ==================== CATALOG VIEW ==================== */}
      {activeTab === 'catalog' && <>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar productos por nombre o categoría..."
          className="w-full pl-12 pr-4 py-4 rounded-[20px] bg-white/75 backdrop-blur-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 transition-all"
          style={{
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            fontSize: '15px',
          }}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="rounded-[20px] bg-white/75 backdrop-blur-xl p-5"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center">
              <Package size={20} className="text-[#10B981]" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1B4332' }}>
                {products.filter(p => p.status === 'available').length}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Disponibles</div>
            </div>
          </div>
        </div>

        <div
          className="rounded-[20px] bg-white/75 backdrop-blur-xl p-5"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
              <AlertCircle size={20} className="text-[#F59E0B]" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1B4332' }}>
                {products.filter(p => p.status === 'low').length}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Stock Bajo</div>
            </div>
          </div>
        </div>

        <div
          className="rounded-[20px] bg-white/75 backdrop-blur-xl p-5"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0071E3]/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-[#0071E3]" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1B4332' }}>
                {cartItems}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>En Carrito</div>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Request Modal */}
      {showSupplierRequest && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => setShowSupplierRequest(false)}
        >
        <div
          className="rounded-[24px] bg-white w-full max-w-[560px] max-h-[85vh] flex flex-col overflow-hidden"
          style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.25)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center flex-shrink-0">
                <Truck size={20} className="text-white" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1B4332' }}>
                  Solicitud a Proveedores
                </h3>
                <p style={{ fontSize: '12px', color: '#6B7280' }}>
                  {supplierRequestItems} {supplierRequestItems === 1 ? 'producto seleccionado' : 'productos seleccionados'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSupplierRequest(false)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
            >
              <X size={15} className="text-gray-600" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {supplierRequestItems > 0 && (
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <span className="px-3 py-2 rounded-[10px] bg-[#1B4332]/5 border border-[#1B4332]/10" style={{ fontSize: '12px', color: '#6B7280' }}>
                  {/* Show unique providers */}
                  {(() => {
                    const names = [...new Set(
                      Object.keys(supplierRequests)
                        .map((id) => products.find((p) => p.id === id)?.providerName)
                        .filter(Boolean)
                    )];
                    const missingProvider = Object.keys(supplierRequests).some(
                      (id) => !products.find((p) => p.id === id)?.providerName
                    );
                    if (names.length === 0)
                      return <span className="text-[#B45309]">⚠️ Productos sin proveedor asignado</span>;
                    return (
                      <>
                        {`Proveedor${names.length > 1 ? 'es' : ''}: ${names.join(', ')}`}
                        {missingProvider && <span className="ml-1 text-[#B45309]"> · ⚠️ algunos sin proveedor</span>}
                      </>
                    );
                  })()}
                </span>
                <button
                  onClick={handleSendSupplierRequest}
                  disabled={sendingRequest}
                  className="px-4 py-2 rounded-[12px] bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  style={{ fontSize: '13px', fontWeight: '600' }}
                >
                  <Send size={16} />
                  {sendingRequest ? 'Enviando...' : 'Enviar Pedido'}
                </button>
              </div>
            )}

          {supplierRequestItems > 0 ? (
            <div className="space-y-2 mt-4">
              {Object.entries(supplierRequests).map(([productId, quantity]) => {
                const product = products.find(p => p.id === productId);
                if (!product) return null;

                return (
                  <div
                    key={productId}
                    className="rounded-[16px] bg-gray-50 border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span style={{ fontSize: '24px' }}>{product.image}</span>
                      <div className="min-w-0">
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1B4332' }} className="truncate">
                          {product.name}
                        </div>
                        <div className="mt-0.5">
                          {product.providerName ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#1B4332]/10 text-[#1B4332]" style={{ fontSize: '11px', fontWeight: '500' }}>
                              {product.providerName}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#B45309]" style={{ fontSize: '11px', fontWeight: '500' }}>
                              ⚠️ Sin proveedor asignado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <button
                        onClick={() => setRequestQuantity(productId, quantity - 1)}
                        className="w-7 h-7 rounded-full bg-[#1B4332]/10 text-[#1B4332] hover:bg-[#1B4332]/20 transition-all flex items-center justify-center"
                        style={{ fontWeight: '700', fontSize: '16px' }}
                      >−</button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setRequestQuantity(productId, Number(e.target.value))}
                        className="w-16 text-center rounded-[8px] border border-[#1B4332]/20 bg-white py-1 focus:outline-none focus:ring-1 focus:ring-[#1B4332]/40"
                        style={{ fontSize: '14px', fontWeight: '600', color: '#1B4332' }}
                      />
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>{product.unit}</span>
                      <button
                        onClick={() => setRequestQuantity(productId, quantity + 1)}
                        className="w-7 h-7 rounded-full bg-[#1B4332]/10 text-[#1B4332] hover:bg-[#1B4332]/20 transition-all flex items-center justify-center"
                        style={{ fontWeight: '700', fontSize: '16px' }}
                      >+</button>
                      <button
                        onClick={() => removeFromSupplierRequest(productId)}
                        className="w-7 h-7 rounded-full bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-all flex items-center justify-center"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: '#6B7280', fontSize: '14px' }}>
              Selecciona productos con stock bajo para solicitar al proveedor
            </div>
          )}
          </div>
        </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`rounded-[24px] bg-white/75 backdrop-blur-xl p-6 border transition-all hover:shadow-xl ${
              product.status === 'out'
                ? 'border-gray-200 opacity-60'
                : 'border-white/50 hover:border-[#0071E3]/30'
            }`}
            style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)' }}
          >
            {/* Product Image/Icon */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-[16px] bg-gradient-to-br from-[#1B4332]/10 to-[#0071E3]/10 flex items-center justify-center">
                <span style={{ fontSize: '32px' }}>{product.image}</span>
              </div>

              {/* Status Badge */}
              {product.status === 'available' && (
                <span className="px-3 py-1 rounded-full bg-[#10B981]/10 flex items-center gap-1" style={{ fontSize: '11px', fontWeight: '600', color: '#10B981' }}>
                  <CheckCircle size={12} />
                  Disponible
                </span>
              )}
              {product.status === 'low' && (
                <span className="px-3 py-1 rounded-full bg-[#F59E0B]/10 flex items-center gap-1" style={{ fontSize: '11px', fontWeight: '600', color: '#F59E0B' }}>
                  <AlertCircle size={12} />
                  Stock Bajo
                </span>
              )}
              {product.status === 'out' && (
                <span className="px-3 py-1 rounded-full bg-[#EF4444]/10 flex items-center gap-1" style={{ fontSize: '11px', fontWeight: '600', color: '#EF4444' }}>
                  Agotado
                </span>
              )}
            </div>

            {/* Product Info */}
            <div className="mb-4">
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1B4332', marginBottom: '4px' }}>
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-full bg-[#0071E3]/10" style={{ fontSize: '10px', fontWeight: '600', color: '#0071E3' }}>
                  {product.unit}
                </span>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>•</span>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{product.category}</span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span style={{ fontSize: '24px', fontWeight: '700', color: '#1B4332' }}>
                  ${product.price.toFixed(2)}
                </span>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>/ {product.unit}</span>
              </div>

              <div style={{ fontSize: '13px', color: '#6B7280' }}>
                Stock: <span style={{ fontWeight: '600', color: product.stock > 50 ? '#10B981' : product.stock > 0 ? '#F59E0B' : '#EF4444' }}>
                  {product.stock} {product.unit}
                </span>
              </div>
            </div>

            {/* Actions */}
            {product.status === 'out' || product.status === 'low' ? (
              <div className="pt-4 border-t border-gray-200/50">
                <button
                  onClick={() => addToSupplierRequest(product.id)}
                  className="w-full py-3 rounded-[12px] bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  style={{ fontSize: '13px', fontWeight: '600' }}
                >
                  <Truck size={16} />
                  Solicitar Reabastecimiento
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200/50">
                {cart[product.id] ? (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="w-10 h-10 rounded-full bg-white border-2 border-[#0071E3] flex items-center justify-center hover:bg-[#0071E3]/10 transition-all"
                    >
                      <Minus size={18} className="text-[#0071E3]" />
                    </button>

                    <div className="flex flex-col items-center">
                      <span style={{ fontSize: '20px', fontWeight: '700', color: '#1B4332' }}>
                        {cart[product.id]}
                      </span>
                      <span style={{ fontSize: '11px', color: '#6B7280' }}>
                        ${(product.price * cart[product.id]).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-10 h-10 rounded-full bg-[#0071E3] flex items-center justify-center hover:bg-[#005BB5] transition-all"
                      disabled={cart[product.id] >= product.stock}
                    >
                      <Plus size={18} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product.id)}
                    className="w-full py-3 rounded-[12px] bg-gradient-to-br from-[#0071E3] to-[#005BB5] text-white hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                    style={{ fontSize: '14px', fontWeight: '600' }}
                  >
                    <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
                    Agregar al Carrito
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Shopping Cart Modal */}
      <ShoppingCartModal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        products={products}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      {/* Quick Cart Preview (Fixed Bottom) */}
      {cartItems > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-24 md:bottom-8 right-8 rounded-[24px] bg-gradient-to-br from-[#0071E3] to-[#005BB5] px-6 py-4 text-white z-40 hover:shadow-2xl transition-all flex items-center gap-3"
          style={{ boxShadow: '0 20px 60px rgba(0, 113, 227, 0.4)' }}
        >
          <ShoppingCart size={24} />
          <div className="text-left">
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
              {cartItems} {cartItems === 1 ? 'producto' : 'productos'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700' }}>
              ${cartTotal.toFixed(2)}
            </div>
          </div>
          {cartItems > 0 && (
            <div className="w-6 h-6 rounded-full bg-[#EF4444] flex items-center justify-center">
              <span style={{ fontSize: '11px', fontWeight: '700' }}>{cartItems}</span>
            </div>
          )}
        </button>
      )}
      </> /* end CATALOG VIEW */}

      {/* ==================== HISTORY VIEW ==================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-[20px] bg-white/75 backdrop-blur-xl p-5" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0071E3]/10 flex items-center justify-center">
                  <Receipt size={20} className="text-[#0071E3]" />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1B4332' }}>{sales.length}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Ventas Totales</div>
                </div>
              </div>
            </div>
            <div className="rounded-[20px] bg-white/75 backdrop-blur-xl p-5" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                  <TrendingUp size={20} className="text-[#10B981]" />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1B4332' }}>${totalSalesRevenue.toFixed(2)}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Ingresos Totales</div>
                </div>
              </div>
            </div>
            <div className="rounded-[20px] bg-white/75 backdrop-blur-xl p-5" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
                  <Package size={20} className="text-[#F59E0B]" />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1B4332' }}>{formatUnits(totalUnitsSold)}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Unidades Vendidas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sales list */}
          {loadingSales ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw size={28} className="animate-spin text-[#0071E3]" />
            </div>
          ) : sales.length === 0 ? (
            <div
              className="rounded-[24px] bg-white/75 backdrop-blur-xl p-12 text-center"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
            >
              <Receipt size={48} className="mx-auto mb-4 text-[#D1D5DB]" />
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#6B7280' }}>Sin ventas registradas</p>
              <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>Las ventas aparecerán aquí una vez que se realice un pedido</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => {
                const isExpanded = expandedSale === sale.id;
                const date = sale.created_at ? new Date(sale.created_at) : null;
                return (
                  <div
                    key={sale.id}
                    className="rounded-[20px] bg-white/75 backdrop-blur-xl border border-white/50 overflow-hidden"
                    style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                  >
                    {/* Sale header row */}
                    <button
                      onClick={() => setExpandedSale(isExpanded ? null : sale.id)}
                      className="w-full px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 hover:bg-white/50 transition-all text-left"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#0071E3]/10 flex items-center justify-center flex-shrink-0">
                          <Receipt size={18} className="text-[#0071E3]" />
                        </div>
                        <div className="min-w-0">
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1B4332' }}>
                            Venta #{sale.id}
                            {sale.customer_name && (
                              <span style={{ fontSize: '13px', fontWeight: '400', color: '#6B7280' }}> · {sale.customer_name}</span>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                            {date ? date.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                            <span className="mx-2">·</span>
                            {sale.items.length} {sale.items.length === 1 ? 'producto' : 'productos'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto flex-shrink-0">
                        <div className="text-left sm:text-right">
                          <div style={{ fontSize: '18px', fontWeight: '700', color: '#1B4332' }}>${sale.total.toFixed(2)}</div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>IVA incl.</div>
                        </div>
                        <span
                          className="px-2 py-1 rounded-full bg-[#10B981]/10 flex items-center gap-1"
                          style={{ fontSize: '11px', fontWeight: '600', color: '#10B981' }}
                        >
                          <CheckCircle size={11} />
                          {sale.status}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setPreviewSale(sale); }}
                          className="w-8 h-8 rounded-full bg-[#0071E3]/10 hover:bg-[#0071E3]/20 flex items-center justify-center transition-all flex-shrink-0"
                          title="Ver ticket"
                        >
                          <Download size={14} className="text-[#0071E3]" />
                        </button>
                        {isExpanded ? <ChevronUp size={16} className="text-[#6B7280]" /> : <ChevronDown size={16} className="text-[#6B7280]" />}
                      </div>
                    </button>

                    {/* Expanded items */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 px-4 sm:px-6 py-4 space-y-2">
                        <div className="hidden sm:grid grid-cols-4 gap-2 mb-2" style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <span className="col-span-2">Producto</span>
                          <span className="text-center">Cant.</span>
                          <span className="text-right">Subtotal</span>
                        </div>
                        {sale.items.map((item) => (
                          <div key={item.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center py-2 border-b border-gray-50 last:border-0">
                            <div className="sm:col-span-2" style={{ fontSize: '14px', fontWeight: '500', color: '#1B4332' }}>
                              {item.product_name}
                              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>${item.unit_price.toFixed(2)} c/u</div>
                            </div>
                            <div className="flex items-center justify-between sm:contents">
                              <div className="sm:text-center" style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                <span className="sm:hidden" style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '500' }}>Cant.: </span>
                                {formatUnits(item.quantity)}
                              </div>
                              <div className="text-right" style={{ fontSize: '14px', fontWeight: '700', color: '#1B4332' }}>
                                <span className="sm:hidden" style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '500' }}>Subtotal: </span>
                                ${item.total_price.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="pt-3 flex flex-col items-end gap-1">
                          <div className="flex justify-between w-48" style={{ fontSize: '13px', color: '#6B7280' }}>
                            <span>Subtotal</span><span>${sale.subtotal.toFixed(2)}</span>
                          </div>
                          {sale.discount_amount > 0 && (
                            <div className="flex justify-between w-48 text-[#10B981]" style={{ fontSize: '13px', fontWeight: '500' }}>
                              <span>Desc. {sale.discount_type === 'percentage' ? `(${sale.discount_value}%)` : ''}</span>
                              <span>-${sale.discount_amount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between w-48" style={{ fontSize: '13px', color: '#6B7280' }}>
                            <span>IVA (16%)</span><span>${sale.tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between w-48 border-t border-gray-200 pt-1" style={{ fontSize: '15px', fontWeight: '700', color: '#1B4332' }}>
                            <span>Total</span><span>${sale.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sale Ticket Preview Modal */}
      <SaleTicketPreview sale={previewSale} onClose={() => setPreviewSale(null)} />
    </div>
  );
}
