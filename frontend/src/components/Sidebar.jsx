import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Thermometer, Droplet, CloudRain, X } from 'lucide-react';

const navItems = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Temperature', to: '/temperature', icon: Thermometer },
  { label: 'Humidity', to: '/humidity', icon: Droplet },
  { label: 'Forecast', to: '/forecast', icon: CloudRain },
];

const Sidebar = ({ open, onClose }) => {
  return (
    <>
      <aside className={`fixed inset-y-0 left-0 top-0 z-40 h-screen w-[250px] transform bg-[var(--card-bg)] border-r border-[var(--border)] shadow-lg transition duration-300 ease-in-out md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} md:shadow-none`}>
        <div className="flex h-full flex-col justify-between text-[var(--text-primary)]">
          <div>
            <div className="flex items-center gap-3 px-6 py-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[var(--bg-primary)] text-[var(--accent)] shadow-lg shadow-[rgba(45,95,94,0.1)] dark:bg-[var(--bg-secondary)] dark:text-[var(--accent)] dark:shadow-[rgba(77,184,176,0.15)]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-current">
                  <defs>
                    <linearGradient id="sidebarLogoGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#4DB8B0" />
                      <stop offset="100%" stopColor="#2D5F5E" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2.5c-2.75 0-5 2.25-5 5 0 2.75 2.25 5.5 5 7 2.75-1.5 5-4.25 5-7 0-2.75-2.25-5-5-5Z" fill="url(#sidebarLogoGradient)" />
                  <path d="M12 5.5v4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <rect x="11" y="11" width="2" height="6" rx="1" fill="currentColor" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">IoT Monitoring</p>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Temp Watch</h2>
              </div>
            </div>

            <div className="px-4 md:hidden">
              <button
                className="inline-flex items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-slate-300 hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-primary)] dark:hover:bg-[var(--card-bg)]"
                onClick={onClose}
                aria-label="Close sidebar"
              >
                <X size={18} className="mr-2" />
                Close
              </button>
            </div>

            <nav className="mt-8 space-y-1 px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition duration-200 ${
                        isActive
                          ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm ring-1 ring-[rgba(45,95,94,0.15)] dark:bg-[var(--bg-primary)] dark:text-[var(--text-primary)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] dark:text-[var(--text-secondary)] dark:hover:bg-[var(--bg-primary)] dark:hover:text-[var(--text-primary)]'
                      }`
                    }
                    onClick={onClose}
                  >
                    <Icon className="h-5 w-5 text-[var(--accent)]" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="px-6 py-6 text-sm text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-primary)] p-4 dark:bg-[var(--card-bg)]">
              <p className="font-semibold text-[var(--text-primary)]">Device Sync</p>
              <p className="mt-1 text-xs leading-5">All sensors are connected and streaming live updates.</p>
            </div>
          </div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm md:hidden" onClick={onClose} />}
    </>
  );
};

export default Sidebar;
