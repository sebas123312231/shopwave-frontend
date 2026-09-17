'use client';

import { createContext, useContext, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/client/api';
import type { LoginInput, RegisterInput, Session, User } from '@/contracts/shopwave.schema';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<Session>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery<Session | null>({
    queryKey: ['session'],
    queryFn: async () => {
      try { return await apiFetch<Session>('/api/session'); } catch { return null; }
    },
    retry: false,
    staleTime: 30_000,
  });
  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => apiFetch<Session>('/api/auth/login', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: (session) => queryClient.setQueryData(['session'], session),
  });
  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) => apiFetch<User>('/api/auth/register', { method: 'POST', body: JSON.stringify(input) }),
  });
  const logoutMutation = useMutation({
    mutationFn: () => apiFetch<void>('/api/auth/logout', { method: 'POST', body: '{}' }),
    onSettled: () => {
      queryClient.setQueryData(['session'], null);
      void queryClient.cancelQueries();
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'session' });
    },
  });

  useEffect(() => {
    const refresh = () => { void sessionQuery.refetch(); };
    window.addEventListener('shopwave:auth-expired', refresh);
    return () => window.removeEventListener('shopwave:auth-expired', refresh);
  }, [sessionQuery]);

  const value = useMemo<AuthContextValue>(() => ({
    user: sessionQuery.data?.user ?? null,
    session: sessionQuery.data ?? null,
    isLoading: sessionQuery.isLoading,
    login: (input) => loginMutation.mutateAsync(input),
    register: (input) => registerMutation.mutateAsync(input),
    logout: async () => { await logoutMutation.mutateAsync(); },
  }), [loginMutation, logoutMutation, registerMutation, sessionQuery.data, sessionQuery.isLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
