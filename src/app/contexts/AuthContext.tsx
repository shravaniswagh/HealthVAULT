import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  gender?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  last_period_date?: string;
  cycle_length?: number;
  is_pregnant?: boolean;
  due_date?: string;
  hospital_visits?: any[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  register: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('hv_token');
    if (savedToken) {
      setToken(savedToken);
      api.me()
        .then((u: User) => setUser(u))
        .catch(() => {
          localStorage.removeItem('hv_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback((token: string, user: User) => {
    localStorage.setItem('hv_token', token);
    setToken(token);
    setUser(user);
  }, []);

  const register = useCallback((token: string, user: User) => {
    localStorage.setItem('hv_token', token);
    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hv_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
