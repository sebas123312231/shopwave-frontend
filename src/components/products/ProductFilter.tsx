import { ProductFilters } from '@/services/product.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

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

const stockOptions = [
  { label: 'Todos', value: '' },
  { label: 'Solo con stock', value: 'true' },
  { label: 'Sin stock', value: 'false' },
];

export const ProductFilter = ({
  filters,
  searchTerm,
  isSearchActive = false,
  onSearchChange,
  onFiltersChange,
  onReset,
}: ProductFilterProps) => {
  return (
    <aside className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h2 className="text-lg font-semibold">Filtros</h2>

      <Input
        label="Buscar"
        placeholder="Ej. zapatilla negra"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      {isSearchActive && (
        <p className="rounded-md bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] px-2.5 py-2 text-xs text-[var(--color-warning)]">
          Los filtros están desactivados mientras hay una búsqueda activa.
        </p>
      )}

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

      <Input
        label="Descuento mínimo (%)"
        type="number"
        min={0}
        max={100}
        value={filters.minDiscount ?? 0}
        onChange={(event) => {
          const value = event.target.value;
          onFiltersChange({ minDiscount: value ? Number(value) : 0 });
        }}
        disabled={isSearchActive}
      />

      <Select
        label="Ordenar"
        options={sortOptions}
        placeholder="Sin orden"
        value={filters.sort ?? ''}
        onChange={(event) => onFiltersChange({ sort: event.target.value || undefined })}
        disabled={isSearchActive}
      />

      <Select
        label="Stock"
        options={stockOptions}
        value={filters.stock === undefined ? '' : String(filters.stock)}
        onChange={(event) => {
          const value = event.target.value;
          onFiltersChange({ stock: value ? value === 'true' : undefined });
        }}
        disabled={isSearchActive}
      />

      <Input
        label="Colores (separados por coma)"
        placeholder="Ej. negro, blanco, rojo"
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
        label="Tallas (separadas por coma)"
        placeholder="Ej. S, M, L, XL"
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

      <Button variant="secondary" className="w-full" onClick={onReset}>
        Limpiar filtros
      </Button>
    </aside>
  );
};
