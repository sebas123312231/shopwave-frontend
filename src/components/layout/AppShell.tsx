'use client';

import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { usePathname } from 'next/navigation';

interface AppShellProps {
  children: React.ReactNode;
}

const publicRoutes = ['/', '/products', '/login', '/register'];

export const AppShell = ({ children }: AppShellProps) => {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.includes(pathname);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {!isPublicRoute && <Sidebar />}
        <main className={`flex-1 ${isPublicRoute ? '' : 'md:ml-64'}`}>
          <div className="px-6 py-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
};