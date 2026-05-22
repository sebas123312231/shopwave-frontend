'use client';

import { useMemo, useState } from 'react';
import { Product } from '@/models/product.model';
import { formatPrice } from '@/utils/currency.util';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ProductDetailProps {
  product: Product;
  averageRating: number;
  ratingsCount: number;
}

export const ProductDetail = ({ product, averageRating, ratingsCount }: ProductDetailProps) => {
  const availableSizes = useMemo(
    () => product.sizes?.filter((size) => size.quantity > 0).map((size) => size.name) ?? [],
    [product.sizes],
  );

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] ?? '');
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    // TODO: integrar con CartContext.addItem cuando el flujo de carrito del Equipo 2 este disponible.
    console.log('TODO add to cart', { productId: product.id, selectedSize, quantity });
  };

  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-sm uppercase tracking-wider text-[var(--color-foreground-muted)]">{product.brand}</p>
          <h1 className="mt-1 text-3xl font-bold leading-tight">{product.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {product.discountPersent > 0 && <Badge variant="danger">-{product.discountPersent}%</Badge>}
          <Badge variant={product.quantity > 0 ? 'success' : 'warning'}>
            {product.quantity > 0 ? 'Disponible' : 'Sin stock'}
          </Badge>
          {product.category?.name && <Badge>{product.category.name}</Badge>}
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-[var(--color-accent)]">{formatPrice(product.discountedPrice)}</span>
          {product.discountPersent > 0 && (
            <span className="text-lg text-[var(--color-foreground-muted)] line-through">{formatPrice(product.price)}</span>
          )}
        </div>

        <p className="text-sm text-[var(--color-foreground-muted)]">
          {averageRating > 0
            ? `Valoración promedio ${averageRating.toFixed(1)} / 5 (${ratingsCount} calificaciones)`
            : 'Este producto aún no tiene calificaciones'}
        </p>

        <p className="leading-relaxed text-[var(--color-foreground)]">{product.description}</p>

        {availableSizes.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Talla</p>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  className={`rounded-md border px-3 py-1.5 text-sm transition ${selectedSize === size ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white' : 'border-[var(--color-border)] bg-[var(--color-surface)]'}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-28">
          <label className="mb-1.5 block text-sm font-semibold">Cantidad</label>
          <input
            type="number"
            min={1}
            max={Math.max(1, product.quantity)}
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
          />
        </div>

        <Button className="w-full sm:w-auto" onClick={handleAddToCart} disabled={product.quantity <= 0}>
          Agregar al carrito
        </Button>
      </div>
    </section>
  );
};
