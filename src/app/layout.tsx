import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { StoreShell } from '@/components/layout/StoreShell';

export const metadata: Metadata = {
  title: { default: 'ShopWave · Compra con intención', template: '%s · ShopWave' },
  description: 'Catálogo e-commerce demo con stock por variante y pago simulado.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es" suppressHydrationWarning><body><Providers><StoreShell>{children}</StoreShell></Providers></body></html>;
}
