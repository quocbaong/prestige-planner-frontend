import React from 'react';
import { Outlet } from 'react-router-dom';
import AttendeeSidebar from './parts/AttendeeSidebar';
import AttendeeHeader from './parts/AttendeeHeader';

const AttendeeLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#f0f4ff] overflow-hidden">
      <AttendeeSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AttendeeHeader />
        <main className="flex-1 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AttendeeLayout;
