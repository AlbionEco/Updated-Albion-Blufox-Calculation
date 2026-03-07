import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import TopBrandNav from './Navbar/TopBrandNav';

const AlbionLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBrandNav />
      <Navbar />
      <main className="flex-grow container mx-auto px-2 py-4">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500 no-print">
        &copy; {new Date().getFullYear()} Albion Ecotech. All rights reserved.
      </footer>
    </div>
  );
};

export default AlbionLayout;
