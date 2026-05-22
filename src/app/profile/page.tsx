'use client';

import React, { useEffect, useState } from 'react';
import { UserService } from '@/services/user.service';
import { User } from '@/models/user.model';
import { Spinner } from '@/components/ui/Spinner';

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
        <p className="text-xs text-gray-500">Cargando perfil de usuario...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-sm shadow-xs">
          <p className="font-semibold">No se pudo cargar el perfil</p>
          <p className="mt-1 text-xs opacity-90">{error || 'Intente de nuevo más tarde.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        
        <div className="bg-slate-900 px-6 py-8 text-white flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-black uppercase shadow-inner">
            {profile.firstName.slice(0, 1)}{profile.lastName.slice(0, 1)}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{profile.firstName} {profile.lastName}</h1>
            <p className="text-sm text-slate-400 mt-0.5">{profile.email}</p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Información de la Cuenta
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md border border-gray-100 text-sm">
              <div>
                <span className="block text-xs text-gray-500 font-medium">Nombre Completo</span>
                <span className="font-semibold text-gray-800">{profile.firstName} {profile.lastName}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium">Correo Electrónico</span>
                <span className="font-semibold text-gray-800">{profile.email}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium">Teléfono Móvil</span>
                <span className="font-semibold text-gray-800">{profile.mobile || 'No registrado'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium">Rol de Usuario</span>
                <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  profile.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {profile.role === 'ROLE_ADMIN' ? 'Administrador' : 'Cliente'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Libreta de Direcciones Guardadas
            </h2>
            {!profile.addresses || profile.addresses.length === 0 ? (
              <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded border border-dashed text-center">
                Aún no has guardado direcciones en tus compras.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.addresses.map((address) => (
                  <div key={address.id} className="border border-gray-200 rounded-lg p-4 relative shadow-2xs hover:border-gray-300 transition bg-white text-sm">
                    <p className="font-semibold text-gray-800">{address.firstName} {address.lastName}</p>
                    <p className="text-gray-600 mt-1">{address.streetAddress}</p>
                    <p className="text-gray-600">{address.city}, {address.state} - {address.zipCode}</p>
                    <p className="text-xs text-gray-400 mt-2 font-medium">📞 {address.mobile}</p>
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