import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server/session';
import { OrderListClient } from '@/components/orders/OrderListClient';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Mis pedidos', robots: { index: false, follow: false } };
export default async function OrdersPage() { const session = await getServerSession(); if (!session) redirect('/login?returnTo=/orders'); return <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"><p className="eyebrow">Historial</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Mis pedidos</h1><p className="mt-3 text-muted">Consulta cada compra y su estado actual.</p><div className="mt-8"><OrderListClient /></div></div>; }
