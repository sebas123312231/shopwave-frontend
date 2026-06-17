'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  Package,
  ClipboardList,
  ShoppingCart,
  Shield,
  LogIn,
  LogOut,
  UserPlus,
  Menu,
  X,
  Store,
} from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  category?: string;
  badge?: React.ReactNode;
}

export const Sidebar = () => {
  const { isAuthenticated, isAdmin, logout, userEmail } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const getInitials = (email: string | null) => {
    if (!email) return 'U';
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    window.location.href = '/login';
  };

  const allItems: NavItem[] = [
    { label: 'Inicio', href: '/', icon: <Home size={20} />, category: 'Tienda' },
    { label: 'Productos', href: '/products', icon: <Package size={20} />, category: 'Tienda' },
    { label: 'Carrito', href: '/cart', icon: <ShoppingCart size={20} />, requiresAuth: true, category: 'Mi Cuenta' },
    { label: 'Mis Órdenes', href: '/orders', icon: <ClipboardList size={20} />, requiresAuth: true, category: 'Mi Cuenta' },
    { label: 'Administración', href: '/admin', icon: <Shield size={20} />, requiresAdmin: true, category: 'Panel de Control' },
  ];

  const filteredItems = allItems.filter((item) => {
    if (item.requiresAuth && !isAuthenticated) return false;
    if (item.requiresAdmin && !isAdmin) return false;
    return true;
  });

  const categories = Array.from(new Set(filteredItems.map(item => item.category)));

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between bg-surface/80 px-4 backdrop-blur-md border-b border-border md:hidden">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-accent">
          <Store size={22} />
          ShopWave
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-background-alt transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-gradient-to-b from-primary to-primary-light shadow-2xl transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-white"
            onClick={() => setIsOpen(false)}
          >
            <Store size={24} />
            ShopWave
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors md:hidden"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {categories.map(category => (
            <div key={category || 'general'}>
              {category && (
                <p className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-white/40">
                  {category}
                </p>
              )}
              <ul className="space-y-1">
                {filteredItems.filter(item => item.category === category).map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-accent/15 text-accent-light border-l-4 border-accent'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.badge && <div>{item.badge}</div>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          {isAuthenticated ? (
            <div className="space-y-3">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-white/5 p-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent-light text-sm font-bold">
                  {getInitials(userEmail)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {userEmail || 'Usuario'}
                  </p>
                  <p className="text-xs text-white/60 mt-0.5">Ver perfil</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <LogOut size={18} />
                <span>Salir</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent-dark transition-all"
              >
                <LogIn size={18} />
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              >
                <UserPlus size={18} />
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
