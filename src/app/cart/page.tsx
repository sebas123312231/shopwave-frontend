import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server/session';
import { CartView } from '@/components/cart/CartView';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Carrito', robots: { index: false, follow: false } };
export default async function CartPage() { const session = await getServerSession(); if (!session) redirect('/login?returnTo=/cart'); return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"><p className="eyebrow">Tu selección</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Carrito</h1><p className="mt-3 text-muted">Revisa tus productos antes de confirmar.</p><div className="mt-8"><CartView /></div></div>; }
