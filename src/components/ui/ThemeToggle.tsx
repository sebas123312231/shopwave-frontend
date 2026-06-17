'use client';

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const { isDark, toggleTheme, mounted } = useTheme();

  // Hasta montar usamos el estado claro para evitar parpadeos de hidratación.
  const dark = mounted && isDark;

  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={dark}
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
      className={`relative inline-flex h-8 w-[60px] shrink-0 items-center overflow-hidden rounded-full p-1 shadow-inner transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
        dark
          ? 'bg-gradient-to-r from-slate-800 to-purple-950'
          : 'bg-gradient-to-r from-purple-300 to-purple-400'
      }`}
    >
      {/* Estrellas decorativas (modo oscuro) */}
      <span
        className={`pointer-events-none absolute left-2 top-2 h-[3px] w-[3px] rounded-full bg-white transition-opacity duration-300 ${
          dark ? 'opacity-80' : 'opacity-0'
        }`}
      />
      <span
        className={`pointer-events-none absolute left-4 top-3.5 h-[2px] w-[2px] rounded-full bg-white transition-opacity duration-300 ${
          dark ? 'opacity-60' : 'opacity-0'
        }`}
      />
      <span
        className={`pointer-events-none absolute left-2.5 bottom-2 h-[2px] w-[2px] rounded-full bg-white transition-opacity duration-300 ${
          dark ? 'opacity-50' : 'opacity-0'
        }`}
      />

      {/* Nube decorativa (modo claro) */}
      <span
        className={`pointer-events-none absolute right-2 top-1/2 h-1.5 w-3.5 -translate-y-1/2 rounded-full bg-white/85 transition-opacity duration-300 ${
          dark ? 'opacity-0' : 'opacity-90'
        }`}
      />

      {/* Pastilla (thumb) deslizante con el ícono activo */}
      <span
        className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-all duration-300 ease-in-out ${
          dark ? 'translate-x-[28px] bg-slate-100' : 'translate-x-0 bg-white'
        }`}
      >
        <Sun
          size={14}
          className={`absolute text-amber-500 transition-all duration-300 ${
            dark ? 'scale-50 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
          }`}
        />
        <Moon
          size={13}
          className={`absolute text-slate-700 transition-all duration-300 ${
            dark ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-0'
          }`}
        />
      </span>
    </button>
  );
};
