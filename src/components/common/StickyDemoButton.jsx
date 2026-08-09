import React, { useState, useEffect } from 'react';

const StickyDemoButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Chỉ hiện sau khi đã cuộn qua 80% chiều cao màn hình (hết Hero)
      setIsVisible(window.scrollY > window.innerHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    // Chạy kiểm tra ngay khi load để tránh hiện trạng thái sai
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={`fixed right-0 top-1/2 -translate-y-1/2 z-[100] transition-all duration-700 ease-in-out transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      <button 
        className="bg-[#0066ff] hover:bg-[#005ce6] text-white w-16 h-20 md:w-20 md:h-24 rounded-l-lg shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center gap-2 group transition-all duration-300 border-l border-white/20"
        onClick={() => {
           const contactSection = document.getElementById('contact-section');
           if (contactSection) {
             contactSection.scrollIntoView({ behavior: 'smooth' });
           }
        }}
      >
        {/* Icon box - Square style */}
        <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-[25px]">
            play_arrow
          </span>
        </div>
        
        <div className="flex flex-col items-center leading-none">
          <span className="text-[10px] font-black tracking-tighter uppercase">Yêu cầu</span>
          <span className="text-[10px] font-black tracking-tighter uppercase">Bản demo</span>
        </div>
      </button>
    </div>
  );
};

export default StickyDemoButton;
