'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { RegisterRequest } from '@/models/auth.model';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LogIn, Package, CheckCircle, UserPlus } from 'lucide-react';

export function AuthScreen({ initialMode }: { initialMode?: 'login' | 'register' }) {
  const pathname = usePathname();
  // Usamos la prop initialMode para saber con qué estado inicial arrancar
  const [isLogin, setIsLogin] = useState(initialMode !== 'register');

  // Sincronizar el estado con los botones "Atrás/Adelante" del navegador
  useEffect(() => {
    const handlePopState = () => setIsLogin(window.location.pathname !== '/register');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Estados Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados Register
  const [registerData, setRegisterData] = useState<RegisterRequest>({
    firstName: '', lastName: '', email: '', password: '', mobile: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Alternar lados
  const toggleMode = () => {
    setError('');
    setSuccess(false);
    const newIsLogin = !isLogin;
    setIsLogin(newIsLogin);
    // Actualizamos la URL sin recargar la página para mantener la transición fluida
    window.history.pushState(null, '', newIsLogin ? '/login' : '/register');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await AuthService.login(email, password);
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      setIsLoading(false);
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await AuthService.register(registerData);
      setSuccess(true);
      setTimeout(() => { 
        toggleMode(); 
        setIsLoading(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background overflow-hidden flex">
      
      {/* Panel de Info (Lado derecho inicialmente, se desliza al izquierdo en registro) */}
      <div 
        className={`hidden lg:flex absolute top-0 right-0 w-1/2 h-full bg-gradient-to-br from-primary via-primary-light to-primary transition-transform duration-[1500ms] ease-in-out z-20 shadow-2xl ${
          isLogin ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Info Login */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-12 transition-all duration-1000 delay-300 ${isLogin ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0 pointer-events-none'}`}>
          <div className="max-w-md text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Package size={40} className="text-accent-light" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white">Bienvenido a ShopWave</h2>
            <p className="text-white/70">
              Accede a tu cuenta y descubre un catálogo curado con la mejor experiencia de compra.
            </p>
            <div className="flex flex-col gap-3 text-sm text-white/50">
              <span className="flex items-center justify-center gap-2">
                <CheckCircle size={16} className="text-accent-light" />
                Catálogo completo de productos
              </span>
              <span className="flex items-center justify-center gap-2">
                <CheckCircle size={16} className="text-accent-light" />
                Experiencia de compra moderna
              </span>
              <span className="flex items-center justify-center gap-2">
                <CheckCircle size={16} className="text-accent-light" />
                Detalle visual de cada producto
              </span>
            </div>
          </div>
        </div>

        {/* Info Register */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-12 transition-all duration-1000 delay-300 ${!isLogin ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0 pointer-events-none'}`}>
          <div className="max-w-md text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Package size={40} className="text-accent-light" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white">Únete a ShopWave</h2>
            <p className="text-white/70">
              Crea tu cuenta y disfruta de una experiencia de compra moderna y eficiente.
            </p>
            <div className="flex flex-col gap-3 text-sm text-white/50">
              <span className="flex items-center justify-center gap-2">
                <CheckCircle size={16} className="text-accent-light" />
                Explora un catálogo curado
              </span>
              <span className="flex items-center justify-center gap-2">
                <CheckCircle size={16} className="text-accent-light" />
                Experiencia visual premium
              </span>
              <span className="flex items-center justify-center gap-2">
                <CheckCircle size={16} className="text-accent-light" />
                Compra moderna y eficiente
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de Formularios (Lado izquierdo inicialmente, se desliza al derecho en registro) */}
      <div 
        className={`absolute top-0 left-0 w-full lg:w-1/2 h-full flex items-center justify-center p-6 md:p-12 transition-transform duration-[1500ms] ease-in-out z-10 ${
          isLogin ? 'translate-x-0' : 'lg:translate-x-full'
        }`}
      >
        <div className="w-full max-w-md relative">
          
          {/* Formulario de Login */}
          <div className={`bg-surface rounded-2xl shadow-xl border border-border p-8 md:p-10 transition-all duration-1000 delay-100 ${isLogin ? 'opacity-100 translate-x-0 relative z-10' : 'opacity-0 translate-x-8 absolute top-0 left-0 w-full z-0 pointer-events-none'}`}>
            <div className="mb-8 text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Iniciar Sesión</h1>
              <p className="text-foreground-muted text-sm">Accede a tu cuenta ShopWave</p>
            </div>

            {error && isLogin && (
              <div className="mb-6 rounded-xl bg-surface-red border border-border-red p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-text-on-red">{error}</p>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <Input label="Correo electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required />
              <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              <Button type="submit" size="lg" className="w-full" loading={isLoading && isLogin}>
                <LogIn size={18} /> Iniciar Sesión
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-foreground-muted">
              ¿No tienes cuenta?{' '}
              <button onClick={toggleMode} type="button" className="font-semibold text-accent hover:text-accent-dark hover:underline">
                Regístrate aquí
              </button>
            </p>
          </div>

          {/* Formulario de Registro */}
          <div className={`bg-surface rounded-2xl shadow-xl border border-border p-8 md:p-10 transition-all duration-1000 delay-100 ${!isLogin ? 'opacity-100 translate-x-0 relative z-10' : 'opacity-0 -translate-x-8 absolute top-0 left-0 w-full z-0 pointer-events-none'}`}>
            <div className="mb-8 text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Crear Cuenta</h1>
              <p className="text-foreground-muted text-sm">Regístrate en ShopWave</p>
            </div>

            {error && !isLogin && (
              <div className="mb-6 rounded-xl bg-surface-red border border-border-red p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-text-on-red">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 rounded-xl bg-surface-green border border-border-green p-4 flex items-center gap-3">
                <CheckCircle size={20} className="text-success flex-shrink-0" />
                <p className="text-sm text-text-on-green">¡Registro exitoso! Iniciando...</p>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nombre" name="firstName" placeholder="Juan" required value={registerData.firstName} onChange={handleRegisterChange} />
                <Input label="Apellido" name="lastName" placeholder="Pérez" required value={registerData.lastName} onChange={handleRegisterChange} />
              </div>
              <Input label="Correo electrónico" type="email" name="email" placeholder="tu@email.com" required value={registerData.email} onChange={handleRegisterChange} />
              <Input label="Teléfono" type="tel" name="mobile" placeholder="+54 11 1234 5678" required value={registerData.mobile} onChange={handleRegisterChange} />
              <Input label="Contraseña" type="password" name="password" placeholder="••••••••" required value={registerData.password} onChange={handleRegisterChange} />
              <Button type="submit" size="lg" className="w-full" loading={isLoading && !isLogin}>
                <UserPlus size={18} /> Crear Cuenta
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-foreground-muted">
              ¿Ya tienes cuenta?{' '}
              <button onClick={toggleMode} type="button" className="font-semibold text-accent hover:text-accent-dark hover:underline">
                Inicia sesión
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
