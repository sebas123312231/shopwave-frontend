'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, getErrorMessage } from '@/lib/client/api';
import { adminOrderPageSchema, type AdminOrderPage } from '@/contracts/shopwave.schema';
import { formatDate, formatPrice, formatStatus } from '@/lib/format';

export function AdminOrders() {
  const query = useQuery<AdminOrderPage>({ queryKey: ['admin-orders'], queryFn: async () => adminOrderPageSchema.parse(await apiFetch('/api/store/admin/orders?page=0&size=48')) });
  if (query.isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-brand-soft/60" />;
  if (query.error || !query.data) return <div className="rounded-2xl border border-danger/30 bg-danger-soft p-5 text-sm text-danger" role="alert">{getErrorMessage(query.error, 'No se pudieron cargar los pedidos')}</div>;
  if (!query.data.items.length) return <div className="card px-6 py-16 text-center text-muted">No hay pedidos todavía.</div>;
  return <div className="card divide-y divide-line overflow-hidden">{query.data.items.map((order) => <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-brand-soft/40 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-3"><span className="font-semibold">{order.number}</span><span className="rounded-full bg-brand-soft px-2 py-1 text-xs font-bold text-brand-strong">{formatStatus(order.status)}</span></div><p className="mt-1 text-sm text-muted">{order.customer.firstName} {order.customer.lastName} · {formatDate(order.createdAt)}</p></div><div className="flex items-center justify-between gap-5 sm:justify-end"><span className="font-semibold">{formatPrice(order.totalMinor)}</span><ArrowRight size={18} className="text-muted" /></div></Link>)}</div>;
}
