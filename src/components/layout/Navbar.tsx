'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Menu, X, ShoppingCart, User, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
  const { isAuthenticated, isAdmin, logout, userEmail } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-accent">
          ShopWave
        </Link>

        <button
          className="md:hidden text-foreground p-1 hover:bg-background-alt rounded-lg transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div
          className={`${open ? 'flex' : 'hidden'} absolute left-0 top-full w-full bg-white md:static md:block md:w-auto md:border-0 border-b border-border shadow-lg md:shadow-none animate-slideUp md:animate-none`}
        >
          <ul className="flex flex-col gap-1 px-4 py-3 md:flex-row md:items-center md:gap-6">
            <li>
              <Link
                href="/products"
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/products')
                    ? 'text-accent bg-accent/5'
                    : 'text-foreground-muted hover:text-accent hover:bg-background-alt'
                }`}
              >
                Productos
              </Link>
            </li>

            {isAuthenticated && (
              <>
                <li>
                  <Link
                    href="/cart"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive('/cart')
                        ? 'text-accent bg-accent/5'
                        : 'text-foreground-muted hover:text-accent hover:bg-background-alt'
                    }`}
                  >
                    <ShoppingCart size={18} />
                    Carrito
                  </Link>
                </li>
                <li>
                  <Link
                    href="/orders"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive('/orders')
                        ? 'text-accent bg-accent/5'
                        : 'text-foreground-muted hover:text-accent hover:bg-background-alt'
                    }`}
                  >
                    Mis Órdenes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive('/profile')
                        ? 'text-accent bg-accent/5'
                        : 'text-foreground-muted hover:text-accent hover:bg-background-alt'
                    }`}
                  >
                    <User size={18} />
                    Perfil
                  </Link>
                </li>
              </>
            )}

            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    pathname.startsWith('/admin')
                      ? 'text-accent bg-accent/5'
                      : 'text-foreground-muted hover:text-accent hover:bg-background-alt'
                  }`}
                >
                  <LayoutDashboard size={18} />
                  Admin
                </Link>
              </li>
            )}

            <li className="border-t border-border mt-2 pt-2 md:border-0 md:mt-0 md:pt-0 md:ml-2">
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-error hover:bg-red-50 transition-colors"
                >
                  Salir
                </button>
              ) : (
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                  <Link
                    href="/login"
                    className="flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium text-foreground-muted hover:text-accent hover:bg-background-alt transition-colors"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center bg-accent text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-accent-dark transition-all hover:shadow-lg hover:shadow-blue-500/25"
                  >
                    Registro
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};