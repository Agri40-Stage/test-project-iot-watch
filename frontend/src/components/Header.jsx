import React from 'react';
import { Moon, SunMoon } from 'lucide-react';

const Header = ({ darkMode, onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl transition duration-300 dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex h-16 items-center justify-end px-4 md:px-8">
        <button
          onClick={onToggleTheme}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <SunMoon className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
};

export default Header;
