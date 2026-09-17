import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getCatalog, getFacets, type CatalogQuery } from '@/lib/server/catalog';
import { CatalogControls } from '@/components/products/CatalogControls';
import { ProductGrid } from '@/components/products/ProductGrid';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Catálogo' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toCatalogQuery(value: Record<string, string | string[] | undefined>): CatalogQuery {
  const one = (key: string) => typeof value[key] === 'string' ? value[key] : undefined;
  const many = (key: string) => Array.isArray(value[key]) ? value[key] : typeof value[key] === 'string' ? [value[key]] : undefined;
  return { q: one('q'), categoryId: one('categoryId'), color: many('color'), variantLabel: many('variantLabel'), minPriceMinor: one('minPriceMinor'), maxPriceMinor: one('maxPriceMinor'), inStock: one('inStock'), sort: one('sort'), page: one('page'), size: one('size') };
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const query = toCatalogQuery(raw);
  const [catalog, facets] = await Promise.all([getCatalog(query), getFacets()]);
  const currentPage = catalog?.page ?? Number(query.page ?? 0);
  const makePageUrl = (page: number) => { const params = new URLSearchParams(); Object.entries(raw).forEach(([key, value]) => { if (Array.isArray(value)) value.forEach((item) => params.append(key, item)); else if (value) params.set(key, value); }); params.set('page', String(page)); return `/products?${params.toString()}`; };
  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-10 max-w-2xl"><p className="eyebrow">Catálogo</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Encuentra algo que se sienta tuyo.</h1><p className="mt-4 text-lg leading-8 text-muted">Explora productos con filtros que respetan lo que estás buscando.</p></div><CatalogControls key={JSON.stringify(raw)} initial={raw} facets={facets} />{!catalog && <div className="mb-6 rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning" role="status">El catálogo no está disponible en este momento. Verifica que el backend local esté activo.</div>}{!facets && <div className="mb-6 rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-muted" role="status">Los filtros avanzados no están disponibles; puedes usar la búsqueda y el ordenamiento.</div>}<ProductGrid products={catalog?.items ?? []} /><div className="mt-8 flex items-center justify-between text-sm text-muted"><span>{catalog ? `${catalog.totalItems} productos` : 'Sin conexión'}</span><div className="flex gap-2">{currentPage > 0 && <Link href={makePageUrl(currentPage - 1)} className="button button-secondary"><ArrowLeft size={16} />Anterior</Link>}{catalog && currentPage + 1 < catalog.totalPages && <Link href={makePageUrl(currentPage + 1)} className="button button-secondary">Siguiente<ArrowRight size={16} /></Link>}</div></div></div>;
}
