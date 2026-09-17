'use client';

import Link from 'next/link';
import { Package, ShoppingCart, Sparkles, WalletCards } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, getErrorMessage } from '@/lib/client/api';
import { adminSummarySchema, type AdminSummary } from '@/contracts/shopwave.schema';
import { formatPrice } from '@/lib/format';

export function AdminDashboard() {
  const query = useQuery<AdminSummary>({ queryKey: ['admin-summary'], queryFn: async () => adminSummarySchema.parse(await apiFetch('/api/store/admin/summary')) });
  if (query.isLoading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-brand-soft/60" />)}</div>;
  if (query.error || !query.data) return <div className="rounded-2xl border border-danger/30 bg-danger-soft p-5 text-sm text-danger" role="alert">{getErrorMessage(query.error, 'No se pudo cargar el resumen')}</div>;
  const cards = [{ label: 'Productos activos', value: query.data.activeProducts, icon: Package }, { label: 'Pedidos recibidos', value: query.data.ordersPlaced, icon: ShoppingCart }, { label: 'Pedidos confirmados', value: query.data.ordersConfirmed, icon: Sparkles }, { label: 'Ventas simuladas', value: formatPrice(query.data.simulatedSalesMinor), icon: WalletCards }];
  return <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(({ label, value, icon: Icon }) => <div key={label} className="card p-5"><div className="flex items-center justify-between"><p className="text-sm text-muted">{label}</p><Icon size={18} className="text-brand" /></div><p className="mt-4 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted">Periodo actual · operación simulada</p></div>)}</div><div className="mt-6 grid gap-4 md:grid-cols-2"><Link href="/admin/products" className="card flex items-center justify-between p-5 transition hover:-translate-y-0.5 hover:shadow-lg"><span><span className="eyebrow">Catálogo</span><span className="mt-2 block font-semibold">Gestionar productos e inventario</span></span><Package className="text-brand" /></Link><Link href="/admin/orders" className="card flex items-center justify-between p-5 transition hover:-translate-y-0.5 hover:shadow-lg"><span><span className="eyebrow">Operaciones</span><span className="mt-2 block font-semibold">Revisar pedidos y estados</span></span><ShoppingCart className="text-brand" /></Link></div></>;
}
