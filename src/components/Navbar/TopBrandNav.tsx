import React from 'react';
import { NavLink } from 'react-router-dom';

const TopBrandNav: React.FC = () => {
  return (
    <div className="bg-white border-b border-gray-100 no-print">
      <div className="container mx-auto px-4">
        <div className="flex justify-center gap-8 py-3">
          <NavLink
            to="/albion"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span className="text-sm tracking-widest uppercase">Albion</span>
          </NavLink>
          <NavLink
            to="/blufox"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span className="text-sm tracking-widest uppercase">Blufox</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default TopBrandNav;
