import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroDashboard from '../../assets/hero-dashboard-new.png';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden bg-[#0c1222]">
      {/* Premium Background Effects - Richer Gradients */}
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none translate-y-1/4 -translate-x-1/4"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">

        {/* Left: Content */}
        <div className="space-y-10 order-2 lg:order-1 transition-all duration-700 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 backdrop-blur-xl shadow-inner">
            <span className="flex h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-green-400 uppercase font-headline">
              Tương lai của quản lý sự kiện
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-headline font-black text-white leading-[1.1] tracking-tight cursor-default">
              Tổ chức sự kiện <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d4d] to-[#f9cb28] animate-gradient-x">
                thông minh, chuyên nghiệp
              </span>
            </h1>

            <p className="text-base md:text-md text-white max-w-lg leading-relaxed font-body font-normal opacity-90">
              Nền tảng quản trị sự kiện toàn diện giúp bạn tối ưu hóa quy trình, tự động hóa tương tác và nâng tầm trải nghiệm khách mời.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 pt-2">
            <button
              onClick={() => navigate('/demo')}
              className="px-10 py-4.5 bg-transparent border-[3px] border-white text-white rounded-xl font-headline font-bold text-base transition-all duration-400 hover:bg-white hover:text-[#0c1222] active:scale-95 shadow-[0_0_25px_rgba(255,255,255,0.08)] relative group overflow-hidden"
            >
              <span className="relative z-10">YÊU CẦU BẢN DEMO</span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            </button>
          </div>
        </div>

        {/* Right: Premium Mockup Image Container */}
        <div className="relative group order-1 lg:order-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {/* Decorative glow behind image */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-red-600/30 to-indigo-600/20 blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>

          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-1.5 md:p-2 backdrop-blur-sm overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <img
              src={heroDashboard}
              alt="Event Management Dashboard"
              className="w-full h-auto rounded-xl shadow-2xl transition-transform duration-[1.5s] ease-out group-hover:scale-[1.03]"
            />
            {/* Subtle glass overlay reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none opacity-50"></div>
          </div>

          {/* Floating metrics for premium visualization */}
          <div className="absolute -bottom-8 -right-4 bg-white/95 backdrop-blur-xl p-2 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/20 hidden md:block animate-float">
            <div className="flex items-center gap-3">
              <div className="bg-red-50 p-2 rounded-xl">
                <span className="material-symbols-outlined text-red-500 text-xl font-bold">trending_up</span>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold font-headline">Hiệu suất</p>
                <p className="text-sm font-bold text-slate-900">+45% Tham gia</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
