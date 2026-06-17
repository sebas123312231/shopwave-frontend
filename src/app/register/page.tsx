import { AuthScreen } from '@/components/auth/AuthScreen';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear Cuenta | ShopWave',
  description: 'Únete a ShopWave y disfruta de la mejor experiencia de compra.',
};

export default function RegisterPage() {
  return <AuthScreen initialMode="register" />;
}
