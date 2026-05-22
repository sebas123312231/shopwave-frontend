import Link from 'next/link';
import { Product } from '@/models/product.model';
import { formatPrice } from '@/utils/currency.util';
import { Badge } from '@/components/ui/Badge';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--color-surface-hover)]"
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-[var(--color-background-alt)]">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {product.discountPersent > 0 && (
          <Badge variant="danger" className="absolute right-2 top-2">
            -{product.discountPersent}%
          </Badge>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="line-clamp-2 min-h-12 text-sm font-semibold text-[var(--color-foreground)]">{product.title}</h3>
        <p className="text-xs text-[var(--color-foreground-muted)]">{product.brand}</p>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-[var(--color-accent)]">{formatPrice(product.discountedPrice)}</span>
          {product.discountPersent > 0 && (
            <span className="text-xs text-[var(--color-foreground-muted)] line-through">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};
