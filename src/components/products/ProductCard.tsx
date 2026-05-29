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
      className="group rounded-2xl bg-surface shadow-sm border border-transparent hover:shadow-xl hover:scale-[1.02] hover:border-accent/30 transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-background-alt">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.discountPersent > 0 && (
          <Badge variant="danger" className="absolute top-3 left-3">
            -{product.discountPersent}%
          </Badge>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs uppercase tracking-wider text-foreground-muted font-medium">{product.brand}</p>
        <h3 className="line-clamp-2 text-base font-semibold text-foreground leading-snug mt-2">{product.title}</h3>

        <div className="flex items-baseline gap-2 pt-1 mt-auto">
          <span className="text-lg font-bold text-accent">{formatPrice(product.discountedPrice)}</span>
          {product.discountPersent > 0 && (
            <span className="text-sm text-foreground-muted line-through">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};