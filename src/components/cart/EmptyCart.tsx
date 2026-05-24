'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export const EmptyCart: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-lg border border-gray-100 shadow-xs max-w-md mx-auto my-8">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
      <p className="text-sm text-gray-500 mb-8 max-w-xs">
        Parece que aún no has agregado productos a tu bolsa de compras. ¡Explora nuestro catálogo y descubre ofertas increíbles!
      </p>
      <Button
        variant="primary"
        className="px-6 py-2.5 font-medium"
        onClick={() => router.push('/products')}
      >
        Ver Catálogo de Productos
      </Button>
    </div>
  );
};