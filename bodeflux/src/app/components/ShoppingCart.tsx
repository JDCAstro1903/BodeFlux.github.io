import { X, ShoppingCart, Plus, Minus, Trash2, FileText } from 'lucide-react';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cart: { [key: string]: number };
  products: Product[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (customerName: string) => void;
}

export function ShoppingCartModal({ isOpen, onClose, cart, products, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) {
  const [customerName, setCustomerName] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  const cartItems = Object.entries(cart).map(([productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return product ? { ...product, quantity } : null;
  }).filter(Boolean);

  const subtotal = cartItems.reduce((total, item) => {
    return total + (item!.price * item!.quantity);
  }, 0);

  const tax = subtotal * 0.16; // 16% IVA
  const total = subtotal + tax;
  const totalItems = cartItems.reduce((sum, item) => sum + item!.quantity, 0);

  const handleCheckout = () => {
    onCheckout(customerName.trim());
    setShowCheckout(false);
    setCustomerName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center md:justify-end p-0 md:p-4">
      <div
        className="bg-white w-full md:w-[450px] h-full md:h-[90vh] md:rounded-[32px] flex flex-col overflow-hidden"
        style={{ boxShadow: '0 20px 80px rgba(0, 0, 0, 0.3)' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0071E3] to-[#005BB5] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>
                Carrito
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
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

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ShoppingCart size={40} className="text-gray-400" />
              </div>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#6B7280' }}>
                El carrito está vacío
              </p>
              <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '8px' }}>
                Agrega productos para crear un pedido
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item!.id}
                className="rounded-[20px] bg-white border border-gray-200 p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Product Image */}
                  <div className="w-14 h-14 rounded-[12px] bg-gradient-to-br from-[#1B4332]/10 to-[#0071E3]/10 flex items-center justify-center flex-shrink-0">
                    <span style={{ fontSize: '24px' }}>{item!.image}</span>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1B4332', marginBottom: '4px' }}>
                      {item!.name}
                    </h4>
                    <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                      ${item!.price.toFixed(2)} / {item!.unit}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item!.id, item!.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
                        >
                          <Minus size={14} className="text-gray-700" />
                        </button>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#1B4332', minWidth: '30px', textAlign: 'center' }}>
                          {item!.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item!.id, item!.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-[#0071E3] hover:bg-[#005BB5] flex items-center justify-center transition-all"
                        >
                          <Plus size={14} className="text-white" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#1B4332' }}>
                          ${(item!.price * item!.quantity).toFixed(2)}
                        </div>
                        <button
                          onClick={() => onRemoveItem(item!.id)}
                          className="text-[#EF4444] hover:text-[#DC2626] transition-colors mt-1"
                          style={{ fontSize: '11px', fontWeight: '500' }}
                        >
                          <Trash2 size={14} className="inline mr-1" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4 bg-white">
            {/* Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between" style={{ fontSize: '14px', color: '#6B7280' }}>
                <span>Subtotal ({totalItems} productos)</span>
                <span style={{ fontWeight: '600' }}>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between" style={{ fontSize: '14px', color: '#6B7280' }}>
                <span>IVA (16%)</span>
                <span style={{ fontWeight: '600' }}>${tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#1B4332' }}>Total</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#1B4332' }}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Customer Name Input */}
            {showCheckout && (
              <div className="pt-2">
                <label style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-4 py-3 rounded-[12px] bg-[#F3F4F6] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:bg-white transition-all"
                  style={{ fontSize: '14px' }}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {!showCheckout ? (
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-3 rounded-[16px] bg-gradient-to-br from-[#1B4332] to-[#0071E3] text-white hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  style={{ fontSize: '15px', fontWeight: '600' }}
                >
                  <FileText size={18} />
                  Generar Comprobante
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 rounded-[16px] bg-gradient-to-br from-[#10B981] to-[#059669] text-white hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    style={{ fontSize: '15px', fontWeight: '600' }}
                  >
                    <FileText size={18} />
                    Confirmar Venta
                  </button>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="w-full py-2 rounded-[12px] bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                    style={{ fontSize: '13px', fontWeight: '600' }}
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
