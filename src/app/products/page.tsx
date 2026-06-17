"use client";

import { ProductFilter } from '@/components/products/ProductFilter';
import { ProductList } from '@/components/products/ProductList';
import { Button } from '@/components/ui/Button';
import { useProducts } from '@/hooks/useProducts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Package } from 'lucide-react';

export default function ProductsPage() {
  const {
    productsPage,
    filters,
    searchTerm,
    isSearchActive,
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
    },
  });

  const currentPage = productsPage?.number ?? 0;
  const totalPages = productsPage?.totalPages ?? 1;

  return (
    <div className="mx-auto px-2 md:px-8 py-6 md:py-8">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <Package size={28} className="text-accent" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Catálogo de productos</h1>
        </div>
        <p className="mt-2 text-foreground-muted">Explora y filtra productos por categoría, precio, descuento y disponibilidad.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="animate-slideInLeft">
          <ProductFilter
            filters={filters}
            searchTerm={searchTerm}
            isSearchActive={isSearchActive}
            onSearchChange={setSearchTerm}
            onFiltersChange={updateFilters}
            onReset={resetFilters}
          />
        </div>

        <section className="space-y-6">
          <ProductList products={productsPage?.content ?? []} loading={loading} error={error} />

          {productsPage && totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl bg-surface border border-border px-5 py-4 shadow-sm">
              <p className="text-sm text-foreground-muted">
                Página <span className="font-semibold text-foreground">{currentPage + 1}</span> de{' '}
                <span className="font-semibold text-foreground">{totalPages}</span>
              </p>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={loading || currentPage <= 0}
                  onClick={() => changePage(Math.max(0, currentPage - 1))}
                >
                  <ChevronLeft size={16} />
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={loading || currentPage >= totalPages - 1}
                  onClick={() => changePage(Math.min(totalPages - 1, currentPage + 1))}
                >
                  Siguiente
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}