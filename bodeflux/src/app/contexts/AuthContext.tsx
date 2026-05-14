import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, type UserData } from '../services/api';

type UserRole = 'warehouse' | 'sales' | 'executive';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  userRole: UserRole;
  token: string | null;
  login: (employeeId: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('agrostack_token')
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, validate existing token
  useEffect(() => {
    if (token) {
      authApi
        .me()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem('agrostack_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (employeeId: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authApi.login({
        employee_id: employeeId,
        password,
      });
      localStorage.setItem('agrostack_token', response.access_token);
      setToken(response.access_token);
      setUser(response.user);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('agrostack_token');
    setToken(null);
    setUser(null);
    window.history.replaceState(null, '', '/');
  };

  const isAuthenticated = !!user && !!token;
  const userRole: UserRole = (user?.role as UserRole) || 'warehouse';

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        userRole,
        token,
        login,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
