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
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-bold text-[var(--color-foreground)] border-b border-[var(--color-border)] pb-3 mb-4">
        Resumen de Compra
      </h2>

      <div className="space-y-3 text-sm text-[var(--color-foreground-muted)]">
        <div className="flex justify-between">
          <span>Total Productos ({cart.totalItem} {cart.totalItem === 1 ? 'item' : 'items'})</span>
          <span className="font-medium text-[var(--color-foreground)]">${cart.totalPrice}</span>
        </div>

        {cart.discounte > 0 && (
          <div className="flex justify-between text-[var(--color-success)] font-medium">
            <span>Descuento Aplicado</span>
            <span>-${cart.discounte}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span>Envío</span>
          <span className="text-[var(--color-success)] font-medium">Gratis</span>
        </div>

        <div className="border-t border-[var(--color-border)] pt-4 mt-2 flex justify-between text-base font-bold text-[var(--color-foreground)]">
          <span>Total a Pagar</span>
          <span>${cart.totalDiscountedPrice}</span>
        </div>
      </div>

      {showCheckoutButton && (
        <Button
          variant="primary"
          size="lg"
          className="w-full mt-6"
          onClick={() => router.push('/checkout')}
        >
          Proceder al Checkout
        </Button>
      )}
    </div>
  );
};