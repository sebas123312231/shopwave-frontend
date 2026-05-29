import { ProductFilters } from '@/services/product.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SlidersHorizontal, Search, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ProductFilterProps {
  filters: ProductFilters;
  searchTerm: string;
  isSearchActive?: boolean;
  onSearchChange: (value: string) => void;
  onFiltersChange: (filters: Partial<ProductFilters>) => void;
  onReset: () => void;
}

const sortOptions = [
  { label: 'Precio: menor a mayor', value: 'price_asc' },
  { label: 'Precio: mayor a menor', value: 'price_desc' },
];


export const ProductFilter = ({
  filters,
  searchTerm,
  isSearchActive = false,
  onSearchChange,
  onFiltersChange,
  onReset,
}: ProductFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <aside className="rounded-2xl bg-white shadow-lg border border-border overflow-hidden">
      {/* Filter header - always visible */}
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="flex w-full items-center justify-between p-5 md:p-6 lg:cursor-default"
        type="button"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <SlidersHorizontal size={20} />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
        </div>
        <ChevronDown
          size={20}
          className={`text-foreground-muted transition-transform duration-200 lg:hidden ${
            isFilterOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Filter body - collapsible on mobile, always visible on lg+ */}
      <div
        className={`border-t border-border transition-all duration-300 ease-in-out lg:max-h-none lg:opacity-100 lg:overflow-visible ${
          isFilterOpen
            ? 'max-h-[2000px] opacity-100 overflow-visible'
            : 'max-h-0 opacity-0 overflow-hidden lg:max-h-none lg:opacity-100 lg:overflow-visible'
        }`}
      >
        <div className="p-5 md:p-6 space-y-5">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full rounded-xl border border-border bg-background-alt pl-10 pr-8 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/20 placeholder:text-foreground-muted"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {isSearchActive && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 flex items-center gap-2">
              <Search size={16} className="text-accent" />
              <p className="text-xs text-accent-dark">Filtros desactivados durante búsqueda</p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Categoría"
              placeholder="Ej. shoes"
              value={filters.category ?? ''}
              onChange={(event) => onFiltersChange({ category: event.target.value })}
              disabled={isSearchActive}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Precio mín"
                type="number"
                min={0}
                value={filters.minPrice ?? ''}
                onChange={(event) => {
                  const value = event.target.value;
                  onFiltersChange({ minPrice: value ? Number(value) : undefined });
                }}
                disabled={isSearchActive}
              />
              <Input
                label="Precio máx"
                type="number"
                min={0}
                value={filters.maxPrice ?? ''}
                onChange={(event) => {
                  const value = event.target.value;
                  onFiltersChange({ maxPrice: value ? Number(value) : undefined });
                }}
                disabled={isSearchActive}
              />
            </div>


            <Select
              label="Ordenar"
              options={sortOptions}
              placeholder="Sin orden"
              value={filters.sort ?? ''}
              onChange={(event) => onFiltersChange({ sort: event.target.value || undefined })}
              disabled={isSearchActive}
            />


            <Input
              label="Colores"
              placeholder="negro, blanco, rojo"
              value={(filters.colors ?? []).join(', ')}
              onChange={(event) => {
                const raw = event.target.value;
                const colors = raw
                  .split(',')
                  .map((c) => c.trim())
                  .filter((c) => c.length > 0);
                onFiltersChange({ colors: colors.length > 0 ? colors : undefined });
              }}
              disabled={isSearchActive}
            />

            <Input
              label="Tallas"
              placeholder="S, M, L, XL"
              value={(filters.sizes ?? []).join(', ')}
              onChange={(event) => {
                const raw = event.target.value;
                const sizes = raw
                  .split(',')
                  .map((s) => s.trim())
                  .filter((s) => s.length > 0);
                onFiltersChange({ sizes: sizes.length > 0 ? sizes : undefined });
              }}
              disabled={isSearchActive}
            />
          </div>

          <Button variant="secondary" className="w-full" onClick={onReset}>
            Limpiar filtros
          </Button>
        </div>
      </div>
    </aside>
  );
};