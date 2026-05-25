'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, ArrowRight } from 'lucide-react';

export const EmptyCart: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-surface rounded-2xl border-2 border-dashed border-border max-w-md mx-auto animate-fadeIn">
      <div className="w-20 h-20 bg-background-alt rounded-full flex items-center justify-center mb-6">
        <ShoppingCart size={36} className="text-foreground-muted" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">Tu carrito está vacío</h2>
      <p className="text-sm text-foreground-muted mb-8 max-w-xs">
        Parece que aún no has agregado productos a tu bolsa de compras. ¡Explora nuestro catálogo y descubre ofertas increíbles!
      </p>
      <Button
        variant="primary"
        className="px-6 py-2.5 font-medium"
        onClick={() => router.push('/products')}
      >
        Ver Catálogo de Productos
        <ArrowRight size={16} />
      </Button>
    </div>
  );
};
