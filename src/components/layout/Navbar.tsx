'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Menu, X, ShoppingCart, User } from 'lucide-react';

export const Navbar = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-[var(--color-accent)]">
          ShopWave
        </Link>

        <button className="md:hidden text-[var(--color-foreground)]" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>

        <div className={`${open ? 'block' : 'hidden'} absolute left-0 top-14 w-full bg-[var(--color-surface)] md:static md:block md:w-auto border-b border-[var(--color-border)] md:border-0`}>
          <ul className="flex flex-col gap-4 px-4 py-2 md:flex-row md:items-center md:gap-6 text-[var(--color-foreground)]">
            <li><Link href="/products" className="hover:text-[var(--color-accent)]">Productos</Link></li>
            {isAuthenticated && (
              <>
                <li><Link href="/cart" className="hover:text-[var(--color-accent)]"><ShoppingCart size={20} /></Link></li>
                <li><Link href="/orders" className="hover:text-[var(--color-accent)]">Mis Órdenes</Link></li>
                <li><Link href="/profile" className="hover:text-[var(--color-accent)]"><User size={20} /></Link></li>
              </>
            )}
            {isAdmin && (
              <li><Link href="/admin" className="text-[var(--color-error)] hover:text-[var(--color-accent-light)]">Admin</Link></li>
            )}
            {isAuthenticated ? (
              <li><button onClick={logout} className="text-sm font-semibold text-[var(--color-error)] hover:text-[var(--color-accent-light)]">Salir</button></li>
            ) : (
              <>
                <li><Link href="/login" className="hover:text-[var(--color-accent)]">Ingresar</Link></li>
                <li><Link href="/register" className="hover:text-[var(--color-accent)]">Registro</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};