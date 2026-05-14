import { Search, ShoppingCart, Package, TrendingUp, CheckCircle, AlertCircle, Plus, Minus, Truck, Send, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ShoppingCartModal } from './ShoppingCart';
import { productApi, salesApi, providerOrderApi, type ProductAPI } from '../services/api';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [showSupplierRequest, setShowSupplierRequest] = useState(false);
  const [supplierRequests, setSupplierRequests] = useState<{ [key: string]: number }>({});
  const [showCart, setShowCart] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [sendingRequest, setSendingRequest] = useState(false);

  // Fetch products from API
  useEffect(() => {
    productApi.list().then((data) => {
      setProducts(data.map(mapProduct));
    }).catch(console.error);
  }, []);

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

  const handleCheckout = async () => {
    try {
      const saleItems = Object.entries(cart).map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId)!;
        return {
          product_id: product.numericId,
          product_name: product.name,
          quantity,
          unit_price: product.price,
        };
      });
      const result = await salesApi.create({ items: saleItems });
      alert(`✅ Venta registrada\n\nTotal: $${result.total.toFixed(2)}`);
      setCart({});
      setShowCart(false);
      // Refresh products to get updated stock
      const updated = await productApi.list();
      setProducts(updated.map(mapProduct));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1B4332' }}>Catálogo de Productos</h1>
          <p style={{ fontSize: '15px', color: '#6B7280', fontWeight: '400', marginTop: '4px' }}>
            Consulta disponibilidad y crea pedidos
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Supplier Request Button */}
          <button
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
          </button>

          {/* Cart Summary - Clickable */}
          <button
            onClick={() => setShowCart(true)}
            className="rounded-[20px] bg-gradient-to-br from-[#0071E3] to-[#005BB5] px-6 py-4 text-white relative hover:shadow-2xl transition-all"
            style={{ boxShadow: '0 8px 24px rgba(0, 113, 227, 0.3)' }}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={24} />
              <div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Carrito
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>
                  ${cartTotal.toFixed(2)}
                </div>
              </div>
            </div>
            {cartItems > 0 && (
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#EF4444] flex items-center justify-center border-2 border-white">
                <span style={{ fontSize: '12px', fontWeight: '700' }}>{cartItems}</span>
              </div>
            )}
          </button>
        </div>
      </div>

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

      {/* Supplier Request Panel */}
      {showSupplierRequest && (
        <div
          className="rounded-[24px] bg-gradient-to-br from-[#1B4332]/10 to-[#2D6A4F]/5 backdrop-blur-xl p-6 border-2 border-[#1B4332]/20"
          style={{ boxShadow: '0 8px 32px rgba(27, 67, 50, 0.15)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center">
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

            {supplierRequestItems > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
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
          </div>

          {supplierRequestItems > 0 ? (
            <div className="space-y-2">
              {Object.entries(supplierRequests).map(([productId, quantity]) => {
                const product = products.find(p => p.id === productId);
                if (!product) return null;

                return (
                  <div
                    key={productId}
                    className="rounded-[16px] bg-white/60 p-4 flex items-center justify-between gap-3"
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
                    <div className="flex items-center gap-2 flex-shrink-0">
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
    </div>
  );
}
