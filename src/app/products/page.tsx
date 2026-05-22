"use client";

import { ProductFilter } from '@/components/products/ProductFilter';
import { ProductList } from '@/components/products/ProductList';
import { Button } from '@/components/ui/Button';
import { useProducts } from '@/hooks/useProducts';

export default function ProductsPage() {
  const {
    productsPage,
    filters,
    searchTerm,
    loading,
    error,
    setSearchTerm,
    updateFilters,
    changePage,
    resetFilters,
  } = useProducts({
    initialFilters: {
      pageNumber: 0,
      pageSize: 12,
      minDiscount: 0,
    },
  });

  const currentPage = productsPage?.number ?? 0;
  const totalPages = productsPage?.totalPages ?? 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Catálogo de productos</h1>
        <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">Explora y filtra productos por categoría, precio, descuento y disponibilidad.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <ProductFilter
          filters={filters}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onFiltersChange={updateFilters}
          onReset={resetFilters}
        />

        <section className="space-y-5">
          <ProductList products={productsPage?.content ?? []} loading={loading} error={error} />

          <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
            <p className="text-sm text-[var(--color-foreground-muted)]">
              Página {currentPage + 1} de {totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={loading || currentPage <= 0}
                onClick={() => changePage(Math.max(0, currentPage - 1))}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                disabled={loading || currentPage >= totalPages - 1}
                onClick={() => changePage(Math.min(totalPages - 1, currentPage + 1))}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}