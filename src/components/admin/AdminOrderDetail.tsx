'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminOrderSchema, orderStatusSchema, type AdminOrder, type OrderStatus } from '@/contracts/shopwave.schema';
import { apiFetch, getErrorMessage } from '@/lib/client/api';
import { formatDate, formatPrice, formatStatus } from '@/lib/format';

export function AdminOrderDetail({ id }: { id: string }) {
  const client = useQueryClient(); const [status, setStatus] = useState<OrderStatus | ''>('');
  const query = useQuery<AdminOrder>({ queryKey: ['admin-order', id], queryFn: async () => adminOrderSchema.parse(await apiFetch(`/api/store/admin/orders/${id}`)) });
  const update = useMutation({ mutationFn: (next: OrderStatus) => apiFetch(`/api/store/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: next, version: query.data?.version }) }), onSuccess: () => { void client.invalidateQueries({ queryKey: ['admin-order', id] }); void client.invalidateQueries({ queryKey: ['admin-orders'] }); setStatus(''); } });
  if (query.isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-brand-soft/60" />;
  if (query.error || !query.data) return <div className="rounded-2xl border border-danger/30 bg-danger-soft p-5 text-sm text-danger" role="alert">{getErrorMessage(query.error, 'Pedido no disponible')}</div>;
  const order = query.data;
  return <div><Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-brand"><ArrowLeft size={16} />Pedidos</Link><div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Pedido admin</p><h2 className="mt-2 text-3xl font-semibold">{order.number}</h2><p className="mt-2 text-sm text-muted">{order.customer.firstName} {order.customer.lastName} · {order.customer.email} · {formatDate(order.createdAt)}</p></div><span className="rounded-full bg-brand-soft px-3 py-1.5 text-sm font-bold text-brand-strong">{formatStatus(order.status)}</span></div><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]"><section className="card divide-y divide-line">{order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 p-5"><div><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm text-muted">{item.variantLabel} · {item.quantity} unidades</p></div><span className="font-semibold">{formatPrice(item.lineTotalMinor)}</span></div>)}<div className="flex justify-between p-5 font-bold"><span>Total</span><span>{formatPrice(order.totalMinor)}</span></div></section><aside className="card h-fit p-5"><h3 className="font-semibold">Actualizar estado</h3><p className="mt-2 text-xs text-muted">El backend valida la transición y la versión.</p><select className="field" value={status} onChange={(event) => setStatus(orderStatusSchema.safeParse(event.target.value).success ? event.target.value as OrderStatus : '')}><option value="">Seleccionar</option>{order.allowedTransitions.map((next) => <option key={next} value={next}>{formatStatus(next)}</option>)}</select><button type="button" disabled={!status || update.isPending} onClick={() => status && update.mutate(status)} className="button button-primary mt-3 w-full">{update.isPending ? 'Guardando…' : 'Aplicar estado'}</button>{update.error && <p className="mt-3 text-sm text-danger" role="alert">{getErrorMessage(update.error)}</p>}<div className="mt-6 border-t border-line pt-5 text-sm text-muted"><p>Pago: {order.payment.status}</p><p className="mt-1 break-all">Referencia: {order.payment.reference}</p></div></aside></div></div>;
}
