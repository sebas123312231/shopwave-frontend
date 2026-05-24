'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/services/auth.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LogIn, Package } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await AuthService.login(email, password);
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh]">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-light to-primary items-center justify-center p-12">
        <div className="max-w-md text-center space-y-6 animate-slideInLeft">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-2xl bg-accent/20 flex items-center justify-center">
              <Package size={40} className="text-accent-light" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Bienvenido a ShopWave</h2>
          <p className="text-white/70">
            Accede a tu cuenta para gestionar tus pedidos, carrito de compras y más.
          </p>
          <div className="flex justify-center gap-4 text-sm text-white/50">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Gestión de pedidos
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Carrito persistente
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md animate-slideUp">
          <div className="bg-white rounded-2xl shadow-xl border border-border p-8 md:p-10">
            <div className="mb-8 text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Iniciar Sesión</h1>
              <p className="text-foreground-muted text-sm">Accede a tu cuenta ShopWave</p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />

              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <Button type="submit" size="lg" className="w-full" loading={isLoading}>
                <LogIn size={18} />
                Iniciar Sesión
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-foreground-muted">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="font-semibold text-accent hover:text-accent-dark hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}