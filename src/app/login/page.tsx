import { AuthScreen } from '@/components/auth/AuthScreen';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | ShopWave',
  description: 'Accede a tu cuenta de ShopWave para gestionar tus compras.',
};

export default function LoginPage() {
  return <AuthScreen initialMode="login" />;
}
