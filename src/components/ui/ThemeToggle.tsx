'use client';

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const { isDark, toggleTheme, mounted } = useTheme();

  const dark = mounted && isDark;

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-8 w-[60px] items-center rounded-full border border-white/20 bg-white/10 p-0.5 transition-all duration-300 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
    >
      <Sun
        size={12}
        className={`absolute left-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${
          dark ? 'opacity-30' : 'opacity-0'
        } text-amber-300`}
      />
      <Moon
        size={12}
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${
          dark ? 'opacity-0' : 'opacity-30'
        } text-blue-200`}
      />

      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-all duration-300 ${
          dark
            ? 'translate-x-[30px] bg-slate-700 shadow-blue-500/20'
            : 'translate-x-0 bg-amber-400 shadow-amber-500/30'
        }`}
      >
        {dark ? (
          <Moon size={13} className="text-blue-200" />
        ) : (
          <Sun size={13} className="text-white" />
        )}
      </span>
    </button>
  );
};
