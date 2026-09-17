import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server/session';
import { OrderDetailClient } from '@/components/orders/OrderDetailClient';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Detalle de pedido', robots: { index: false, follow: false } };
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) { const session = await getServerSession(); if (!session) redirect('/login?returnTo=/orders'); const { id } = await params; return <OrderDetailClient id={id} />; }
