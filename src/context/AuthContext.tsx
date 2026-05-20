'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, removeToken, decodeToken } from '@/utils/token.util';
import { JwtPayload } from '@/models/auth.model';
import { Role } from '@/types/role.type';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  role: Role | null;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    isAdmin: boolean;
    userEmail: string | null;
    role: Role | null;
  }>({
    isAuthenticated: false,
    isAdmin: false,
    userEmail: null,
    role: null,
  });

  const refreshAuth = () => {
    const token = getToken();
    if (token) {
      try {
        const decoded = decodeToken(token) as unknown as JwtPayload;
        const authorities = decoded.authorities || '';
        const isAdmin = authorities.includes('ROLE_ADMIN');
        const role: Role = isAdmin ? 'ADMIN' : 'USER';
        setAuthState({
          isAuthenticated: true,
          isAdmin,
          userEmail: decoded.username,
          role,
        });
      } catch {
        removeToken();
        setAuthState({ isAuthenticated: false, isAdmin: false, userEmail: null, role: null });
      }
    } else {
      setAuthState({ isAuthenticated: false, isAdmin: false, userEmail: null, role: null });
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const logout = () => {
    removeToken();
    setAuthState({ isAuthenticated: false, isAdmin: false, userEmail: null, role: null });
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ ...authState, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};