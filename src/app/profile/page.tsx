'use client';

import { useEffect, useState } from 'react';
import { UserService } from '@/services/user.service';
import { User } from '@/models/user.model';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { AuthGuard } from '@/guards/AuthGuard';
import { User as UserIcon, Mail, Phone, Shield, MapPin, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initStarted, setInitStarted] = useState(false);

  useEffect(() => {
    setInitStarted(true);
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

  useEffect(() => {
    if (initStarted && loading) {
      const timer = setTimeout(() => {
        if (loading) {
          setError('El servidor está tardando demasiado. Por favor reintenta.');
          setLoading(false);
        }
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [initStarted, loading]);

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 min-h-screen">
        {loading || !initStarted ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
            <Spinner size="lg" />
            <p className="text-xs text-foreground-muted">Cargando perfil de usuario...</p>
          </div>
        ) : error || !profile ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">No se pudo cargar el perfil</p>
              <p className="mt-1 text-sm">{error || 'Intenta de nuevo más tarde.'}</p>
            </div>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl shadow-lg overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="bg-primary px-6 py-8 text-white flex items-center gap-4">
              <div className="w-16 h-16 bg-accent/20 text-accent-light rounded-full flex items-center justify-center text-2xl font-black uppercase border-2 border-accent/30">
                {profile.firstName.slice(0, 1)}{profile.lastName.slice(0, 1)}
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-sm text-white/70 mt-0.5 flex items-center gap-1.5">
                  <Mail size={14} />
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              {/* Información de la Cuenta */}
              <div>
                <h2 className="text-sm font-semibold text-foreground-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                  <UserIcon size={16} />
                  Información de la Cuenta
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-background-alt p-5 rounded-xl border border-border text-sm">
                  <div>
                    <span className="block text-xs text-foreground-muted font-medium mb-1">Nombre Completo</span>
                    <span className="font-semibold text-foreground">{profile.firstName} {profile.lastName}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-foreground-muted font-medium mb-1">Correo Electrónico</span>
                    <span className="font-semibold text-foreground">{profile.email}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-foreground-muted font-medium mb-1">Teléfono Móvil</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Phone size={14} className="text-foreground-muted" />
                      {profile.mobile || 'No registrado'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-foreground-muted font-medium mb-1">Rol de Usuario</span>
                    <Badge variant={profile.role === 'ROLE_ADMIN' ? 'danger' : 'default'}>
                      <span className="flex items-center gap-1">
                        <Shield size={12} />
                        {profile.role === 'ROLE_ADMIN' ? 'Administrador' : 'Cliente'}
                      </span>
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Direcciones */}
              <div>
                <h2 className="text-sm font-semibold text-foreground-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin size={16} />
                  Libreta de Direcciones
                </h2>
                {!profile.addresses || profile.addresses.length === 0 ? (
                  <div className="bg-background-alt border border-dashed border-border rounded-xl p-8 text-center">
                    <p className="text-sm text-foreground-muted">
                      Aún no has guardado direcciones en tus compras.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.addresses.map((address) => (
                      <div
                        key={address.id}
                        className="border border-border rounded-xl p-5 relative shadow-sm hover:border-accent/30 transition bg-surface text-sm"
                      >
                        <p className="font-semibold text-foreground">
                          {address.firstName} {address.lastName}
                        </p>
                        <p className="text-foreground-muted mt-1">{address.streetAddress}</p>
                        <p className="text-foreground-muted">
                          {address.city}, {address.state} - {address.zipCode}
                        </p>
                        <p className="text-xs text-foreground-muted mt-2 font-medium flex items-center gap-1">
                          <Phone size={12} />
                          {address.mobile}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}