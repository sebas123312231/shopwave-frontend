'use client';

import { useEffect, useState } from 'react';
import { UserService } from '@/services/user.service';
import { User } from '@/models/user.model';
import { AuthGuard } from '@/guards/AuthGuard';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    UserService.getProfile()
      .then(setProfile)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error al cargar perfil'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 min-h-screen">

        {loading && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
            <p className="font-semibold">No se pudo cargar el perfil</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {profile && !loading && (
          <div className="space-y-8">
            {/* Sección 1: Cabecera con nombre y email */}
            <div className="bg-primary px-6 py-8 text-white rounded-2xl flex items-center gap-4">
              <div className="w-16 h-16 bg-accent/20 text-accent-light rounded-full flex items-center justify-center text-2xl font-black uppercase">
                {profile.firstName[0]}{profile.lastName[0]}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-sm text-white/70 mt-0.5">{profile.email}</p>
              </div>
            </div>

            {/* Sección 2: Tarjeta de datos personales */}
            <div className="bg-white border border-border rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-foreground-muted uppercase tracking-wider mb-4">
                Información de la Cuenta
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs text-foreground-muted mb-1">Nombre Completo</span>
                  <span className="font-semibold text-foreground">
                    {profile.firstName} {profile.lastName}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-foreground-muted mb-1">Correo Electrónico</span>
                  <span className="font-semibold text-foreground">{profile.email}</span>
                </div>
                <div>
                  <span className="block text-xs text-foreground-muted mb-1">Teléfono</span>
                  <span className="font-semibold text-foreground">{profile.mobile || 'No registrado'}</span>
                </div>
                <div>
                  <span className="block text-xs text-foreground-muted mb-1">Rol</span>
                  <Badge variant={profile.role === 'ROLE_ADMIN' ? 'danger' : 'default'}>
                    {profile.role === 'ROLE_ADMIN' ? 'Administrador' : 'Cliente'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Sección 3: Libreta de direcciones */}
            <div className="bg-white border border-border rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-foreground-muted uppercase tracking-wider mb-4">
                Libreta de Direcciones
              </h2>

              {!profile.addresses || profile.addresses.length === 0 ? (
                <p className="text-sm text-foreground-muted">
                  No tienes direcciones guardadas todavía.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.addresses.map((address) => (
                    <div key={address.id} className="border border-border rounded-xl p-4 text-sm space-y-1">
                      <p className="font-semibold text-foreground">
                        {address.firstName} {address.lastName}
                      </p>
                      <p className="text-foreground-muted">{address.streetAddress}</p>
                      <p className="text-foreground-muted">
                        {address.city}, {address.state} — {address.zipCode}
                      </p>
                      <p className="text-foreground-muted">{address.mobile}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </AuthGuard>
  );
}
