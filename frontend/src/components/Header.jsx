import React, { useEffect, useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  const toggleServices = () => {
    setServicesOpen(!servicesOpen);
  };

  // Style commun pour tous les boutons
  // const buttonStyle = "px-4 py-2 rounded-lg transition-colors flex items-center gap-2";
  const buttonStyle = "w-full text-left px-4 py-2 rounded-lg s flex items-center gap-2"

  return (
    <header className="w-full sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            className="h-10 md:h-14 rounded-full"
            src="https://th.bing.com/th/id/OIP.2PDIejApjWb5yA0ZqaFiJgHaHa?rs=1&pid=ImgDetMain"
            alt="Logo"
          />
          <span className="text-gray-400 text-xl font-semibold text-gray-800">Agri Watch</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-2 items-center">
          <Link
            to="/"
          >
            <button>Home</button>
          </Link>

          {/* Services Dropdown */}
          <div className="relative">
            <button
              onClick={toggleServices}
              className={`${buttonStyle}`}
            >
              Services
              <svg
                className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {servicesOpen && (
              <div className="absolute left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                <Link
                  to="/humidity"
                  className="block px-4 py-2 text-gray-400 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setServicesOpen(false)}
                >
                  Humidity
                </Link>
                <Link
                  to="/temperature"
                  className="block px-4 py-2 text-gray-400 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setServicesOpen(false)}
                >
                  Temperature
                </Link>
                <Link
                  to="/tempPredictions"
                  className="block px-4 py-2 text-gray-400 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setServicesOpen(false)}
                >
                  Predictions
                </Link>
              </div>
            )}
          </div>
          <Link
            to="/consulting"
          >
            <button>Consulting</button>
          </Link>

          <Link
            to="/aboutUs"
          >
            <button className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2">About Us</button>
          </Link>
          <Link
            to="/contactUs"
          >
            <button className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2">Contact Us</button>
          </Link>

          {/* Theme Toggle [Dark or light ]*/}
          <button
            onClick={() => setDark((prev) => !prev)}
            className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            aria-label="Toggle dark mode"
          >
            {dark ? (
              <>
                <FiSun size={18} />
                <span>Light</span>
              </>
            ) : (
              <>
                <FiMoon size={18} />
                <span>Dark</span>
              </>
            )}
          </button>
        </nav>

        {/* Button Pour Mobile version*/}
        <button
          className="md:hidden p-2 rounded-lg "
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-6 shadow-md transition-all">
          <nav className="flex flex-col gap-2 mt-4">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
            >
              <button className={`${buttonStyle}`}>Home</button>

            </Link>

            {/* Mobile Services Dropdown */}
            <div className="flex flex-col">
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className={`${buttonStyle}`}
              >
                Services
                <svg
                  className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {servicesOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-1">
                  <Link
                    to="/humidity"
                    onClick={() => {
                      setMenuOpen(false);
                      setServicesOpen(false);
                    }}
                    className="block px-4 py-2 text-gray-400 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Humidity
                  </Link>
                  <Link
                    to="/temperature"
                    onClick={() => {
                      setMenuOpen(false);
                      setServicesOpen(false);
                    }}
                    className="block px-4 py-2 text-gray-400 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Temperature
                  </Link>
                  <Link
                    to="/tempPredictions"
                    onClick={() => {
                      setMenuOpen(false);
                      setServicesOpen(false);
                    }}
                    className="block px-4 py-2 text-gray-400 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Predictions
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/aboutUs"
              onClick={() => setMenuOpen(false)}
            >
              <button className={`${buttonStyle}`}>
                About Us
              </button>
            </Link>
            <Link
              to="/contactUs"
              onClick={() => setMenuOpen(false)}
            >
              <button className={`${buttonStyle}`}>
                Contact Us
              </button>
            </Link>

            {/* Theme Toggle - Mobile */}
            <button
              onClick={() => setDark((prev) => !prev)}
              className={`${buttonStyle}`}
            >
              {dark ? (
                <>
                  <FiSun size={18} />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <FiMoon size={18} />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;