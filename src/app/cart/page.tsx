'use client';

import React from 'react';
import { useCart } from '@/hooks/useCart';
import { CartItemRow } from '@/components/cart/cartItemRow';
import { CartSummary } from '@/components/cart/cartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { Spinner } from '@/components/ui/Spinner';

export default function CartPage() {
  const { cart, loading, error } = useCart();

  if (loading && !cart) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500 animate-pulse">Sincronizando tu carrito...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-sm shadow-xs">
          <p className="font-semibold">Error al cargar el carrito</p>
          <p className="mt-1 text-xs opacity-90">{error}</p>
        </div>
      </div>
    );
  }

  const hasItems = cart && cart.cartItems && cart.cartItems.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-8">
        Tu Carrito de Compras
      </h1>

      {!hasItems ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="hidden sm:grid grid-cols-12 text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 border-b border-gray-200 mb-2">
              <div className="col-span-6">Detalle Producto</div>
              <div className="col-span-3 text-center">Cantidad</div>
              <div className="col-span-2 text-right">Subtotal</div>
              <div className="col-span-1"></div>
            </div>
            <div className="divide-y divide-gray-100">
              {cart!.cartItems.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <CartSummary cart={cart!} />
          </div>
        </div>
      )}
    </div>
  );
}