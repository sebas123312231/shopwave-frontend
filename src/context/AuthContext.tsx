'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getToken, removeToken, decodeToken, isTokenExpired } from '@/utils/token.util';
import { JwtPayload } from '@/models/auth.model';
import { Role } from '@/types/role.type';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  role: Role | null;
  isLoading: boolean;
  logout: () => void;
  refreshAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    isAdmin: boolean;
    userEmail: string | null;
    role: Role | null;
    isLoading: boolean;
  }>({
    isAuthenticated: false,
    isAdmin: false,
    userEmail: null,
    role: null,
    isLoading: true,
  });

  const mountedRef = useRef(false);

  const refreshAuth = useCallback((): boolean => {
    const token = getToken();
    if (token) {
      if (isTokenExpired(token)) {
        removeToken();
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          userEmail: null,
          role: null,
          isLoading: false,
        });
        return false;
      }
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
          isLoading: false,
        });
        return true;
      } catch {
        removeToken();
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          userEmail: null,
          role: null,
          isLoading: false,
        });
        return false;
      }
    } else {
      setAuthState({
        isAuthenticated: false,
        isAdmin: false,
        userEmail: null,
        role: null,
        isLoading: false,
      });
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setAuthState({
      isAuthenticated: false,
      isAdmin: false,
      userEmail: null,
      role: null,
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      refreshAuth();
    }
  }, [refreshAuth]);

  useEffect(() => {
    const handleUnauthorized = () => {
      const token = getToken();
      if (!token || isTokenExpired(token)) {
        logout();
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

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