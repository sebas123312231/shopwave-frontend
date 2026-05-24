'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-lg border border-border">
          <Spinner size="lg" />
          <p className="text-sm text-foreground-muted">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};