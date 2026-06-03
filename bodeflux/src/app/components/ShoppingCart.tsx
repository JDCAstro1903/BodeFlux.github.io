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
  onCheckout: (payload: { customerName: string; discountType?: 'percentage' | 'fixed'; discountValue?: number; customPrices: Record<string, number> }) => void;
}

export function ShoppingCartModal({ isOpen, onClose, cart, products, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) {
  const [customerName, setCustomerName] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);

  const cartItems = Object.entries(cart).map(([productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return product ? { ...product, quantity } : null;
  }).filter(Boolean);

  const subtotal = cartItems.reduce((total, item) => {
    const price = customPrices[item!.id] ?? item!.price;
    return total + (price * item!.quantity);
  }, 0);

  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = subtotal * (discountValue / 100);
  } else {
    discountAmount = discountValue;
  }
  
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const tax = subtotalAfterDiscount * 0.16; // 16% IVA
  const total = subtotalAfterDiscount + tax;
  const totalItems = cartItems.reduce((sum, item) => sum + item!.quantity, 0);

  const handleCheckout = () => {
    onCheckout({
      customerName: customerName.trim(),
      discountType,
      discountValue,
      customPrices,
    });
    setShowCheckout(false);
    setCustomerName('');
    setCustomPrices({});
    setDiscountValue(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center md:justify-end p-0 md:p-4">
      <div
        className="bg-white w-full md:w-[450px] h-[92dvh] md:h-[90vh] rounded-t-[32px] md:rounded-[32px] flex flex-col overflow-hidden"
        style={{ boxShadow: '0 20px 80px rgba(0, 0, 0, 0.3)' }}
      >
        {/* Drag handle - mobile only */}
        <div className="flex justify-center pt-3 pb-1 md:hidden flex-shrink-0 bg-gradient-to-br from-[#0071E3] to-[#005BB5]">
          <div className="w-10 h-1 rounded-full bg-white/40" />
        </div>

        {/* Header */}
        <div className="bg-gradient-to-br from-[#0071E3] to-[#005BB5] px-5 py-3 sm:p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ShoppingCart size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl" style={{ fontWeight: '700', color: 'white' }}>
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
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>$</span>
                      <input
                        type="number"
                        value={customPrices[item!.id] ?? item!.price}
                        onChange={(e) => setCustomPrices({ ...customPrices, [item!.id]: Number(e.target.value) })}
                        className="w-20 px-2 py-1 rounded-[8px] bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#0071E3]/50"
                        step="0.01"
                      />
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>/ {item!.unit}</span>
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
                          ${((customPrices[item!.id] ?? item!.price) * item!.quantity).toFixed(2)}
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
              
              {/* Discount control */}
              {showCheckout && (
                <div className="flex items-center gap-2 py-2 border-y border-gray-100 my-2">
                  <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Descuento:</span>
                  <select 
                    value={discountType} 
                    onChange={e => setDiscountType(e.target.value as any)}
                    className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-[8px] text-xs"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">$</option>
                  </select>
                  <input
                    type="number"
                    value={discountValue || ''}
                    onChange={e => setDiscountValue(Number(e.target.value))}
                    placeholder="0"
                    className="w-20 px-2 py-1 rounded-[8px] bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#0071E3]/50"
                  />
                  {discountAmount > 0 && (
                    <span className="ml-auto text-sm font-semibold text-[#10B981]">
                      -${discountAmount.toFixed(2)}
                    </span>
                  )}
                </div>
              )}

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
