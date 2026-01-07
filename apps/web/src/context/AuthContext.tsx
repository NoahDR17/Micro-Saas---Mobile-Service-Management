import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Business } from '@msm/shared';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  business: Business | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (businessName: string, name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const data = await apiClient.me();
      setUser(data.user as User);
      setBusiness(data.business as Business);
    } catch (error) {
      setUser(null);
      setBusiness(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiClient.login({ email, password });
    setUser(data.user as User);
    setBusiness(data.business as Business);
  };

  const register = async (businessName: string, name: string, email: string, password: string) => {
    const data = await apiClient.register({ businessName, name, email, password });
    setUser(data.user as User);
    setBusiness(data.business as Business);
  };

  const logout = async () => {
    await apiClient.logout();
    setUser(null);
    setBusiness(null);
  };

  const refetch = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, business, loading, login, register, logout, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
