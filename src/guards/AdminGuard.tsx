'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';
import { ShieldAlert } from 'lucide-react';

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-lg border border-border">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
            <ShieldAlert size={32} className="text-error" />
          </div>
          <Spinner size="md" />
          <p className="text-sm text-foreground-muted">Verificando acceso de administrador...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};