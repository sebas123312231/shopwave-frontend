'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/services/auth.service';
import { RegisterRequest } from '@/models/auth.model';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    mobile: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await AuthService.register(formData);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-[var(--color-surface)] p-8 shadow-md border border-[var(--color-border)]">
        <h1 className="mb-6 text-2xl font-bold text-center text-[var(--color-foreground)]">Crear Cuenta</h1>
        {error && <p className="mb-4 text-sm text-[var(--color-error)]">{error}</p>}
        {success && <p className="mb-4 text-sm text-[var(--color-success)]">¡Registro exitoso! Redirigiendo...</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)]">Nombre</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2 text-[var(--color-foreground)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)]">Apellido</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2 text-[var(--color-foreground)]"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2 text-[var(--color-foreground)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">Teléfono</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2 text-[var(--color-foreground)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2 text-[var(--color-foreground)]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-[var(--color-accent)] py-2 font-semibold text-white hover:bg-[var(--color-accent-light)] disabled:opacity-50"
          >
            {isLoading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--color-foreground-muted)]">
          ¿Ya tienes cuenta? <Link href="/login" className="text-[var(--color-accent)] hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}