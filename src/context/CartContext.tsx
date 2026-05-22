'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart, CartItem } from '@/models/cart.model';
import { CartService } from '@/services/cart.service';
import { CartItemService } from '@/services/cartItem.service';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addItem: (productId: number, size: string, quantity: number, price: number) => Promise<void>;
  updateItem: (cartItemId: number, quantity: number, size: string) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CartService.getCart();
      setCart(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar carrito');
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = async (productId: number, size: string, quantity: number, price: number) => {
    await CartService.addItem({ productId, size, quantity, price });
    await refreshCart();
  };

  const updateItem = async (cartItemId: number, quantity: number, size: string) => {
    await CartItemService.update(cartItemId, { quantity, size });
    await refreshCart();
  };

  const removeItem = async (cartItemId: number) => {
    await CartItemService.remove(cartItemId);
    await refreshCart();
  };

  useEffect(() => {
    const token = localStorage.getItem('shopwave_token');
    if (token) refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cart, loading, error, addItem, updateItem, removeItem, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
};
