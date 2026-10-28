import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginPayload, RegisterPayload } from '../types/auth';
import { authApi } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  updateUser: (payload: { name: string; email: string }) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authApi.verifyToken();
          if (isMounted) {
            setUser(response.user);
          }
        } catch (error) {
          console.error('Failed to verify token', error);
          localStorage.removeItem('token');
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (payload: LoginPayload) => {
    const response = await authApi.login(payload);
    localStorage.setItem('token', response.accessToken);
    setUser(response.user);
  };

  const register = async (payload: RegisterPayload) => {
    const response = await authApi.register(payload);
    localStorage.setItem('token', response.accessToken);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = async (payload: { name: string; email: string }) => {
    // In a real app, this would be an API call to update the user
    setUser(prev => prev ? { ...prev, ...payload } : null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
