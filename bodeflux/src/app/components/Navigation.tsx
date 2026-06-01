import { useEffect, useState } from 'react';
import { Home, Package, AlertTriangle, BarChart3, ShoppingCart, Warehouse, ClipboardList, LogOut, MoreHorizontal, ArrowLeftRight, Users } from 'lucide-react';
import logoImg from '../../imports/logo.png';
import { Link, useLocation } from 'react-router';
import { UserProfile } from './UserProfile';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

type UserRole = 'warehouse' | 'sales' | 'executive';

interface NavigationProps {
  userRole: UserRole;
  onLogout: () => void;
}

export function Navigation({ userRole, onLogout }: NavigationProps) {
  const location = useLocation();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Navigation items based on role
  const getNavItems = () => {
    switch (userRole) {
      case 'warehouse':
        return [
          { path: '/warehouse', icon: Home, label: 'Almacén' },
          { path: '/inventory', icon: Warehouse, label: 'Inventario' },
          { path: '/movements', icon: ArrowLeftRight, label: 'Movimientos' },
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
          { path: '/movements', icon: ArrowLeftRight, label: 'Movimientos' },
          { path: '/alerts', icon: AlertTriangle, label: 'Semáforo' },
          { path: '/sales', icon: ShoppingCart, label: 'Ventas' },
          { path: '/orders', icon: ClipboardList, label: 'Pedidos' },
          { path: '/users', icon: Users, label: 'Usuarios' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const mobileVisibleLimit = 4;
  const visibleNavItems = navItems.slice(0, mobileVisibleLimit);
  const overflowNavItems = navItems.slice(mobileVisibleLimit);
  const hasOverflowActive = overflowNavItems.some((item) => item.path === location.pathname);

  useEffect(() => {
    setShowMoreMenu(false);
  }, [location.pathname]);

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
        <div className="flex items-stretch justify-between gap-1 px-2 py-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 min-w-0 flex flex-col items-center gap-1 px-1 py-2 rounded-[16px] transition-all ${
                  isActive ? 'bg-[#1B4332]/10 dark:bg-[#34D399]/10' : ''
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? 'text-[#1B4332] dark:text-[#34D399]' : 'text-gray-400 dark:text-gray-500'}
                />
                <span
                  className={`text-[10px] leading-none font-medium truncate max-w-full ${
                    isActive ? 'text-[#1B4332] dark:text-[#34D399]' : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {overflowNavItems.length > 0 && (
            <button
              onClick={() => setShowMoreMenu((prev) => !prev)}
              className={`flex-1 min-w-0 flex flex-col items-center gap-1 px-1 py-2 rounded-[16px] transition-all ${
                showMoreMenu || hasOverflowActive ? 'bg-[#1B4332]/10 dark:bg-[#34D399]/10' : ''
              }`}
            >
              <MoreHorizontal
                size={20}
                className={showMoreMenu || hasOverflowActive ? 'text-[#1B4332] dark:text-[#34D399]' : 'text-gray-400 dark:text-gray-500'}
              />
              <span
                className={`text-[10px] leading-none font-medium ${
                  showMoreMenu || hasOverflowActive ? 'text-[#1B4332] dark:text-[#34D399]' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                Más
              </span>
            </button>
          )}

          {/* Mobile Logout */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex-1 min-w-0 flex flex-col items-center gap-1 px-1 py-2 rounded-[16px] transition-all text-gray-400 dark:text-gray-500 hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
          >
            <LogOut size={20} />
            <span className="text-[10px] leading-none font-medium">Salir</span>
          </button>
        </div>

        {showMoreMenu && overflowNavItems.length > 0 && (
          <>
            <button
              onClick={() => setShowMoreMenu(false)}
              className="absolute inset-0 -top-64 bg-transparent"
              aria-label="Cerrar menú más"
            />
            <div className="absolute bottom-[calc(100%+8px)] right-3 w-52 rounded-[18px] bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl border border-white/60 dark:border-[#34D399]/20 shadow-2xl overflow-hidden">
              {overflowNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                      isActive
                        ? 'bg-[#1B4332]/10 dark:bg-[#34D399]/10 text-[#1B4332] dark:text-[#34D399]'
                        : 'text-[#6B7280] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#334155]'
                    }`}
                  >
                    <Icon size={17} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Mobile logout confirmation */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Se cerrará tu sesión actual en este dispositivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onLogout}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white"
            >
              Sí, salir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
