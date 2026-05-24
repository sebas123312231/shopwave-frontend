'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  Package,
  ShoppingCart,
  ClipboardList,
  User,
  Shield,
  LogOut,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Inicio', href: '/', icon: <Home size={20} /> },
  { label: 'Productos', href: '/products', icon: <Package size={20} /> },
  { label: 'Carrito', href: '/cart', icon: <ShoppingCart size={20} />, requiresAuth: true },
  { label: 'Mis Órdenes', href: '/orders', icon: <ClipboardList size={20} />, requiresAuth: true },
  { label: 'Perfil', href: '/profile', icon: <User size={20} />, requiresAuth: true },
  { label: 'Administración', href: '/admin', icon: <Shield size={20} />, requiresAdmin: true },
];

export const Sidebar = () => {
  const { isAuthenticated, isAdmin, logout, userEmail } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const filteredItems = navItems.filter((item) => {
    if (item.requiresAuth && !isAuthenticated) return false;
    if (item.requiresAdmin && !isAdmin) return false;
    return true;
  });

  const getInitials = (email: string | null) => {
    if (!email) return 'U';
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg hover:bg-accent-dark hover:shadow-xl hover:shadow-blue-500/25 transition-all md:hidden"
      >
        <Menu size={24} />
      </button>

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
          <Link href="/" className="text-xl font-bold text-white">
            ShopWave
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/60 hover:text-white md:hidden"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {filteredItems.map((item, index) => (
              <li key={item.href} style={{ animationDelay: `${index * 30}ms` }} className="animate-slideInLeft">
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-accent/15 text-accent-light border-l-4 border-accent'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-4">
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent-light text-sm font-bold">
                  {getInitials(userEmail)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">{userEmail || 'Usuario'}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <LogOut size={18} />
                <span>Salir</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center bg-accent text-white rounded-xl px-4 py-3 text-sm font-semibold hover:bg-accent-dark transition-all"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

function Menu({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}