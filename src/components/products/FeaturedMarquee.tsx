'use client';

import { Product } from '@/models/product.model';
import { ProductCard } from './ProductCard';
import { Spinner } from '@/components/ui/Spinner';
import { Package } from 'lucide-react';

interface FeaturedMarqueeProps {
  products: Product[];
  loading?: boolean;
  error: string | null;
  emptyMessage?: string;
}

/* Ancho responsive de cada tarjeta: ~1.3 visibles en móvil y ~4 por fila en escritorio */
const CARD_WRAPPER = 'shrink-0 w-[260px] sm:w-[280px] md:w-[300px] pr-4 sm:pr-5';

/**
 * Una pista (fila) del carrusel. Los nodos se duplican (set + set) para que la
 * animación CSS `translateX(-50%)` produzca un bucle infinito sin saltos.
 */
const MarqueeRow = ({
  products,
  direction,
}: {
  products: Product[];
  direction: 'left' | 'right';
}) => {
  const loop = [...products, ...products];

  return (
    <div className="marquee py-4 sm:py-6">
      <div className={`marquee-track marquee-track--${direction}`}>
        {loop.map((product, index) => (
          <div
            key={`${product.id}-${index}`}
            className={CARD_WRAPPER}
            /* Las copias clonadas se ocultan a lectores de pantalla */
            aria-hidden={index >= products.length}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

/* Repite los elementos hasta llenar pantallas anchas manteniendo el bucle perfecto */
const fillRow = (items: Product[]): Product[] => {
  if (items.length === 0) return items;
  const filled: Product[] = [];
  while (filled.length < 8) filled.push(...items);
  return filled;
};

export const FeaturedMarquee = ({
  products,
  loading = false,
  error,
  emptyMessage = 'No hay productos disponibles por el momento.',
}: FeaturedMarqueeProps) => {
  if (loading) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border-red bg-surface-red p-4 flex items-center gap-3">
        <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-error">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center bg-surface">
        <Package size={48} className="mx-auto text-foreground-muted mb-4" />
        <p className="text-foreground-muted">{emptyMessage}</p>
      </div>
    );
  }

  // Dividimos el catálogo en dos pistas independientes.
  const mid = Math.ceil(products.length / 2);
  const topRow = fillRow(products.slice(0, mid));
  const bottomItems = products.slice(mid);
  const bottomRow = fillRow(bottomItems.length ? bottomItems : products);

  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      {/* Fila superior: se desplaza hacia la DERECHA */}
      <MarqueeRow products={topRow} direction="right" />
      {/* Fila inferior: se desplaza hacia la IZQUIERDA */}
      <MarqueeRow products={bottomRow} direction="left" />
    </div>
  );
};
