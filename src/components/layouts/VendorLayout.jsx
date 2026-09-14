import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import VendorSidebar from './parts/VendorSidebar';
import VendorHeader from './parts/VendorHeader';

const VendorLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <div className="hidden lg:block">
        {isSidebarOpen && <VendorSidebar />}
      </div>

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <VendorHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
