import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSun, FiMoon } from 'react-icons/fi';

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

    return (
        <header className="w-full bg-white shadow">
            <div className="flex justify-between items-center px-4 md:px-8 py-3">
                {/* Logo */}
                <div className="flex-1 flex items-center">
                    <Link to="/">
                    <img className="h-14 md:h-20" src="https://th.bing.com/th/id/OIP.2PDIejApjWb5yA0ZqaFiJgHaHa?rs=1&pid=ImgDetMain" alt="logo" />
                    </Link>
                </div>
                {/* Hamburger */}
                <button
                    className="md:hidden flex items-center px-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
                {/* Nav links */}
                <ul className="hidden md:flex flex-row space-x-4 flex-1 justify-center items-center">
                    <li className="font-medium text-xl cursor-pointer"><Link to="/">Home</Link></li>
                    <li className="font-medium text-xl cursor-pointer"><Link to="/temperature">Temperature</Link></li>
                    <li className="font-medium text-xl cursor-pointer"><Link to="/humidity">Humidity</Link></li>
                </ul>
                {/* Buttons and light mode/dark mode toggle */}
                <div className="hidden md:flex flex-row space-x-4 flex-1 justify-end items-center">
                    <button className="bg-green-500 rounded-b-xl text-white px-4 py-2"><span>Say Hello!</span></button>
                    <button className="bg-green-400 rounded-b-xl text-white px-4 py-2"><span>Contact Us!</span></button>
                    <button
                        className="ml-2 p-2 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-50 transition"
                        onClick={() => setDark((d) => !d)}
                        aria-label="Toggle dark mode"
                    >
                        {dark
                            ? <FiSun size={22} />
                            : <FiMoon size={22} />
                        }
                    </button>
                </div>
            </div>
            {/* Mobile menu */}
            {/*this expression bellow called conditional rendering, so if the menuOpern is true it will render the bellow code otherwise, it won't  */}
            {menuOpen && (
                <div className="md:hidden px-4 pb-4">
                    <ul className="flex flex-col space-y-2">
                        <li className="font-medium text-lg"><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
                        <li className="font-medium text-lg"><Link to="/temperature" onClick={() => setMenuOpen(false)}>Temperature</Link></li>
                        <li className="font-medium text-lg"><Link to="/humidity" onClick={() => setMenuOpen(false)}>Humidity</Link></li>
                    </ul>
                    <div className="flex flex-col space-y-2 mt-4">
                        <button className="bg-green-500 rounded-b-xl text-white px-4 py-2">Say Hello!</button>
                        <button className="bg-green-400 rounded-b-xl text-white px-4 py-2">Contact Us!</button>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header;
