import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (usernameOrEmail: string, pass: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<User>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await api.getMe();
      setUser(u);
    } catch (e) {
      console.error("Auth fetch failed:", e);
      api.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (usernameOrEmail: string, pass: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.login(usernameOrEmail, pass);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const switchRole = async (role: UserRole): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.switchDemoUser(role);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchRole, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
