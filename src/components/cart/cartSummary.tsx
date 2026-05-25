'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Cart } from '@/models/cart.model';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface CartSummaryProps {
  cart: Cart;
  showCheckoutButton?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ cart, showCheckoutButton = true }) => {
  const router = useRouter();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(price);

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg sticky top-6 animate-fadeIn">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag size={20} className="text-accent" />
        <h2 className="text-lg font-bold text-foreground">Resumen de Compra</h2>
      </div>

      <div className="space-y-3 text-sm text-foreground-muted">
        <div className="flex justify-between">
          <span>
            Total Productos ({cart.totalItem} {cart.totalItem === 1 ? 'item' : 'items'})
          </span>
          <span className="font-medium text-foreground">{formatPrice(cart.totalPrice)}</span>
        </div>

        {cart.discounte > 0 && (
          <div className="flex justify-between text-success font-medium">
            <span>Tu Ahorro</span>
            <span>-{formatPrice(cart.discounte)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Envío</span>
          <span className="text-success font-medium">Gratis</span>
        </div>

        <div className="border-t border-border pt-3 mt-2 flex justify-between text-base font-bold text-foreground">
          <span>Total a Pagar</span>
          <span>{formatPrice(cart.totalDiscountedPrice)}</span>
        </div>
      </div>

      {showCheckoutButton && (
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="w-full mt-6"
          onClick={() => router.push('/checkout')}
        >
          Proceder al Checkout
          <ArrowRight size={18} />
        </Button>
      )}
    </div>
  );
};
