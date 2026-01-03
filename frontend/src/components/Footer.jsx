import React from 'react';
import { FiGithub, FiMail, FiMapPin } from 'react-icons/fi';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white shadow-inner mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-lg">Temperature Dashboard</h3>
            <p className="text-sm text-gray-600">
              Real-time IoT temperature monitoring system for Agadir, Morocco.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiMapPin className="text-green-500" />
              <span>Agadir, Morocco</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <ul className="flex flex-col gap-2 text-sm text-gray-600">
              <li><a href="/" className="hover:text-green-500 transition">Home</a></li>
              <li><a href="/temperature" className="hover:text-green-500 transition">Temperature</a></li>
              <li><a href="/humidity" className="hover:text-green-500 transition">Humidity</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3 items-center">
            <h3 className="font-semibold text-lg">Connect</h3>
            <div className="flex gap-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                className="p-2 rounded-full bg-black-100 hover:bg-green-500 hover:text-black transition"
                aria-label="GitHub"
              >
                <FiGithub size={20} />
              </a>
              <a 
                href="mailto:contact@example.com"
                className="p-2 rounded-full bg-black-100 hover:bg-green-500 hover:text-black transition"
                aria-label="Email"
              >
                <FiMail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>© {currentYear} Agri 4.0 IoT Project. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;