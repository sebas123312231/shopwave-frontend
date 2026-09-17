'use client';

import { createContext, useContext, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, getErrorMessage } from '@/lib/client/api';
import type { Cart } from '@/contracts/shopwave.schema';
import { useAuth } from './AuthContext';

type CartContextValue = {
  cart: Cart | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  addItem: (variantId: string, quantity: number) => Promise<Cart>;
  updateItem: (id: string, quantity: number) => Promise<Cart>;
  removeItem: (id: string) => Promise<void>;
  refresh: () => Promise<unknown>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queue = useRef(Promise.resolve());
  const cartQuery = useQuery<Cart>({
    queryKey: ['cart', user?.id],
    queryFn: () => apiFetch<Cart>('/api/store/cart'),
    enabled: Boolean(user),
    staleTime: 30_000,
  });
  const runSerial = <T,>(operation: () => Promise<T>) => {
    const result = queue.current.then(operation, operation);
    queue.current = result.then(() => undefined, () => undefined);
    return result;
  };
  const addMutation = useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: string; quantity: number }) => runSerial(() => apiFetch<Cart>('/api/store/cart/items', { method: 'POST', body: JSON.stringify({ variantId, quantity }) })),
    onSuccess: (cart) => queryClient.setQueryData(['cart', user?.id], cart),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => runSerial(() => apiFetch<Cart>(`/api/store/cart/items/${id}`, { method: 'PATCH', body: JSON.stringify({ quantity }) })),
    onSuccess: (cart) => queryClient.setQueryData(['cart', user?.id], cart),
  });
  const removeMutation = useMutation({
    mutationFn: (id: string) => runSerial(() => apiFetch<void>(`/api/store/cart/items/${id}`, { method: 'DELETE' })),
    onSuccess: (_value, id) => {
      void queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      void id;
    },
  });
  const value = useMemo<CartContextValue>(() => ({
    cart: user ? (cartQuery.data ?? null) : null,
    isLoading: Boolean(user) && cartQuery.isLoading,
    isMutating: addMutation.isPending || updateMutation.isPending || removeMutation.isPending,
    error: getErrorMessage(addMutation.error ?? updateMutation.error ?? removeMutation.error, '') || null,
    addItem: (variantId, quantity) => addMutation.mutateAsync({ variantId, quantity }),
    updateItem: (id, quantity) => updateMutation.mutateAsync({ id, quantity }),
    removeItem: async (id) => { await removeMutation.mutateAsync(id); },
    refresh: () => cartQuery.refetch(),
  }), [addMutation, cartQuery, removeMutation, updateMutation, user]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
}
