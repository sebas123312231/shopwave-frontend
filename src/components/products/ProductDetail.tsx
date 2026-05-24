'use client';

import { useMemo, useState } from 'react';
import { Product } from '@/models/product.model';
import { formatPrice } from '@/utils/currency.util';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Star, ShoppingCart, Minus, Plus } from 'lucide-react';

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
    console.log('TODO add to cart', { productId: product.id, selectedSize, quantity });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < Math.round(rating) ? 'fill-accent text-accent' : 'text-border'}
      />
    ));
  };

  return (
    <section className="grid gap-10 lg:grid-cols-[3fr_4fr]">
      <div className="overflow-hidden rounded-2xl shadow-2xl border border-border bg-white">
        <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wider text-accent font-medium">{product.brand}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight">{product.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {renderStars(averageRating)}
          </div>
          <span className="text-sm text-foreground-muted">
            {averageRating > 0 ? `${averageRating.toFixed(1)} / 5 (${ratingsCount} calificaciones)` : 'Sin calificaciones'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {product.discountPersent > 0 && <Badge variant="danger">-{product.discountPersent}%</Badge>}
          <Badge variant={product.quantity > 0 ? 'success' : 'warning'}>
            {product.quantity > 0 ? 'Disponible' : 'Sin stock'}
          </Badge>
          {product.category?.name && <Badge variant="default">{product.category.name}</Badge>}
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-accent">{formatPrice(product.discountedPrice)}</span>
          {product.discountPersent > 0 && (
            <span className="text-lg text-foreground-muted line-through">{formatPrice(product.price)}</span>
          )}
        </div>

        <p className="leading-relaxed text-foreground-muted">{product.description}</p>

        {availableSizes.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Talla</p>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    selectedSize === size
                      ? 'border-accent bg-accent text-white shadow-md'
                      : 'border-border bg-white text-foreground hover:border-accent hover:bg-accent/5'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-xl border border-border bg-white">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2.5 hover:bg-background-alt transition-colors rounded-l-xl"
            >
              <Minus size={16} />
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
              className="p-2.5 hover:bg-background-alt transition-colors rounded-r-xl"
            >
              <Plus size={16} />
            </button>
          </div>
          <span className="text-sm text-foreground-muted">Stock: {product.quantity}</span>
        </div>

        <Button
          size="lg"
          className="w-full sm:w-auto"
          onClick={handleAddToCart}
          disabled={product.quantity <= 0}
        >
          <ShoppingCart size={20} />
          Agregar al carrito
        </Button>
      </div>
    </section>
  );
};