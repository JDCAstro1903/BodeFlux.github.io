import { useState, useEffect } from 'react';
import { Users, UserPlus, Package, ShoppingCart, Eye, EyeOff, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { usersApi, type UserData, type UserCreatePayload } from '../services/api';

const ROLES: { value: 'warehouse' | 'sales'; label: string; desc: string; color: string }[] = [
  { value: 'warehouse', label: 'Almacenista', desc: 'Control de inventario y almacén', color: 'from-[#1B4332] to-[#2D6A4F]' },
  { value: 'sales', label: 'Vendedor', desc: 'Consulta y pedidos de productos', color: 'from-[#0071E3] to-[#005BB5]' },
];

const ROLE_ICON = {
  warehouse: Package,
  sales: ShoppingCart,
  executive: Users,
};

const ROLE_LABEL: Record<string, string> = {
  warehouse: 'Almacenista',
  sales: 'Vendedor',
  executive: 'Ejecutivo',
};

export function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState<'warehouse' | 'sales'>('warehouse');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch {
      // API may not be up in demo; silently show empty list
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const resetForm = () => {
    setName('');
    setEmployeeId('');
    setPassword('');
    setConfirmPassword('');
    setRole('warehouse');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !employeeId.trim() || !password) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const payload: UserCreatePayload = {
      name: name.trim(),
      employee_id: employeeId.trim().toUpperCase(),
      role,
      password,
    };

    setSaving(true);
    try {
      await usersApi.create(payload);
      setSuccess(`Usuario ${payload.name} (${payload.employee_id}) registrado con éxito.`);
      resetForm();
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user: UserData) => {
    try {
      await usersApi.update(user.id, { is_active: !user.is_active });
      loadUsers();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B4332] dark:text-[#34D399]">Usuarios del Sistema</h1>
        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
          Registra almacenistas y vendedores para tener trazabilidad completa del inventario
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* ── Registration Form ── */}
        <div className="rounded-[20px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl p-6" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <h2 className="text-base font-semibold text-[#1B4332] dark:text-[#E5E7EB] mb-5 flex items-center gap-2">
            <UserPlus size={18} /> Nuevo Usuario
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector */}
            <div>
              <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">Rol</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => {
                  const Icon = ROLE_ICON[r.value];
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`p-3 rounded-[12px] border-2 flex items-center gap-3 transition-all text-left ${
                        role === r.value
                          ? 'border-[#1B4332] dark:border-[#34D399] bg-[#1B4332]/5 dark:bg-[#34D399]/10'
                          : 'border-gray-200 dark:border-[#2C2C2E] hover:border-[#1B4332]/30 dark:hover:border-[#34D399]/30'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-[10px] bg-gradient-to-br ${r.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#1B4332] dark:text-[#E5E7EB]">{r.label}</p>
                        <p className="text-[10px] text-[#9CA3AF] leading-tight">{r.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Carlos Ramírez"
                className="w-full px-4 py-2.5 rounded-[12px] bg-white/50 dark:bg-[#0F172A]/50 border border-gray-200 dark:border-[#2C2C2E] text-sm text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1B4332]/30 dark:focus:ring-[#34D399]/30 transition-all"
              />
            </div>

            {/* Employee ID */}
            <div>
              <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">ID de Empleado</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Ej. ALM002"
                className="w-full px-4 py-2.5 rounded-[12px] bg-white/50 dark:bg-[#0F172A]/50 border border-gray-200 dark:border-[#2C2C2E] text-sm font-mono text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1B4332]/30 dark:focus:ring-[#34D399]/30 transition-all"
              />
              <p className="text-[10px] text-[#9CA3AF] mt-1">Se convierte a mayúsculas automáticamente</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 pr-10 py-2.5 rounded-[12px] bg-white/50 dark:bg-[#0F172A]/50 border border-gray-200 dark:border-[#2C2C2E] text-sm text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1B4332]/30 dark:focus:ring-[#34D399]/30 transition-all"
                />
                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full px-4 pr-10 py-2.5 rounded-[12px] bg-white/50 dark:bg-[#0F172A]/50 border border-gray-200 dark:border-[#2C2C2E] text-sm text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1B4332]/30 dark:focus:ring-[#34D399]/30 transition-all"
                />
                <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Feedback */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-[10px] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs">
                <XCircle size={14} className="flex-shrink-0 mt-0.5" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 p-3 rounded-[10px] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs">
                <CheckCircle size={14} className="flex-shrink-0 mt-0.5" /> {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-[12px] bg-gradient-to-br from-[#1B4332] to-[#0071E3] text-white text-sm font-semibold hover:shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {saving ? (
                <><Loader2 size={16} className="animate-spin" /> Registrando...</>
              ) : (
                <><UserPlus size={16} /> Registrar Usuario</>
              )}
            </button>
          </form>
        </div>

        {/* ── User List ── */}
        <div className="rounded-[20px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl overflow-hidden" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2C2C2E]">
            <h2 className="text-base font-semibold text-[#1B4332] dark:text-[#E5E7EB] flex items-center gap-2">
              <Users size={18} /> Usuarios registrados
              <span className="ml-1 px-2 py-0.5 rounded-full bg-[#1B4332]/10 dark:bg-[#34D399]/20 text-[#1B4332] dark:text-[#34D399] text-xs font-bold">
                {users.filter((u) => u.is_active).length} activos
              </span>
            </h2>
            <button
              onClick={loadUsers}
              disabled={loading}
              className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#2C2C2E] transition-all disabled:opacity-40"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-[#6B7280] dark:text-[#9CA3AF]">
              <div className="animate-spin w-5 h-5 border-2 border-[#1B4332] dark:border-[#34D399] border-t-transparent rounded-full mr-3" />
              Cargando usuarios...
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#6B7280] dark:text-[#9CA3AF]">
              <Users size={36} className="mb-3 opacity-25" />
              <p className="font-medium text-sm">Sin usuarios registrados</p>
              <p className="text-xs mt-1">Registra el primer usuario usando el formulario</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-[#2C2C2E] max-h-[520px] overflow-y-auto">
              {users.map((u) => {
                const Icon = ROLE_ICON[u.role] ?? Users;
                return (
                  <div key={u.id} className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${u.is_active ? '' : 'opacity-50'}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      u.role === 'warehouse' ? 'bg-gradient-to-br from-[#1B4332] to-[#2D6A4F]' :
                      u.role === 'sales'     ? 'bg-gradient-to-br from-[#0071E3] to-[#005BB5]' :
                                              'bg-gradient-to-br from-[#10B981] to-[#059669]'
                    }`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1B4332] dark:text-[#E5E7EB] truncate">{u.name}</p>
                      <p className="text-[11px] text-[#9CA3AF] font-mono">{u.employee_id} · {ROLE_LABEL[u.role]}</p>
                    </div>
                    <button
                      onClick={() => toggleActive(u)}
                      title={u.is_active ? 'Desactivar usuario' : 'Activar usuario'}
                      className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-all ${
                        u.is_active
                          ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                          : 'text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                    >
                      {u.is_active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
