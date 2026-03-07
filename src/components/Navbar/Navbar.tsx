import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Levapore', path: '/albion/levapore' },
    { name: 'MBR', path: '/albion/mbr' },
    { name: 'MBBR', path: '/albion/mbbr' },
    { name: 'Filter Pressure', path: '/albion/pressure' },
    { name: 'Capacity Of Dosing Pump', path: '/albion/cebcip' },
    { name: 'AFM (Dryden Aqua)', path: '/albion/afm' },
  ];

  const handleLogOut = () => {
    document.cookie = "token=;max-age=1;path=/";
    window.location.href = "/login";
  };

  return (
    <nav className="bg-white border-b border-gray-100 shadow-md sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-12">
          <div className="flex items-center">
            <Link to="/login" className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="/login/Albion high - logo.jpg"
                alt="Albion Logo"
              />
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex lg:items-center lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded text-sm font-bold transition-colors gap-3 ${
                  location.pathname === link.path
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-emerald-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={handleLogOut}
              className="flex items-center px-2 py-1 rounded text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-green-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={handleLogOut}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
