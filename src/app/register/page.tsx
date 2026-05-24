'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/services/auth.service';
import { RegisterRequest } from '@/models/auth.model';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { UserPlus, Package, CheckCircle } from 'lucide-react';

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
    <div className="flex min-h-[90vh]">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-light to-primary items-center justify-center p-12">
        <div className="max-w-md text-center space-y-6 animate-slideInLeft">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-2xl bg-accent/20 flex items-center justify-center">
              <Package size={40} className="text-accent-light" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Únete a ShopWave</h2>
          <p className="text-white/70">
            Crea tu cuenta y disfruta de una experiencia de compra moderna y eficiente.
          </p>
          <div className="flex flex-col gap-3 text-sm text-white/50">
            <span className="flex items-center justify-center gap-2">
              <CheckCircle size={16} className="text-accent-light" />
              Acceso a carrito persistente
            </span>
            <span className="flex items-center justify-center gap-2">
              <CheckCircle size={16} className="text-accent-light" />
              Historial de órdenes
            </span>
            <span className="flex items-center justify-center gap-2">
              <CheckCircle size={16} className="text-accent-light" />
              Calificaciones y reseñas
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md animate-slideUp">
          <div className="bg-white rounded-2xl shadow-xl border border-border p-8 md:p-10">
            <div className="mb-8 text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Crear Cuenta</h1>
              <p className="text-foreground-muted text-sm">Regístrate en ShopWave</p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
                <CheckCircle size={20} className="text-success flex-shrink-0" />
                <p className="text-sm text-green-700">¡Registro exitoso! Redirigiendo...</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Juan"
                  required
                />
                <Input
                  label="Apellido"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Pérez"
                  required
                />
              </div>

              <Input
                label="Correo electrónico"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
              />

              <Input
                label="Teléfono"
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="+54 11 1234 5678"
                required
              />

              <Input
                label="Contraseña"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />

              <Button type="submit" size="lg" className="w-full" loading={isLoading}>
                <UserPlus size={18} />
                Crear Cuenta
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-foreground-muted">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="font-semibold text-accent hover:text-accent-dark hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}