import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { api, setAccessToken, setRefreshToken, getRefreshToken } from '../api/client';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tryRefresh = async () => {
      const rt = getRefreshToken();
      if (!rt) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.post('/auth/refresh', { refreshToken: rt });
        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
        setUser(res.data.user);
      } catch {
        setAccessToken(null);
        setRefreshToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    tryRefresh();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    setAccessToken(res.data.accessToken);
    setRefreshToken(res.data.refreshToken);
    setUser(res.data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { email, password, name });
    setAccessToken(res.data.accessToken);
    setRefreshToken(res.data.refreshToken);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
