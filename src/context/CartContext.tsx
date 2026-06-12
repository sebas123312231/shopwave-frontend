'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
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

const CART_TIMEOUT = 8000;

function recalcCart(cart: Cart): Cart {
  let totalPrice = 0;
  let totalDiscountedPrice = 0;
  let totalItem = 0;
  for (const item of cart.cartItems) {
    totalPrice += item.price;
    totalDiscountedPrice += item.discountedPrice;
    totalItem += item.quantity;
  }
  return {
    ...cart,
    totalPrice,
    totalDiscountedPrice,
    totalItem,
    discounte: totalPrice - totalDiscountedPrice,
  };
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevAuthRef = useRef(false);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setError('No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.');
      setCart(null);
    }, CART_TIMEOUT);

    try {
      const data = await CartService.getCart();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setCart(data);
      setError(null);
    } catch (err: unknown) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setError(err instanceof Error ? err.message : 'Error al cargar carrito');
    } finally {
      setLoading(false);
    }
  }, []);

  const silentRefresh = useCallback(async () => {
    try {
      const data = await CartService.getCart();
      setCart(data);
      setError(null);
    } catch {
    }
  }, []);

  const addItem = async (productId: number, size: string, quantity: number, price: number) => {
    await CartService.addItem({ productId, size, quantity, price });
    await silentRefresh();
  };

  const updateItem = async (cartItemId: number, quantity: number, size: string) => {
    setCart((prev) => {
      if (!prev) return prev;
      const updatedItems = prev.cartItems.map((item: CartItem) => {
        if (item.id === cartItemId) {
          const product = item.product;
          return {
            ...item,
            quantity,
            size,
            price: quantity * product.price,
            discountedPrice: quantity * product.discountedPrice,
          };
        }
        return item;
      });
      return recalcCart({ ...prev, cartItems: updatedItems });
    });

    try {
      await CartItemService.update(cartItemId, { quantity, size });
      await silentRefresh();
    } catch (err: unknown) {
      await silentRefresh();
      throw err;
    }
  };

  const removeItem = async (cartItemId: number) => {
    setCart((prev) => {
      if (!prev) return prev;
      const updatedItems = prev.cartItems.filter((item: CartItem) => item.id !== cartItemId);
      return recalcCart({ ...prev, cartItems: updatedItems });
    });

    try {
      await CartItemService.remove(cartItemId);
      await silentRefresh();
    } catch (err: unknown) {
      await silentRefresh();
      throw err;
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated && !prevAuthRef.current) {
      prevAuthRef.current = true;
      refreshCart();
    } else if (!isAuthenticated && prevAuthRef.current) {
      prevAuthRef.current = false;
      setCart(null);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated, authLoading, refreshCart]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
