import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatWidget from './ChatWidget';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });
  const [darkMode, setDarkMode] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', darkMode);
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="md:pl-[250px]">
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className={`fixed right-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition duration-300 ${darkMode ? 'bg-slate-900 border-[#4DB8B0] text-[#4DB8B0]' : 'bg-white border-[#2D5F5E] text-[#2D5F5E]'}`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <main className="min-h-screen px-4 pb-10 pt-10 md:px-8 lg:px-10">
          <div className="space-y-6">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-[var(--border)] bg-white/80 px-4 py-4 text-sm text-[var(--text-secondary)] backdrop-blur dark:bg-slate-950/80 dark:border-[var(--border)] dark:text-[var(--text-secondary)] md:px-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>IoT Temp Watch Dashboard • Built for premium sensor monitoring.</p>
            <p className="text-[var(--text-secondary)]">© 2026 • Responsive dark/light mode</p>
          </div>
        </footer>
      </div>
      <ChatWidget />
    </div>
  );
};

export default DashboardLayout;
