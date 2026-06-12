'use client';

import { useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { AuthGuard } from '@/guards/AuthGuard';
import { CartItemRow } from '@/components/cart/cartItemRow';
import { CartSummary } from '@/components/cart/cartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { Spinner } from '@/components/ui/Spinner';
import { ShoppingCart } from 'lucide-react';

export default function CartPage() {
  const { cart, loading, error, refreshCart } = useCart();

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
          <Spinner size="lg" />
          <p className="text-sm text-foreground-muted">Cargando carrito...</p>
        </div>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="bg-surface-red border border-border-red rounded-xl p-4 text-text-on-red text-sm">
            <p className="font-semibold">Error al cargar el carrito</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const hasItems = cart && cart.cartItems && cart.cartItems.length > 0;

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 min-h-screen">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart size={28} className="text-accent" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Carrito de Compras</h1>
        </div>

        {!hasItems ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 shadow-sm">
                <h2 className="text-base font-semibold text-foreground mb-4">
                  {cart.totalItem} {cart.totalItem === 1 ? 'producto' : 'productos'}
                </h2>
                <div className="divide-y divide-border">
                  {cart.cartItems.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <CartSummary cart={cart} />
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
