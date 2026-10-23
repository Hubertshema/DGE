import React, { createContext, useContext, useState } from 'react';
import { User, AuthState } from '../types';
import { api } from '../api/client';
import { queryClient } from '../api/queryClient';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{
    success: boolean;
    error?: string;
    mustChangePassword?: boolean;
    user?: User;
    isAdmin?: boolean;
    role?: string;
  }>;
  register: (fullName: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isCustomer: boolean;
  isSeller: boolean; // Alias for isAdmin
  mustChangePassword: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    error?: string;
    mustChangePassword?: boolean;
    user?: User;
    isAdmin?: boolean;
    role?: string;
  }> => {
    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      setUser(data.user);
      setToken(data.token);
      setIsLoading(false);
      return {
        success: true,
        mustChangePassword: Boolean(data.user.mustChangePassword),
        user: data.user,
        isAdmin: data.user.role === 'admin',
        role: data.user.role,
      };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login failed.' };
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const data = await api.register(fullName, email, password, phone);
      setUser(data.user);
      setToken(data.token);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!token) return { success: false, error: 'Not authenticated.' };
    setIsLoading(true);
    try {
      const data = await api.changePassword(currentPassword, newPassword, token);
      setUser(data.user);
      setToken(data.token);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Password update failed.' };
    }
  };

  const logout = async (): Promise<void> => {
    // Clear user credentials from state
    setUser(null);
    setToken(null);
    setRefreshToken(null);

    // Stop and remove all authenticated query observers and caches
    queryClient.removeQueries({ queryKey: ['orders'] });
    queryClient.removeQueries({ queryKey: ['order'] });
    queryClient.removeQueries({ queryKey: ['admin-reports'] });
    queryClient.removeQueries({ queryKey: ['admin-customers'] });
    queryClient.removeQueries({ queryKey: ['seller-metrics'] });
  };

  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        changePassword,
        logout,
        isAdmin,
        isCustomer,
        isSeller: isAdmin, // Backwards compatible alias
        mustChangePassword: Boolean(user?.mustChangePassword),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
