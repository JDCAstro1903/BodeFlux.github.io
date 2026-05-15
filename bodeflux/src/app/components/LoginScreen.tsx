import { useState } from 'react';
import logoImg from '../../imports/logo.png';
import { User, Lock, Package, TrendingUp, ShoppingCart, Loader2, Eye, EyeOff } from 'lucide-react';

type UserRole = 'warehouse' | 'sales' | 'executive';

interface LoginScreenProps {
  onLogin: (employeeId: string, password: string) => Promise<void>;
  error?: string | null;
}

export function LoginScreen({ onLogin, error: externalError }: LoginScreenProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const displayError = localError || externalError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !password) return;

    setLocalError(null);
    setIsSubmitting(true);
    try {
      await onLogin(employeeId, password);
    } catch (err: any) {
      setLocalError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Auto-fill employee ID based on role for convenience
    const defaults: Record<UserRole, string> = {
      warehouse: 'ALM001',
      sales: 'VEN001',
      executive: 'EJE001',
    };
    setEmployeeId(defaults[role]);
    setLocalError(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#40916C] flex items-center justify-center p-6">
      {/* Blurred Farm Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div
          className="backdrop-blur-xl bg-white/75 rounded-[32px] p-10 shadow-[0_20px_80px_rgba(0,0,0,0.15)]"
          style={{ boxShadow: '0 20px 80px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.05)' }}
        >
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/80 backdrop-blur-sm mb-4 shadow-lg ring-2 ring-white/60 overflow-hidden">
              <img src={logoImg} alt="BodeFlux logo" className="w-20 h-20 object-contain" />
            </div>
            <h1 className="mb-2" style={{ fontSize: '32px', fontWeight: '600', color: '#1B4332' }}>
              BodeFlux
            </h1>
            <p style={{ fontSize: '15px', color: '#6B7280', fontWeight: '400' }}>
              Sistema de Gestión de Inventario
            </p>
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="mb-4 p-3 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-sm text-center">
              {displayError}
            </div>
          )}

          {/* Role Selection */}
          {!selectedRole ? (
            <div className="space-y-3 mb-6">
              <p style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500', marginBottom: '12px' }}>
                Selecciona tu rol
              </p>

              {/* Almacenista */}
              <button
                type="button"
                onClick={() => handleRoleSelect('warehouse')}
                className="w-full p-4 rounded-[16px] bg-white/60 backdrop-blur-sm border-2 border-white/70 hover:border-[#1B4332]/30 hover:bg-white/80 transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1B4332' }}>
                    Almacenista
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    Control de inventario y almacén
                  </div>
                </div>
              </button>

              {/* Vendedor */}
              <button
                type="button"
                onClick={() => handleRoleSelect('sales')}
                className="w-full p-4 rounded-[16px] bg-white/60 backdrop-blur-sm border-2 border-white/70 hover:border-[#0071E3]/30 hover:bg-white/80 transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0071E3] to-[#005BB5] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingCart size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1B4332' }}>
                    Vendedor
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    Consulta y pedidos de productos
                  </div>
                </div>
              </button>

              {/* Jefe/Ejecutivo */}
              <button
                type="button"
                onClick={() => handleRoleSelect('executive')}
                className="w-full p-4 rounded-[16px] bg-white/60 backdrop-blur-sm border-2 border-white/70 hover:border-[#10B981]/30 hover:bg-white/80 transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1B4332' }}>
                    Ejecutivo
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    Dashboard y reportes gerenciales
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <>
              {/* Back Button */}
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="mb-4 flex items-center gap-2 hover:text-[#0071E3] transition-colors"
                style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}
              >
                ← Cambiar rol
              </button>

          <form onSubmit={handleSubmit} className={`space-y-5 ${!selectedRole ? 'hidden' : ''}`}>
            {/* Employee ID Input */}
            <div>
              <label
                htmlFor="employeeId"
                className="block mb-2"
                style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}
              >
                ID de Empleado
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                  <User size={20} />
                </div>
                <input
                  id="employeeId"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-[16px] bg-white/50 backdrop-blur-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 transition-all"
                  style={{
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                    fontSize: '16px',
                    fontWeight: '400',
                  }}
                  placeholder="Ingrese su ID"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block mb-2"
                style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 rounded-[16px] bg-white/50 backdrop-blur-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 transition-all"
                  style={{
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                    fontSize: '16px',
                    fontWeight: '400',
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-[#6B7280] hover:text-[#1B4332] hover:bg-white/70 transition-all flex items-center justify-center"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* FaceID Button */}
            <div className="pt-4">
              {/* Login Button */}
              <button
                type="submit"
                disabled={!employeeId || !password || isSubmitting}
                className="w-full py-4 rounded-[16px] bg-gradient-to-br from-[#1B4332] to-[#0071E3] text-white hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                style={{
                  boxShadow: '0 8px 24px rgba(27, 67, 50, 0.3)',
                  fontSize: '17px',
                  fontWeight: '600',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}