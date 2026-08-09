import React from 'react';
import landingPageImg from '../../assets/lading_page.png';

const DashboardMockupSection = () => {
  return (
    <section className="py-24 bg-surface-dim relative overflow-hidden">
      <div className="max-w-7.3xl mx-auto px-10 md:px-25">
        


        {/* Dashboard Image Wrapper */}
        <div className="relative rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 animate-fade-in group mb-20">
           <img 
             src={landingPageImg} 
             alt="Prestige Planner Dashboard Mockup" 
             className="w-full h-auto object-contain bg-white"
           />
           <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>



      </div>
    </section>
  );
};

export default DashboardMockupSection;
