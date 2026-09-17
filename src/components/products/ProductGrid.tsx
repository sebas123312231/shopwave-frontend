import type { Product } from '@/contracts/shopwave.schema';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

export function ProductGrid({ products, loading = false }: { products: Product[]; loading?: boolean }) {
  if (loading) return <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <ProductCardSkeleton key={index} />)}</div>;
  if (!products.length) return <div className="card px-6 py-16 text-center"><p className="text-lg font-semibold">No encontramos productos</p><p className="mt-2 text-sm text-muted">Prueba otra búsqueda o limpia los filtros.</p></div>;
  return <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}
