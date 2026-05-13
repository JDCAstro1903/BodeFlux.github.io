import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { LoginScreen } from './components/LoginScreen';
import { WarehouseControl } from './components/WarehouseControl';
import { ExpirationAlerts } from './components/ExpirationAlerts';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { SalesView } from './components/SalesView';
import { Navigation } from './components/Navigation';
import { ThemeProvider } from './contexts/ThemeContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { isAuthenticated, userRole, login, logout, isLoading, error } = useAuth();

  // Get default route based on role
  const getDefaultRoute = () => {
    switch (userRole) {
      case 'warehouse':
        return '/warehouse';
      case 'sales':
        return '/sales';
      case 'executive':
        return '/dashboard';
      default:
        return '/warehouse';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#40916C]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl mb-4 animate-pulse">
            <span className="text-3xl">🌾</span>
          </div>
          <p className="text-white/80 text-lg font-medium">Cargando AgroStack...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} error={error} />;
  }

  return (
    <InventoryProvider>
      <BrowserRouter>
        <div className="min-h-screen relative bg-[#F5F5F7] dark:bg-[#000000] overflow-hidden">
          {/* Apple-style ambient gradient orbs */}
          <div className="pointer-events-none fixed inset-0 -z-0">
            <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-[#0071E3]/15 dark:bg-[#60A5FA]/10 blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-[#1B4332]/10 dark:bg-[#34D399]/10 blur-3xl" />
            <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-[#A78BFA]/10 dark:bg-[#A78BFA]/10 blur-3xl" />
          </div>
          <div className="relative z-10">
            <Navigation userRole={userRole} onLogout={logout} />

            {/* Main Content Area */}
            <div className="md:pl-20 pb-20 md:pb-0">
              <div className="max-w-7xl mx-auto p-6 md:p-8">
                {/* Role Badge - Mobile Only */}
                <div className="md:hidden mb-4 flex justify-end">
                  <div className="px-4 py-2 rounded-full bg-white/75 dark:bg-[#1E293B]/90 backdrop-blur-xl border border-white/50 dark:border-[#34D399]/30">
                    <span className="text-xs font-semibold text-[#1B4332] dark:text-[#34D399]">
                      {userRole === 'warehouse' && '👤 Almacenista'}
                      {userRole === 'sales' && '👤 Vendedor'}
                      {userRole === 'executive' && '👤 Ejecutivo'}
                    </span>
                  </div>
                </div>

                <Routes>
                  <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
                  <Route path="/warehouse" element={<WarehouseControl />} />
                  <Route path="/alerts" element={<ExpirationAlerts />} />
                  <Route path="/dashboard" element={<ExecutiveDashboard />} />
                  <Route path="/sales" element={<SalesView />} />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      </BrowserRouter>
    </InventoryProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}