'use client';

import Link from 'next/link';
import { ArrowRight, PackageOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, getErrorMessage } from '@/lib/client/api';
import { formatDate, formatPrice, formatStatus } from '@/lib/format';
import { orderPageSchema, type OrderPage } from '@/contracts/shopwave.schema';
import { useAuth } from '@/context/AuthContext';

export function OrderListClient() {
  const { user } = useAuth();
  const orders = useQuery<OrderPage>({ queryKey: ['orders', user?.id], queryFn: async () => orderPageSchema.parse(await apiFetch('/api/store/orders?page=0&size=12')), enabled: Boolean(user) });
  if (orders.isLoading) return <div className="space-y-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-brand-soft/60" />)}</div>;
  if (orders.error) return <div className="rounded-2xl border border-danger/30 bg-danger-soft p-5 text-sm text-danger" role="alert">{getErrorMessage(orders.error, 'No pudimos cargar tus pedidos')}</div>;
  if (!orders.data?.items.length) return <div className="card px-6 py-16 text-center"><PackageOpen className="mx-auto text-brand" size={30} /><h2 className="mt-4 text-xl font-semibold">Todavía no tienes pedidos</h2><p className="mt-2 text-sm text-muted">Cuando completes una compra aparecerá aquí.</p><Link href="/products" className="button button-primary mt-6">Explorar catálogo</Link></div>;
  return <div className="space-y-3">{orders.data.items.map((order) => <Link key={order.id} href={`/orders/${order.id}`} className="card flex flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-3"><span className="font-semibold">{order.number}</span><span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-strong">{formatStatus(order.status)}</span></div><p className="mt-2 text-sm text-muted">{formatDate(order.createdAt)} · {order.totalQuantity} {order.totalQuantity === 1 ? 'producto' : 'productos'}</p></div><div className="flex items-center justify-between gap-5 sm:justify-end"><span className="font-semibold">{formatPrice(order.totalMinor)}</span><ArrowRight size={18} className="text-muted" /></div></Link>)}</div>;
}
