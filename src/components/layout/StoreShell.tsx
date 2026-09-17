'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogIn, LogOut, Menu, Moon, ShoppingBag, Sparkles, Sun, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';

export function StoreShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const links = [{ href: '/', label: 'Inicio' }, { href: '/products', label: 'Catálogo' }, ...(user ? [{ href: '/orders', label: 'Pedidos' }] : [])];
  const signOut = async () => { await logout(); setOpen(false); router.push('/'); router.refresh(); };
  return <div className="min-h-screen bg-page text-ink">
    <header className="sticky top-0 z-40 border-b border-line/80 bg-page/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-ink" aria-label="ShopWave inicio" onClick={() => setOpen(false)}>
          <span className="grid size-9 place-items-center rounded-xl bg-brand text-white shadow-sm"><Sparkles size={18} /></span>
          <span className="text-lg font-semibold tracking-tight">ShopWave</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
          {links.map((link) => <Link key={link.href} href={link.href} className={`rounded-lg px-3 py-2 text-sm font-medium ${pathname === link.href ? 'bg-brand-soft text-brand-strong' : 'text-muted hover:bg-panel hover:text-ink'}`}>{link.label}</Link>)}
        </nav>
        <div className="flex items-center gap-1">
          <button type="button" onClick={toggle} className="icon-button" aria-label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <Link href="/cart" className="icon-button relative" aria-label={`Carrito con ${cart?.totalQuantity ?? 0} productos`}><ShoppingBag size={19} />{(cart?.totalQuantity ?? 0) > 0 && <span className="badge-dot">{cart?.totalQuantity}</span>}</Link>
          {user ? <div className="hidden items-center gap-1 sm:flex"><Link href={user.role === 'ADMIN' ? '/admin' : '/profile'} className="icon-button" aria-label="Abrir perfil"><UserRound size={18} /></Link><button type="button" onClick={signOut} className="icon-button" aria-label="Cerrar sesión"><LogOut size={18} /></button></div> : <Link href="/login" className="button button-primary hidden sm:inline-flex"><LogIn size={16} />Ingresar</Link>}
          <button type="button" className="icon-button md:hidden" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {open && <div className="border-t border-line bg-page px-4 py-3 md:hidden"><nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Navegación móvil">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-medium hover:bg-panel">{link.label}</Link>)}{user ? <><Link href={user.role === 'ADMIN' ? '/admin' : '/profile'} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-medium hover:bg-panel">Mi cuenta</Link><button type="button" onClick={signOut} className="flex items-center gap-2 rounded-lg px-3 py-3 text-left font-medium text-danger hover:bg-danger-soft"><LogOut size={17} />Cerrar sesión</button></> : <Link href="/login" onClick={() => setOpen(false)} className="button button-primary mt-2 justify-center">Ingresar</Link>}</nav></div>}
    </header>
    <main>{children}</main>
    <footer className="mt-20 border-t border-line bg-panel/50"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><p><span className="font-semibold text-ink">ShopWave</span> · comercio demo con pago simulado.</p><div className="flex gap-4"><Link href="/products" className="hover:text-brand">Catálogo</Link><Link href="/profile" className="hover:text-brand">Perfil</Link><Link href="/orders" className="hover:text-brand">Pedidos</Link></div></div></footer>
  </div>;
}
