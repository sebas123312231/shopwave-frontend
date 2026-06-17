'use client';

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const { isDark, toggleTheme, mounted } = useTheme();

  const dark = mounted && isDark;

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-8 w-[60px] items-center rounded-full border border-slate-300 bg-white p-0.5 transition-all duration-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
    >
      <Sun
        size={12}
        className={`absolute left-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${
          dark ? 'opacity-30' : 'opacity-0'
        } text-slate-500`}
      />
      <Moon
        size={12}
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${
          dark ? 'opacity-0' : 'opacity-30'
        } text-slate-500`}
      />

      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm ring-1 ring-slate-300 transition-all duration-300 ${
          dark ? 'translate-x-[30px]' : 'translate-x-0'
        }`}
      >
        {dark ? <Moon size={13} className="text-slate-900" /> : <Sun size={13} className="text-slate-900" />}
      </span>
    </button>
  );
};
