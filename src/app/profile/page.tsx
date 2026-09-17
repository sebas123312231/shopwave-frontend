import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server/session';
import { ProfileForm } from '@/components/account/ProfileForm';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Mi perfil', robots: { index: false, follow: false } };
export default async function ProfilePage() { const session = await getServerSession(); if (!session) redirect('/login?returnTo=/profile'); return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"><p className="eyebrow">Cuenta</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Mi perfil</h1><p className="mt-3 text-muted">Administra tus datos y revisa tus direcciones guardadas.</p><div className="mt-8"><ProfileForm /></div></div>; }
