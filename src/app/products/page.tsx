"use client";

import { useEffect, useState } from 'react';
import { ProductFilter } from '@/components/products/ProductFilter';
import { ProductList } from '@/components/products/ProductList';
import { Button } from '@/components/ui/Button';
import { useProducts } from '@/hooks/useProducts';
import { ProductFacets, ProductService } from '@/services/product.service';
import { ChevronLeft, ChevronRight, Package, Search, X } from 'lucide-react';

const emptyFacets: ProductFacets = {
  categories: [],
  colors: [],
  sizes: [],
  priceMin: 0,
  priceMax: 1000,
};

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

  const [facets, setFacets] = useState<ProductFacets>(emptyFacets);

  useEffect(() => {
    let active = true;
    ProductService.getFacets()
      .then((result) => {
        if (active) setFacets(result);
      })
      .catch(() => {
        /* keep fallback facets on error */
      });
    return () => {
      active = false;
    };
  }, []);

  const currentPage = productsPage?.number ?? 0;
  const totalPages = productsPage?.totalPages ?? 1;

  return (
    <div className="mx-auto px-2 md:px-8 py-6 md:py-8">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <Package size={28} className="text-accent" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Catálogo de productos</h1>
        </div>
        <p className="mt-2 text-foreground-muted">Explora y filtra productos por categoría, precio, descuento y disponibilidad.</p>
      </header>

      {/* Toolbar: search (always visible) + filter trigger */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-border bg-surface pl-11 pr-9 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 placeholder:text-foreground-muted"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted transition hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <ProductFilter
          filters={filters}
          facets={facets}
          isSearchActive={isSearchActive}
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
  );
}
