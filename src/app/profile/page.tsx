'use client';

import { User, Mail, Phone, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const mockUser = {
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan.perez@email.com',
  mobile: '+54 11 1234 5678',
  role: 'USER',
};

const ProfileCard = ({ label, value, icon: Icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">
    <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
      {Icon}
    </div>
    <div className="flex-1">
      <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">{label}</p>
      <p className="text-base font-medium text-foreground">{value}</p>
    </div>
  </div>
);

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">Mi Perfil</h1>

      <div className="rounded-2xl bg-white border border-border shadow-lg overflow-hidden animate-slideUp">
        <div className="flex flex-col items-center py-8 px-6 bg-gradient-to-r from-primary to-primary-light">
          <div className="h-20 w-20 rounded-full bg-accent/20 text-accent-light flex items-center justify-center text-2xl font-bold mb-4">
            JP
          </div>
          <h2 className="text-xl font-bold text-white">
            {mockUser.firstName} {mockUser.lastName}
          </h2>
          <div className="flex items-center gap-1.5 mt-2 text-white/70 text-sm">
            <Shield size={14} />
            <span>{mockUser.role === 'ADMIN' ? 'Administrador' : 'Usuario'}</span>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <ProfileCard label="Nombre completo" value={`${mockUser.firstName} ${mockUser.lastName}`} icon={<User size={20} />} />
          <ProfileCard label="Correo electrónico" value={mockUser.email} icon={<Mail size={20} />} />
          <ProfileCard label="Teléfono" value={mockUser.mobile} icon={<Phone size={20} />} />
        </div>

        <div className="px-6 md:px-8 pb-6">
          <Button variant="danger" className="w-full">
            <LogOut size={18} />
            Cerrar sesión
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-surface-blue border border-border p-5">
        <h3 className="font-semibold text-foreground mb-2">Información importante</h3>
        <p className="text-sm text-foreground-muted">
          Para actualizar tus datos personales o cambiar tu contraseña, contacta a nuestro equipo de soporte.
        </p>
      </div>
    </div>
  );
}