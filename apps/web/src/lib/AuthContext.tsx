import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('sk_token');
    localStorage.removeItem('sk_user');
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data);
      localStorage.setItem('sk_user', JSON.stringify(data.data));
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const storedToken = localStorage.getItem('sk_token');
    const storedUser = localStorage.getItem('sk_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      try { setUser(JSON.parse(storedUser)); } catch { logout(); }
    }
    setIsLoading(false);
  }, [logout]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token: t, user: u } = data.data;
    localStorage.setItem('sk_token', t);
    localStorage.setItem('sk_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
