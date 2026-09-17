import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server/session';

export const dynamic = 'force-dynamic';
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect('/login?returnTo=/admin');
  if (session.user.role !== 'ADMIN') return <div className="mx-auto max-w-xl px-4 py-24 text-center"><p className="eyebrow">403</p><h1 className="mt-3 text-3xl font-semibold">Acceso restringido</h1><p className="mt-3 text-muted">Tu cuenta no tiene permisos para administrar ShopWave.</p><Link href="/" className="button button-primary mt-7">Volver al inicio</Link></div>;
  return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Workspace admin</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Operaciones ShopWave</h1></div><nav className="flex gap-1 rounded-xl bg-panel p-1" aria-label="Navegación admin"><Link href="/admin" className="rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-brand-soft hover:text-brand">Resumen</Link><Link href="/admin/products" className="rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-brand-soft hover:text-brand">Productos</Link><Link href="/admin/orders" className="rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-brand-soft hover:text-brand">Pedidos</Link></nav></div>{children}</div>;
}
