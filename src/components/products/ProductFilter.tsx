import { ProductFilters } from '@/services/product.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface ProductFilterProps {
  filters: ProductFilters;
  searchTerm: string;
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

      <Input
        label="Categoría"
        placeholder="Ej. shoes"
        value={filters.category ?? ''}
        onChange={(event) => onFiltersChange({ category: event.target.value })}
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
      />

      <Select
        label="Ordenar"
        options={sortOptions}
        placeholder="Sin orden"
        value={filters.sort ?? ''}
        onChange={(event) => onFiltersChange({ sort: event.target.value || undefined })}
      />

      <Select
        label="Stock"
        options={stockOptions}
        value={filters.stock === undefined ? '' : String(filters.stock)}
        onChange={(event) => {
          const value = event.target.value;
          onFiltersChange({ stock: value ? value === 'true' : undefined });
        }}
      />

      <Button variant="secondary" className="w-full" onClick={onReset}>
        Limpiar filtros
      </Button>
    </aside>
  );
};
