"use client";

import React from 'react';
import { useTheme, availableThemes } from '@/providers/ThemeProvider';
import { Palette } from 'lucide-react';

export function ThemeController() {
  const { theme, setTheme } = useTheme();

  return (
    <div title="Cambiar tema" className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm normal-case">
        <Palette size={16} />
        <span className="hidden md:inline">Tema</span>
        <svg
          width="12px"
          height="12px"
          className="ml-1 hidden h-3 w-3 fill-current opacity-60 sm:inline-block"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048">
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
        </svg>
      </div>
      <div
        tabIndex={0}
        className="dropdown-content bg-base-200 text-base-content rounded-box top-px z-50 mt-16 h-[calc(100vh-10rem)] max-h-96 w-56 overflow-y-auto border border-base-300 shadow-2xl">
        <div className="grid grid-cols-1 gap-3 p-3">
          {availableThemes.map((thm) => (
            <button
              key={thm}
              className={`btn btn-sm btn-block justify-start ${theme === thm ? 'btn-active btn-primary' : 'btn-ghost'}`}
              onClick={() => setTheme(thm)}
              aria-label={`Establecer tema ${thm}`}
              role="button">
              {thm.charAt(0).toUpperCase() + thm.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
