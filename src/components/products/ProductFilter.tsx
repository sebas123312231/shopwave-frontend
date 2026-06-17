'use client';

import { ProductFacets, ProductFilters } from '@/services/product.service';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { SlidersHorizontal, X, Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface ProductFilterProps {
  filters: ProductFilters;
  facets: ProductFacets;
  isSearchActive?: boolean;
  onFiltersChange: (filters: Partial<ProductFilters>) => void;
  onReset: () => void;
}

interface DraftFilters {
  category: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  colors: string[];
  sizes: string[];
  sort: string;
}

const sortOptions = [
  { label: 'Precio: menor a mayor', value: 'price_asc' },
  { label: 'Precio: mayor a menor', value: 'price_desc' },
  { label: 'Mayor descuento', value: 'discount' },
];

const fallbackColors = ['negro', 'blanco', 'rojo', 'azul', 'verde', 'gris', 'amarillo', 'rosa'];
const fallbackSizes = ['S', 'M', 'L', 'XL'];

// Maps common color names (ES/EN) to a swatch hex; unknown names fall back to the
// raw string (valid CSS keywords still render) or a neutral grey.
const colorHexMap: Record<string, string> = {
  negro: '#0f172a', black: '#0f172a',
  blanco: '#ffffff', white: '#ffffff',
  rojo: '#ef4444', red: '#ef4444',
  azul: '#3b82f6', blue: '#3b82f6',
  verde: '#22c55e', green: '#22c55e',
  amarillo: '#eab308', yellow: '#eab308',
  gris: '#6b7280', gray: '#6b7280', grey: '#6b7280',
  rosa: '#ec4899', pink: '#ec4899',
  morado: '#a855f7', purple: '#a855f7', violeta: '#a855f7',
  naranja: '#f97316', orange: '#f97316',
  cafe: '#92400e', marron: '#92400e', brown: '#92400e',
  beige: '#d6cdb7',
  dorado: '#d4af37', gold: '#d4af37',
  plata: '#c0c0c0', silver: '#c0c0c0',
  celeste: '#7dd3fc',
};

const resolveColor = (name: string): string => {
  const key = name.trim().toLowerCase();
  return colorHexMap[key] ?? key ?? '#94a3b8';
};

const isLightSwatch = (hex: string): boolean =>
  ['#ffffff', '#fff', 'white', '#d6cdb7', 'beige', '#c0c0c0', 'silver'].includes(hex.toLowerCase());

const draftFromFilters = (filters: ProductFilters): DraftFilters => ({
  category: filters.category ?? '',
  minPrice: filters.minPrice,
  maxPrice: filters.maxPrice,
  colors: filters.colors ?? [],
  sizes: filters.sizes ?? [],
  sort: filters.sort ?? '',
});

const countActiveFilters = (filters: ProductFilters): number => {
  let count = 0;
  if (filters.category) count += 1;
  if (filters.minPrice !== undefined) count += 1;
  if (filters.maxPrice !== undefined) count += 1;
  if (filters.colors && filters.colors.length > 0) count += 1;
  if (filters.sizes && filters.sizes.length > 0) count += 1;
  if (filters.sort) count += 1;
  return count;
};

export const ProductFilter = ({
  filters,
  facets,
  isSearchActive = false,
  onFiltersChange,
  onReset,
}: ProductFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<DraftFilters>(() => draftFromFilters(filters));

  const colorOptions = facets.colors.length > 0 ? facets.colors : fallbackColors;
  const sizeOptions = facets.sizes.length > 0 ? facets.sizes : fallbackSizes;

  const boundMin = facets.priceMin;
  const boundMax = facets.priceMax > facets.priceMin ? facets.priceMax : facets.priceMin + 100;

  const lowValue = draft.minPrice ?? boundMin;
  const highValue = draft.maxPrice ?? boundMax;
  const range = boundMax - boundMin || 1;
  const lowPct = ((Math.min(lowValue, highValue) - boundMin) / range) * 100;
  const highPct = ((Math.max(lowValue, highValue) - boundMin) / range) * 100;

  const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

  // Sync the draft with the applied filters, then open. This way a user who
  // closes without applying sees the real state again next time.
  const openDrawer = () => {
    setDraft(draftFromFilters(filters));
    setIsOpen(true);
  };

  // Lock body scroll + close on Escape while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const toggleColor = (color: string) => {
    setDraft((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const toggleSize = (size: string) => {
    setDraft((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleLowPrice = (value: number) => {
    setDraft((prev) => ({ ...prev, minPrice: Math.min(value, prev.maxPrice ?? boundMax) }));
  };

  const handleHighPrice = (value: number) => {
    setDraft((prev) => ({ ...prev, maxPrice: Math.max(value, prev.minPrice ?? boundMin) }));
  };

  const handleApply = () => {
    onFiltersChange({
      category: draft.category || undefined,
      minPrice: draft.minPrice,
      maxPrice: draft.maxPrice,
      colors: draft.colors.length > 0 ? draft.colors : undefined,
      sizes: draft.sizes.length > 0 ? draft.sizes : undefined,
      sort: draft.sort || undefined,
    });
    setIsOpen(false);
  };

  const handleClear = () => {
    setDraft({
      category: '',
      minPrice: undefined,
      maxPrice: undefined,
      colors: [],
      sizes: [],
      sort: '',
    });
    onReset();
  };

  return (
    <>
      {/* Trigger button — sits in the page toolbar */}
      <button
        type="button"
        onClick={openDrawer}
        className="relative inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:border-accent hover:bg-accent/5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <SlidersHorizontal size={18} className="text-accent" />
        Filtrar
        {activeCount > 0 && (
          <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-40 bg-primary-dark/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Off-canvas drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Filtros de productos"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-surface shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <SlidersHorizontal size={20} />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar filtros"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground-muted transition hover:bg-background-alt hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer body (scrollable) */}
        <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6">
          {isSearchActive && (
            <div className="flex items-center gap-2 rounded-xl border border-border-blue bg-surface-blue p-3">
              <SlidersHorizontal size={16} className="shrink-0 text-accent" />
              <p className="text-xs text-text-on-blue">
                Los filtros se desactivan mientras hay una búsqueda activa.
              </p>
            </div>
          )}

          {/* Category pills */}
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-foreground">Categoría</legend>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, category: '' }))}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                  draft.category === ''
                    ? 'border-accent bg-accent text-white shadow-sm'
                    : 'border-border bg-background-alt text-foreground-muted hover:border-accent hover:text-foreground'
                }`}
              >
                Todas
              </button>
              {facets.categories.map((category) => {
                const selected = draft.category === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, category }))}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition-all duration-200 ${
                      selected
                        ? 'border-accent bg-accent text-white shadow-sm'
                        : 'border-border bg-background-alt text-foreground-muted hover:border-accent hover:text-foreground'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Price range with dual slider */}
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-foreground">Rango de precio</legend>

            <div className="relative h-6 select-none">
              <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-border" />
              <div
                className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent"
                style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
              />
              <input
                type="range"
                className="dual-range"
                min={boundMin}
                max={boundMax}
                value={Math.min(lowValue, highValue)}
                onChange={(event) => handleLowPrice(Number(event.target.value))}
                aria-label="Precio mínimo"
              />
              <input
                type="range"
                className="dual-range"
                min={boundMin}
                max={boundMax}
                value={Math.max(lowValue, highValue)}
                onChange={(event) => handleHighPrice(Number(event.target.value))}
                aria-label="Precio máximo"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-foreground-muted">Mín</span>
                <input
                  type="number"
                  min={boundMin}
                  max={boundMax}
                  value={draft.minPrice ?? ''}
                  placeholder={`${boundMin}`}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      minPrice: event.target.value ? Number(event.target.value) : undefined,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background-alt px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-foreground-muted focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/20"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-foreground-muted">Máx</span>
                <input
                  type="number"
                  min={boundMin}
                  max={boundMax}
                  value={draft.maxPrice ?? ''}
                  placeholder={`${boundMax}`}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      maxPrice: event.target.value ? Number(event.target.value) : undefined,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background-alt px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-foreground-muted focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/20"
                />
              </label>
            </div>
          </fieldset>

          {/* Color swatches */}
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-foreground">Colores</legend>
            <div className="flex flex-wrap gap-2.5">
              {colorOptions.map((color) => {
                const hex = resolveColor(color);
                const selected = draft.colors.includes(color);
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleColor(color)}
                    title={color}
                    aria-pressed={selected}
                    aria-label={color}
                    className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                      selected
                        ? 'ring-2 ring-accent ring-offset-2'
                        : isLightSwatch(hex)
                          ? 'ring-1 ring-border'
                          : ''
                    }`}
                    style={{ backgroundColor: hex }}
                  >
                    {selected && (
                      <Check
                        size={16}
                        strokeWidth={3}
                        className={isLightSwatch(hex) ? 'text-foreground' : 'text-white'}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Size grid */}
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-foreground">Tallas</legend>
            <div className="grid grid-cols-4 gap-2">
              {sizeOptions.map((size) => {
                const selected = draft.sizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    aria-pressed={selected}
                    className={`flex items-center justify-center rounded-lg border py-2.5 text-sm font-semibold uppercase transition-all duration-200 ${
                      selected
                        ? 'border-accent bg-accent text-white shadow-sm'
                        : 'border-border bg-background-alt text-foreground hover:border-accent hover:bg-accent/5'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Sort */}
          <Select
            label="Ordenar por"
            options={sortOptions}
            placeholder="Relevancia"
            value={draft.sort}
            onChange={(event) => setDraft((prev) => ({ ...prev, sort: event.target.value }))}
          />
        </div>

        {/* Drawer footer — actions */}
        <div className="flex gap-3 border-t border-border bg-surface px-5 py-4">
          <Button variant="secondary" className="flex-1" onClick={handleClear}>
            Limpiar filtros
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleApply}>
            Aplicar filtros
          </Button>
        </div>
      </aside>
    </>
  );
};
