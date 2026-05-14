import { Home, Package, AlertTriangle, BarChart3, ShoppingCart, Warehouse, ClipboardList } from 'lucide-react';
import logoImg from '../../imports/logo.png';
import { Link, useLocation } from 'react-router';
import { UserProfile } from './UserProfile';

type UserRole = 'warehouse' | 'sales' | 'executive';

interface NavigationProps {
  userRole: UserRole;
  onLogout: () => void;
}

export function Navigation({ userRole, onLogout }: NavigationProps) {
  const location = useLocation();

  // Navigation items based on role
  const getNavItems = () => {
    switch (userRole) {
      case 'warehouse':
        return [
          { path: '/warehouse', icon: Home, label: 'Almacén' },
          { path: '/inventory', icon: Warehouse, label: 'Inventario' },
          { path: '/alerts', icon: AlertTriangle, label: 'Semáforo' },
        ];
      case 'sales':
        return [
          { path: '/sales', icon: ShoppingCart, label: 'Catálogo' },
          { path: '/orders', icon: ClipboardList, label: 'Pedidos' },
          { path: '/alerts', icon: AlertTriangle, label: 'Disponibilidad' },
        ];
      case 'executive':
        return [
          { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
          { path: '/warehouse', icon: Package, label: 'Almacén' },
          { path: '/inventory', icon: Warehouse, label: 'Inventario' },
          { path: '/alerts', icon: AlertTriangle, label: 'Semáforo' },
          { path: '/sales', icon: ShoppingCart, label: 'Ventas' },
          { path: '/orders', icon: ClipboardList, label: 'Pedidos' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 h-screen w-20 bg-gradient-to-b from-[#1B4332] to-[#2D6A4F] dark:from-[#1E293B] dark:to-[#0F172A] flex-col items-center py-8 gap-6 z-50">
        {/* Logo */}
        <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center mb-4 overflow-hidden">
          <img src={logoImg} alt="BodeFlux" className="w-10 h-10 object-contain" />
        </div>

        {/* Nav Items */}
        <div className="flex flex-col gap-4 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative w-14 h-14 rounded-[16px] flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-white/20 shadow-lg'
                    : 'hover:bg-white/10'
                }`}
              >
                <Icon
                  size={24}
                  className={`transition-colors ${
                    isActive ? 'text-white' : 'text-white/60 group-hover:text-white/90'
                  }`}
                />

                {/* Tooltip */}
                <div className="absolute left-full ml-4 px-3 py-2 rounded-lg bg-[#1B4332] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.label}</span>
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1B4332] rotate-45" />
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white dark:bg-[#22D3EE] rounded-l-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile */}
        <UserProfile userRole={userRole} onLogout={onLogout} />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#1E293B]/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-[#34D399]/20 z-50 pb-safe">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-[16px] transition-all ${
                  isActive ? 'bg-[#1B4332]/10 dark:bg-[#34D399]/10' : ''
                }`}
              >
                <Icon
                  size={22}
                  className={isActive ? 'text-[#1B4332] dark:text-[#34D399]' : 'text-gray-400 dark:text-gray-500'}
                />
                <span
                  className={`text-xs font-medium ${
                    isActive ? 'text-[#1B4332] dark:text-[#34D399]' : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Mobile User Profile */}
          <div className="relative">
            <UserProfile userRole={userRole} onLogout={onLogout} />
          </div>
        </div>
      </div>
    </>
  );
}
