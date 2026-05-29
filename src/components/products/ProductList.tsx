import { Product } from '@/models/product.model';
import { ProductCard } from './ProductCard';
import { Spinner } from '@/components/ui/Spinner';
import { Package } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  error: string | null;
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
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
        <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-error">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center bg-white">
        <Package size={48} className="mx-auto text-foreground-muted mb-4" />
        <p className="text-foreground-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="animate-slideUp h-full"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};