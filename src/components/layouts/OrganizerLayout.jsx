import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import OrganizerSidebar from './parts/OrganizerSidebar';
import OrganizerHeader from './parts/OrganizerHeader';

const OrganizerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-bg-default">
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-screen z-50"
          >
            <OrganizerSidebar />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        animate={{ 
          marginLeft: isSidebarOpen ? '256px' : '0px',
          width: isSidebarOpen ? 'calc(100% - 256px)' : '100%'
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="flex-1 flex flex-col min-h-screen relative"
      >
        <div className="sticky top-0 z-40 w-full">
          <OrganizerHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      </motion.div>

    </div>
  );
};

export default OrganizerLayout;
