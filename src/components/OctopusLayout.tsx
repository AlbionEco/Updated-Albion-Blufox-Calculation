import React from 'react';
import { Outlet } from 'react-router-dom';
import OctopusNavbar from './Navbar/OctopusNavbar';
import TopBrandNav from './Navbar/TopBrandNav';

const OctopusLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-blue-50/30">
      <TopBrandNav />
      <OctopusNavbar />
      <main className="flex-grow container mx-auto px-4 py-8 print:p-0 print:m-0 print:max-w-none">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-blue-100 py-8 text-center text-sm text-blue-600/60  no-print">
        <div className="flex flex-col items-center gap-2">
          <div className="font-black tracking-tighter text-lg">Octopus</div>
          <div>&copy; {new Date().getFullYear()} Octopus Pools & Services. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default OctopusLayout;
