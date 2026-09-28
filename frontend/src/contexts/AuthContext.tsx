import React, { createContext, useContext, useState, useEffect } from 'react';
import { Business, AuthResponse } from '../types';
import { api } from '../utils/api';

interface AuthContextType {
  user: Business | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, domain: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Business | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('supportly_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('supportly_token');
      if (storedToken) {
        try {
          // Assuming /auth/me returns the user object
          const userData = await api.get<{ data: Business }>('/auth/me');
          setUser(userData.data);
          setToken(storedToken);
        } catch (error) {
          console.error('Auth initialization failed', error);
          localStorage.removeItem('supportly_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('supportly_token', response.token);
  };

  const register = async (name: string, email: string, password: string, domain: string) => {
    const response = await api.post<AuthResponse>('/auth/register', { name, email, password, domain });
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('supportly_token', response.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('supportly_token');
    api.post('/auth/logout').catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user && !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
