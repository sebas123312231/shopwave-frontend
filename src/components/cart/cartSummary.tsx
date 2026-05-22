'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Cart } from '@/models/cart.model';
import { Button } from '@/components/ui/Button';

interface CartSummaryProps {
  cart: Cart;
  showCheckoutButton?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ cart, showCheckoutButton = true }) => {
  const router = useRouter();

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-3 mb-4">
        Resumen de Compra
      </h2>

      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Total Productos ({cart.totalItem} {cart.totalItem === 1 ? 'item' : 'items'})</span>
          <span className="font-medium text-gray-900">${cart.totalPrice}</span>
        </div>

        {cart.discounte > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Descuento Aplicado</span>
            <span>-${cart.discounte}</span>
          </div>
        )}

        <div className="flex justify-between text-sm text-gray-500">
          <span>Envío</span>
          <span className="text-green-600 font-medium">Gratis</span>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-2 flex justify-between text-base font-bold text-gray-900">
          <span>Total a Pagar</span>
          <span>${cart.totalDiscountedPrice}</span>
        </div>
      </div>

      {showCheckoutButton && (
        <Button
          variant="primary"
          className="w-full mt-6 py-3 font-semibold tracking-wide shadow-sm"
          onClick={() => router.push('/checkout')}
        >
          Proceder al Checkout
        </Button>
      )}
    </div>
  );
};