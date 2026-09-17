'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Facets } from '@/contracts/shopwave.schema';

type Props = { initial: Record<string, string | string[] | undefined>; facets: Facets | null };

type FilterState = {
  q: string;
  categoryId: string;
  colors: string[];
  variantLabels: string[];
  minPrice: string;
  maxPrice: string;
  inStock: string;
  sort: string;
};

function values(value: string | string[] | undefined) {
  return Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
}

function one(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : '';
}

function minorToMajor(value: string | string[] | undefined) {
  const raw = one(value);
  if (!raw.trim()) return '';
  const amount = Number(raw);
  return Number.isFinite(amount) && amount >= 0 ? String(amount / 100) : '';
}

function majorToMinor(value: string) {
  if (!value.trim()) return '';
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? String(Math.round(amount * 100)) : '';
}

function initialState(initial: Record<string, string | string[] | undefined>): FilterState {
  return {
    q: one(initial.q),
    categoryId: one(initial.categoryId),
    colors: values(initial.color),
    variantLabels: values(initial.variantLabel),
    minPrice: minorToMajor(initial.minPriceMinor),
    maxPrice: minorToMajor(initial.maxPriceMinor),
    inStock: one(initial.inStock),
    sort: one(initial.sort) || 'newest',
  };
}

export function CatalogControls({ initial, facets }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState(() => initialState(initial));
  const [filtersOpen, setFiltersOpen] = useState(false);

  const apply = (overrides: Partial<FilterState> = {}) => {
    const params = new URLSearchParams();
    const next = { ...state, ...overrides };
    if (next.q.trim()) params.set('q', next.q.trim());
    if (next.categoryId) params.set('categoryId', next.categoryId);
    next.colors.filter(Boolean).forEach((color) => params.append('color', color));
    next.variantLabels.filter(Boolean).forEach((label) => params.append('variantLabel', label));
    const minPriceMinor = majorToMinor(next.minPrice);
    const maxPriceMinor = majorToMinor(next.maxPrice);
    if (minPriceMinor) params.set('minPriceMinor', minPriceMinor);
    if (maxPriceMinor) params.set('maxPriceMinor', maxPriceMinor);
    if (next.inStock === 'true' || next.inStock === 'false') params.set('inStock', next.inStock);
    if (next.sort && next.sort !== 'newest') params.set('sort', next.sort);
    params.delete('page');
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  };

  const clear = () => {
    setState(initialState({}));
    router.push(pathname);
    setFiltersOpen(false);
  };

  const toggle = (key: 'colors' | 'variantLabels', value: string) => {
    const selected = state[key];
    const next = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];
    setState((current) => ({ ...current, [key]: next }));
  };

  const filters = <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-semibold">Categoría
        <select className="field" value={state.categoryId} onChange={(event) => setState((current) => ({ ...current, categoryId: event.target.value }))}>
        <option value="">Todas las categorías</option>
        {(facets?.categories ?? []).map((item) => <option key={item.id} value={item.id}>{item.path.map((part) => part.name).join(' / ')}</option>)}
      </select>
      </label>
      <label className="text-sm font-semibold">Disponibilidad
        <select className="field" value={state.inStock} onChange={(event) => setState((current) => ({ ...current, inStock: event.target.value }))}>
          <option value="">Todos los productos</option>
          <option value="true">En stock</option>
          <option value="false">Agotados</option>
        </select>
      </label>
      <label className="text-sm font-semibold">Precio mínimo (BOB)
        <input className="field" type="number" min="0" step="0.01" inputMode="decimal" value={state.minPrice} onChange={(event) => setState((current) => ({ ...current, minPrice: event.target.value }))} placeholder={facets ? String(facets.minPriceMinor / 100) : '0'} />
      </label>
      <label className="text-sm font-semibold">Precio máximo (BOB)
        <input className="field" type="number" min="0" step="0.01" inputMode="decimal" value={state.maxPrice} onChange={(event) => setState((current) => ({ ...current, maxPrice: event.target.value }))} placeholder={facets ? String(facets.maxPriceMinor / 100) : '0'} />
      </label>
    </div>
    {(facets?.colors.length ?? 0) > 0 && <fieldset>
      <legend className="text-sm font-semibold">Color</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {facets?.colors.map((color) => <label key={color} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-line bg-page px-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
          <input type="checkbox" checked={state.colors.includes(color)} onChange={() => toggle('colors', color)} className="size-4 accent-brand" />
          {color}
        </label>)}
      </div>
    </fieldset>}
    {(facets?.variantLabels.length ?? 0) > 0 && <fieldset>
      <legend className="text-sm font-semibold">Variantes disponibles</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {facets?.variantLabels.map((label) => <label key={label} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-line bg-page px-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
          <input type="checkbox" checked={state.variantLabels.includes(label)} onChange={() => toggle('variantLabels', label)} className="size-4 accent-brand" />
          {label}
        </label>)}
      </div>
    </fieldset>}
    <div className="flex flex-wrap gap-2">
      <button type="button" className="button button-primary" onClick={() => { apply(); setFiltersOpen(false); }}>Aplicar filtros</button>
      <button type="button" className="button button-secondary" onClick={clear}><X size={16} />Limpiar</button>
    </div>
  </div>;

  return <div className="mb-8 space-y-3">
    <div className="flex flex-col gap-3 sm:flex-row">
      <form onSubmit={(event) => { event.preventDefault(); apply({}); }} className="relative flex-1">
        <label htmlFor="catalog-search" className="sr-only">Buscar productos</label>
        <Search size={18} className="absolute left-3.5 top-3.5 text-muted" aria-hidden="true" />
        <input id="catalog-search" value={state.q} onChange={(event) => setState((current) => ({ ...current, q: event.target.value }))} className="field mt-0 pl-10 pr-24" placeholder="Buscar por nombre, marca o descripción" maxLength={100} />
        <button type="submit" className="button button-primary absolute right-1.5 top-1.5 min-h-9 px-3 text-xs">Buscar</button>
      </form>
      <Dialog.Root open={filtersOpen} onOpenChange={setFiltersOpen}>
        <Dialog.Trigger asChild><button type="button" className="button button-secondary sm:hidden"><SlidersHorizontal size={16} />Filtros</button></Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="fixed inset-x-3 bottom-3 z-50 max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl bg-panel p-5 shadow-2xl sm:inset-x-auto sm:right-6 sm:top-24 sm:bottom-auto sm:w-[min(28rem,calc(100vw-3rem))]">
            <div className="flex items-center justify-between gap-4"><Dialog.Title className="text-lg font-semibold">Filtrar catálogo</Dialog.Title><Dialog.Close asChild><button type="button" className="icon-button" aria-label="Cerrar filtros"><X size={18} /></button></Dialog.Close></div>
            <Dialog.Description className="sr-only">Ajusta categorías, disponibilidad, precios, colores y variantes del catálogo.</Dialog.Description>
            <div className="mt-5">{filters}</div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <select aria-label="Ordenar catálogo" className="field mt-0 sm:w-48" value={state.sort} onChange={(event) => { setState((current) => ({ ...current, sort: event.target.value })); apply({ sort: event.target.value }); }}>
        <option value="newest">Más recientes</option><option value="price_asc">Precio menor</option><option value="price_desc">Precio mayor</option><option value="discount_desc">Mejor descuento</option>
      </select>
    </div>
    <div className="hidden rounded-2xl border border-line bg-panel p-4 sm:block">{filters}</div>
  </div>;
}
