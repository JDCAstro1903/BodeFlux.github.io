import { LogOut, User, Package, ShoppingCart, TrendingUp, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

type UserRole = 'warehouse' | 'sales' | 'executive';

interface UserProfileProps {
  userRole: UserRole;
  onLogout: () => void;
}

export function UserProfile({ userRole, onLogout }: UserProfileProps) {
  const { theme, toggleTheme } = useTheme();

  const getRoleInfo = () => {
    switch (userRole) {
      case 'warehouse':
        return {
          icon: Package,
          title: 'Almacenista',
          color: 'from-[#1B4332] to-[#2D6A4F]',
          bgColor: 'bg-[#1B4332]',
        };
      case 'sales':
        return {
          icon: ShoppingCart,
          title: 'Vendedor',
          color: 'from-[#0071E3] to-[#005BB5]',
          bgColor: 'bg-[#0071E3]',
        };
      case 'executive':
        return {
          icon: TrendingUp,
          title: 'Ejecutivo',
          color: 'from-[#10B981] to-[#059669]',
          bgColor: 'bg-[#10B981]',
        };
    }
  };

  const roleInfo = getRoleInfo();
  const Icon = roleInfo.icon;

  return (
    <div className="relative group">
      {/* User Avatar Button */}
      <button className={`w-12 h-12 rounded-full bg-gradient-to-br ${roleInfo.color} flex items-center justify-center border-2 border-white/20 hover:scale-110 transition-transform`}>
        <Icon size={20} className="text-white" />
      </button>

      {/* Dropdown Menu */}
      <div className="absolute bottom-full mb-2 right-0 md:right-auto w-56 rounded-[20px] bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl overflow-hidden z-50">
        {/* User Info */}
        <div className={`bg-gradient-to-br ${roleInfo.color} p-4 text-white`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>Usuario Activo</div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)' }}>
                {roleInfo.title}
              </div>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors flex items-center gap-3 group/item"
        >
          <div className={`w-8 h-8 rounded-full ${roleInfo.bgColor}/10 dark:bg-[#10B981]/20 flex items-center justify-center group-hover/item:scale-110 transition-transform`}>
            {theme === 'light' ? (
              <Moon size={16} className={`${roleInfo.bgColor.replace('bg-', 'text-')} dark:text-[#34D399]`} />
            ) : (
              <Sun size={16} className={`${roleInfo.bgColor.replace('bg-', 'text-')} dark:text-[#34D399]`} />
            )}
          </div>
          <span className="text-sm font-medium text-[#1B4332] dark:text-[#34D399]">
            Modo {theme === 'light' ? 'Oscuro' : 'Claro'}
          </span>
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors flex items-center gap-3 group/item"
        >
          <div className={`w-8 h-8 rounded-full ${roleInfo.bgColor}/10 dark:bg-[#EF4444]/20 flex items-center justify-center group-hover/item:scale-110 transition-transform`}>
            <LogOut size={16} className={`${roleInfo.bgColor.replace('bg-', 'text-')} dark:text-[#EF4444]`} />
          </div>
          <span className="text-sm font-medium text-[#1B4332] dark:text-[#34D399]">
            Cerrar Sesión
          </span>
        </button>
      </div>
    </div>
  );
}
