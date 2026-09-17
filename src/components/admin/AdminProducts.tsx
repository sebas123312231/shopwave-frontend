'use client';

import Link from 'next/link';
import { Archive, Edit3, Plus } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, getErrorMessage } from '@/lib/client/api';
import { productPageSchema, type ProductPage } from '@/contracts/shopwave.schema';
import { formatPrice } from '@/lib/format';

export function AdminProducts() {
  const client = useQueryClient();
  const query = useQuery<ProductPage>({ queryKey: ['admin-products'], queryFn: async () => productPageSchema.parse(await apiFetch('/api/store/admin/products?page=0&size=48')) });
  const archive = useMutation({ mutationFn: ({ id, active, version }: { id: string; active: boolean; version: number }) => apiFetch(`/api/store/admin/products/${id}/archive`, { method: 'PATCH', body: JSON.stringify({ active, version }) }), onSuccess: () => client.invalidateQueries({ queryKey: ['admin-products'] }) });
  if (query.isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-brand-soft/60" />;
  if (query.error || !query.data) return <div className="rounded-2xl border border-danger/30 bg-danger-soft p-5 text-sm text-danger" role="alert">{getErrorMessage(query.error, 'No se pudo cargar el catálogo admin')}</div>;
  return <div><div className="mb-5 flex items-center justify-between"><p className="text-sm text-muted">{query.data.totalItems} productos</p><Link href="/admin/products/create" className="button button-primary"><Plus size={16} />Nuevo producto</Link></div><div className="card overflow-hidden"><div className="hidden grid-cols-[1fr_140px_110px_120px] gap-4 border-b border-line bg-panel px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted md:grid"><span>Producto</span><span>Precio</span><span>Estado</span><span>Acciones</span></div><div className="divide-y divide-line">{query.data.items.map((product) => <div key={product.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_140px_110px_120px] md:items-center md:gap-4"><div><p className="font-semibold">{product.title}</p><p className="mt-1 text-xs text-muted">{product.brand} · {product.variants.length} variantes</p></div><span className="text-sm font-semibold">{formatPrice(product.salePriceMinor)}</span><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${product.active ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>{product.active ? 'Activo' : 'Archivado'}</span><div className="flex gap-2"><Link href={`/admin/products/edit/${product.id}`} className="icon-button" aria-label={`Editar ${product.title}`}><Edit3 size={16} /></Link><button type="button" className="icon-button" aria-label={product.active ? `Archivar ${product.title}` : `Activar ${product.title}`} disabled={archive.isPending} onClick={() => archive.mutate({ id: product.id, active: !product.active, version: product.version })}><Archive size={16} /></button></div></div>)}</div></div>{archive.error && <p className="mt-4 text-sm text-danger" role="alert">{getErrorMessage(archive.error)}</p>}</div>;
}
