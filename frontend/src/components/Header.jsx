import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiSun, FiMoon, FiThermometer } from 'react-icons/fi';

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dark, setDark] = useState(() => {
        if (localStorage.getItem("theme")) {
            return localStorage.getItem("theme") === "dark";
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        if (dark) {
            document.body.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [dark]);

    const activeLinkStyle = {
        color: '#22c55e', 
    };

    return (
        <header className="w-full bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
            <div className="flex justify-between items-center px-4 md:px-8 py-3">
                <Link to="/" className="flex-1 flex items-center gap-2" title="Go to Homepage">
                    <FiThermometer className="text-green-500" size={32} />
                    <span className="font-bold text-xl text-gray-800 dark:text-white hidden sm:inline">IoT Temp Watch</span>
                </Link>

                <nav className="hidden md:flex flex-row space-x-8 flex-1 justify-center items-center text-gray-600 dark:text-gray-300">
                    <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="font-medium text-lg hover:text-green-500 transition-colors">Home</NavLink>
                    <NavLink to="/temperature" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="font-medium text-lg hover:text-green-500 transition-colors">Temperature</NavLink>
                    <NavLink to="/humidity" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="font-medium text-lg hover:text-green-500 transition-colors">Humidity</NavLink>
                    <NavLink to="/forecast" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="font-medium text-lg hover:text-green-500 transition-colors">Forecast</NavLink>
                </nav>

                <div className="hidden md:flex flex-row space-x-4 flex-1 justify-end items-center">
                    <div className="flex items-center gap-2" title="Live data connection status">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Live</span>
                    </div>
                    <button
                        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        onClick={() => setDark((d) => !d)}
                        aria-label="Toggle dark mode"
                    >
                        {dark ? <FiSun size={22} /> : <FiMoon size={22} />}
                    </button>
                </div>

                <button
                    className="md:hidden flex items-center px-2 text-gray-600 dark:text-gray-300" 
                    onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
            </div>

            {menuOpen && (
                <div className="md:hidden px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                    <nav className="flex flex-col space-y-4 pt-4 text-gray-700 dark:text-gray-200">
                        <NavLink to="/" onClick={() => setMenuOpen(false)} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="font-medium text-lg">Home</NavLink>
                        <NavLink to="/temperature" onClick={() => setMenuOpen(false)} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="font-medium text-lg">Temperature</NavLink>
                        <NavLink to="/humidity" onClick={() => setMenuOpen(false)} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="font-medium text-lg">Humidity</NavLink>
                        <NavLink to="/forecast" onClick={() => setMenuOpen(false)} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="font-medium text-lg">Forecast</NavLink>
                    </nav>
                    <div className="flex items-center gap-2 mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Live Status</span>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header;