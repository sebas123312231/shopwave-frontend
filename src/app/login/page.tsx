'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/services/auth.service';

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
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-[var(--color-surface)] p-8 shadow-md border border-[var(--color-border)]">
        <h1 className="mb-6 text-2xl font-bold text-center text-[var(--color-foreground)]">Iniciar Sesión</h1>
        {error && <p className="mb-4 text-sm text-[var(--color-error)]">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2 text-[var(--color-foreground)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2 text-[var(--color-foreground)]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-[var(--color-accent)] py-2 font-semibold text-white hover:bg-[var(--color-accent-light)] disabled:opacity-50"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--color-foreground-muted)]">
          ¿No tienes cuenta? <Link href="/register" className="text-[var(--color-accent)] hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}