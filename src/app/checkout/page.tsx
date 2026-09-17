import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server/session';
import { CheckoutFlow } from '@/components/checkout/CheckoutFlow';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Checkout', robots: { index: false, follow: false } };
export default async function CheckoutPage() { const session = await getServerSession(); if (!session) redirect('/login?returnTo=/checkout'); return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"><CheckoutFlow /></div>; }
