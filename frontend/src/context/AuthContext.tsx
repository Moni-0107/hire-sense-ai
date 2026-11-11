import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (email: string, pass: string, name: string, role?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 1,
    email: "alex.johnson@email.com",
    full_name: "Alex Johnson",
    role: "candidate",
    created_at: new Date().toISOString()
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('hiresense_token') || 'demo_token');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('hiresense_token');
    if (savedToken) {
      setToken(savedToken);
      api.getMe().then(u => {
        if (u) setUser(u);
      }).catch(() => {});
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      localStorage.setItem('hiresense_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      return true;
    } catch (e) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string, role = 'candidate'): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.register(email, pass, name, role);
      localStorage.setItem('hiresense_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      return true;
    } catch (e) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('hiresense_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

