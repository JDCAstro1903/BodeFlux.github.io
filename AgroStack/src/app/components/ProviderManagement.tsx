import { Building2, Phone, Mail, MapPin, Plus, Edit, Trash2, Star } from 'lucide-react';
import { useState } from 'react';

interface Provider {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  status: 'active' | 'inactive';
}

export function ProviderManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  // TODO: replace with backend-fetched providers list.
  const [providers, setProviders] = useState<Provider[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    category: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProvider: Provider = {
      id: `PROV-${String(providers.length + 1).padStart(3, '0')}`,
      ...formData,
      rating: 0,
      status: 'active',
    };
    setProviders([...providers, newProvider]);
    setFormData({ name: '', contact: '', email: '', phone: '', address: '', category: '' });
    setShowAddForm(false);
  };

  return (
    <div
      className="rounded-[20px] md:rounded-[24px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl p-4 md:p-6"
      style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }}
    >
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#1B4332] to-[#0071E3] dark:from-[#34D399] dark:to-[#60A5FA] flex items-center justify-center">
            <Building2 size={16} className="md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-[#1B4332] dark:text-[#34D399]">
              Gestión de Proveedores
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]">
              {providers.length} proveedores registrados
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 md:px-4 py-2 rounded-[12px] bg-gradient-to-br from-[#0071E3] to-[#005BB5] dark:from-[#60A5FA] dark:to-[#3B82F6] text-white hover:shadow-lg transition-all flex items-center gap-2 text-xs md:text-sm font-semibold"
        >
          <Plus size={14} className="md:w-4 md:h-4" />
          <span className="hidden sm:inline">Nuevo Proveedor</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {/* Add Provider Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-4 md:mb-6 p-4 md:p-5 rounded-[16px] md:rounded-[20px] bg-gradient-to-br from-[#0071E3]/5 to-[#1B4332]/5 dark:from-[#60A5FA]/10 dark:to-[#34D399]/10 border border-[#0071E3]/20 dark:border-[#60A5FA]/30"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="text-xs font-medium text-[#6B7280] dark:text-[#CBD5E1]">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-[12px] bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-600 text-[#1B4332] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 dark:focus:ring-[#3B82F6]/50 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#6B7280] dark:text-[#CBD5E1]">
                Persona de Contacto
              </label>
              <input
                type="text"
                required
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-[12px] bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-600 text-[#1B4332] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 dark:focus:ring-[#3B82F6]/50 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#6B7280] dark:text-[#CBD5E1]">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-[12px] bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-600 text-[#1B4332] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 dark:focus:ring-[#3B82F6]/50 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#6B7280] dark:text-[#CBD5E1]">
                Teléfono
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-[12px] bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-600 text-[#1B4332] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 dark:focus:ring-[#3B82F6]/50 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#6B7280] dark:text-[#CBD5E1]">
                Dirección
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-[12px] bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-600 text-[#1B4332] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 dark:focus:ring-[#3B82F6]/50 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#6B7280] dark:text-[#CBD5E1]">
                Categoría
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-[12px] bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-600 text-[#1B4332] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 dark:focus:ring-[#3B82F6]/50 text-sm"
              >
                <option value="">Seleccionar categoría</option>
                <option value="Fertilizantes">Fertilizantes</option>
                <option value="Semillas">Semillas</option>
                <option value="Pesticidas">Pesticidas</option>
                <option value="Herbicidas">Herbicidas</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 md:gap-3 mt-3 md:mt-4">
            <button
              type="submit"
              className="px-3 md:px-4 py-2 rounded-[12px] bg-[#0071E3] dark:bg-[#3B82F6] text-white hover:bg-[#005BB5] dark:hover:bg-[#2563EB] transition-all text-xs md:text-sm font-semibold"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 md:px-4 py-2 rounded-[12px] bg-gray-200 dark:bg-[#475569] text-gray-700 dark:text-[#F1F5F9] hover:bg-gray-300 dark:hover:bg-[#64748B] transition-all text-xs md:text-sm font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Providers List */}
      <div className="space-y-2 md:space-y-3">
        {providers.length === 0 && (
          <div className="text-xs md:text-sm text-[#6B7280] dark:text-[#CBD5E1] py-6 text-center">
            Sin proveedores registrados
          </div>
        )}
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="rounded-[16px] md:rounded-[20px] bg-white/60 dark:bg-[#1E293B]/60 backdrop-blur-sm p-4 md:p-5 border border-white/50 dark:border-gray-600/50 hover:bg-white/80 dark:hover:bg-[#334155]/80 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm md:text-base font-semibold text-[#1B4332] dark:text-[#34D399]">
                    {provider.name}
                  </h4>
                  {provider.status === 'active' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#10B981]/10 dark:bg-[#34D399]/20 text-[10px] font-semibold text-[#10B981]">
                      Activo
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#0071E3]/10 dark:bg-[#60A5FA]/20 text-[10px] md:text-xs font-semibold text-[#0071E3] dark:text-[#60A5FA]">
                    {provider.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#1B4332]/10 dark:bg-[#34D399]/20 text-[10px] md:text-xs font-semibold text-[#1B4332] dark:text-[#34D399]">
                    {provider.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={`md:w-3.5 md:h-3.5 ${i < Math.floor(provider.rating) ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                  ))}
                  <span className="text-xs text-[#6B7280] dark:text-[#CBD5E1] ml-1">
                    {provider.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#0071E3]/10 dark:bg-[#60A5FA]/20 flex items-center justify-center hover:bg-[#0071E3]/20 dark:hover:bg-[#3B82F6]/30 transition-all">
                  <Edit size={12} className="md:w-3.5 md:h-3.5 text-[#0071E3] dark:text-[#60A5FA]" />
                </button>
                <button className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#EF4444]/10 dark:bg-[#EF4444]/20 flex items-center justify-center hover:bg-[#EF4444]/20 dark:hover:bg-[#EF4444]/30 transition-all">
                  <Trash2 size={12} className="md:w-3.5 md:h-3.5 text-[#EF4444]" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 pt-2 md:pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
              <div className="flex items-center gap-2">
                <Phone size={12} className="md:w-3.5 md:h-3.5 text-[#6B7280] dark:text-[#CBD5E1]" />
                <span className="text-xs text-[#6B7280] dark:text-[#CBD5E1]">{provider.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={12} className="md:w-3.5 md:h-3.5 text-[#6B7280] dark:text-[#CBD5E1]" />
                <span className="text-xs text-[#6B7280] dark:text-[#CBD5E1] truncate">{provider.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={12} className="md:w-3.5 md:h-3.5 text-[#6B7280] dark:text-[#CBD5E1]" />
                <span className="text-xs text-[#6B7280] dark:text-[#CBD5E1]">{provider.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
