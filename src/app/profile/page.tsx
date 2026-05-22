'use client';

import React, { useEffect, useState } from 'react';
import { UserService } from '@/services/user.service';
import { User } from '@/models/user.model';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await UserService.getProfile();
        setProfile(userData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al obtener los datos del perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
        <Spinner size="lg" />
        <p className="text-xs text-[var(--color-foreground-muted)]">Cargando perfil de usuario...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)] border border-[var(--color-error)] text-[var(--color-error)] p-4 rounded-md text-sm shadow-xs">
          <p className="font-semibold">No se pudo cargar el perfil</p>
          <p className="mt-1 text-xs opacity-90">{error || 'Intente de nuevo más tarde.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm overflow-hidden">
        
        <div className="bg-[color-mix(in_srgb,var(--color-foreground)_90%,transparent)] px-6 py-8 text-[var(--color-background)] flex items-center gap-4">
          <div className="w-16 h-16 bg-[var(--color-accent)] text-white rounded-full flex items-center justify-center text-2xl font-black uppercase shadow-inner">
            {profile.firstName.slice(0, 1)}{profile.lastName.slice(0, 1)}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">{profile.firstName} {profile.lastName}</h1>
            <p className="text-sm text-[var(--color-foreground-muted)] mt-0.5">{profile.email}</p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-foreground-muted)] uppercase tracking-wider mb-3">
              Información de la Cuenta
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[var(--color-surface-hover)] p-4 rounded-md border border-[var(--color-border)] text-sm">
              <div>
                <span className="block text-xs text-[var(--color-foreground-muted)] font-medium">Nombre Completo</span>
                <span className="font-semibold text-[var(--color-foreground)]">{profile.firstName} {profile.lastName}</span>
              </div>
              <div>
                <span className="block text-xs text-[var(--color-foreground-muted)] font-medium">Correo Electrónico</span>
                <span className="font-semibold text-[var(--color-foreground)]">{profile.email}</span>
              </div>
              <div>
                <span className="block text-xs text-[var(--color-foreground-muted)] font-medium">Teléfono Móvil</span>
                <span className="font-semibold text-[var(--color-foreground)]">{profile.mobile || 'No registrado'}</span>
              </div>
              <div>
                <span className="block text-xs text-[var(--color-foreground-muted)] font-medium mb-1">Rol de Usuario</span>
                <Badge variant={profile.role === 'ROLE_ADMIN' ? 'danger' : 'default'}>
                  {profile.role === 'ROLE_ADMIN' ? 'Administrador' : 'Cliente'}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[var(--color-foreground-muted)] uppercase tracking-wider mb-3">
              Libreta de Direcciones Guardadas
            </h2>
            {!profile.addresses || profile.addresses.length === 0 ? (
              <p className="text-sm text-[var(--color-foreground-muted)] bg-[var(--color-surface-hover)] p-4 rounded border border-dashed border-[var(--color-border)] text-center">
                Aún no has guardado direcciones en tus compras.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.addresses.map((address) => (
                  <div key={address.id} className="border border-[var(--color-border)] rounded-lg p-4 relative shadow-2xs hover:border-[var(--color-accent)] transition bg-[var(--color-surface)] text-sm">
                    <p className="font-semibold text-[var(--color-foreground)]">{address.firstName} {address.lastName}</p>
                    <p className="text-[var(--color-foreground-muted)] mt-1">{address.streetAddress}</p>
                    <p className="text-[var(--color-foreground-muted)]">{address.city}, {address.state} - {address.zipCode}</p>
                    <p className="text-xs text-[var(--color-foreground-muted)] mt-2 font-medium">📞 {address.mobile}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}