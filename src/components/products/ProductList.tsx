import { Product } from '@/models/product.model';
import { ProductCard } from './ProductCard';
import { Spinner } from '@/components/ui/Spinner';

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

export const ProductList = ({
  products,
  loading = false,
  error,
  emptyMessage = 'No se encontraron productos para los filtros seleccionados.',
}: ProductListProps) => {
  if (loading) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <p className="rounded-lg bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)] p-4 text-sm text-[var(--color-error)]">{error}</p>;
  }

  if (products.length === 0) {
    return <p className="rounded-lg border border-dashed border-[var(--color-border)] p-8 text-center text-[var(--color-foreground-muted)]">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
