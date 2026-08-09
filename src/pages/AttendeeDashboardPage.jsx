import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Ticket, 
  Plus, 
  ArrowRight,
  TrendingUp,
  QrCode
} from 'lucide-react';
import { useAuth } from '../stores/AuthContext';
import { registrationService } from '../services/registrationService';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const AttendeeDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ upcomingCount: 0, totalTickets: 0 });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const response = await registrationService.getMyRegistrations();
        const regs = response.data || [];
        
        const now = new Date();
        let upcoming = 0;
        let ticketsCount = 0;

        regs.forEach(reg => {
          const startDate = reg.eventStartDate ? new Date(reg.eventStartDate) : new Date(reg.createdAt);
          if (startDate >= now) {
            upcoming++;
          }
          if (reg.status === 'CONFIRMED' && reg.tickets) {
            ticketsCount += reg.tickets.length;
          }
        });

        setStats({
          upcomingCount: upcoming,
          totalTickets: ticketsCount
        });

        // Get 2 most recent registrations
        setRecentEvents(regs.slice(0, 2));
      } catch (err) {
        console.error('Error loading attendee dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Hội viên';

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 bg-[#fbfcff] min-h-screen pb-20">
      
      {/* 1. Compact Premium Greeting Section */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[48px] p-10 lg:p-14 text-white shadow-2xl shadow-indigo-100/20">
        {/* Background Decor */}
        <div className="absolute top-[-80px] right-[-80px] w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full" />
        
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12">
          {/* Left: Content */}
          <div className="flex-1">
             <div className="flex items-center gap-3 mb-6 opacity-80">
                <span className="h-[2px] w-12 bg-indigo-500"></span>
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400">HỘI VIÊN CHÍNH THỨC</span>
             </div>
             <h2 className="text-[44px] lg:text-[52px] font-black leading-tight mb-8 tracking-tighter">
                Chào mừng quay lại, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{displayName}!</span> 👋
             </h2>
             <div className="flex flex-wrap items-center gap-4">
                <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_12px_#6366f1]"></div>
                   <span className="text-[12px] font-black tracking-widest uppercase text-white/90">Premium account</span>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/10 px-6 py-3 rounded-2xl flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                   <span className="text-[12px] font-black tracking-widest uppercase text-emerald-400">Sẵn sàng trải nghiệm</span>
                </div>
             </div>
          </div>

          {/* Right: Modern Stats */}
          <div className="flex gap-6 w-full xl:w-auto">
             <div className="flex-1 xl:w-[220px] bg-white/[0.03] border border-white/10 p-8 rounded-[40px] group hover:bg-white/[0.08] transition-all">
                <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-2xl w-fit mb-6 transition-transform group-hover:scale-110">
                   <Calendar className="w-7 h-7" />
                </div>
                <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Sắp tới</p>
                <div className="flex items-baseline gap-2">
                   <h4 className="text-[36px] font-black">{loading ? '...' : stats.upcomingCount}</h4>
                   {stats.upcomingCount > 0 && (
                     <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">MỚI</span>
                   )}
                </div>
             </div>

             <div className="flex-1 xl:w-[220px] bg-white/[0.03] border border-white/10 p-8 rounded-[40px] group hover:bg-white/[0.08] transition-all">
                <div className="p-4 bg-purple-500/20 text-purple-400 rounded-2xl w-fit mb-6 transition-transform group-hover:scale-110">
                   <Ticket className="w-7 h-7" />
                </div>
                <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Vé của tôi</p>
                <h4 className="text-[36px] font-black">{loading ? '...' : stats.totalTickets}</h4>
             </div>
          </div>
        </div>
      </div>

      {/* 2. Grid Widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Recent Events Section */}
        <div className="xl:col-span-8 space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Sự kiện gần đây</h3>
              <button 
                onClick={() => navigate('/attendee/events')}
                className="text-[14px] font-bold text-indigo-600 hover:underline"
              >
                Xem tất cả
              </button>
           </div>
           
           {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[1, 2].map((i) => (
                 <div key={i} className="bg-white rounded-[40px] border border-slate-100 h-[340px] animate-pulse"></div>
               ))}
             </div>
           ) : recentEvents.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {recentEvents.map((reg) => (
                  <div key={reg.id} className="bg-white rounded-[40px] overflow-hidden border border-slate-50 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col justify-between">
                     <div className="relative h-[200px] overflow-hidden bg-slate-100 shrink-0">
                        {reg.eventBannerUrl ? (
                          <img src={reg.eventBannerUrl} alt={reg.eventTitle} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full bg-[#5c46e5]/10 flex items-center justify-center text-slate-300">
                            <span className="material-symbols-outlined text-4xl">event</span>
                          </div>
                        )}
                     </div>
                     <div className="p-8 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-[18px] font-black text-slate-800 mb-4 tracking-tight leading-tight line-clamp-2">{reg.eventTitle}</h4>
                          <div className="flex items-center gap-3 text-[13px] font-bold text-slate-400">
                             <Calendar className="w-4 h-4 text-indigo-500" /> {formatDate(reg.eventStartDate)}
                          </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                           <span className="text-xs text-slate-400 font-bold">
                             {reg.tickets?.length || 0} vé • <span className="uppercase">{reg.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Chờ duyệt'}</span>
                           </span>
                           <button 
                             onClick={() => navigate('/attendee/tickets', { state: { selectedRegId: reg.id } })}
                             className="text-indigo-600 font-black text-[13px] flex items-center gap-1 group"
                           >
                              Chi tiết <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           ) : (
             <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-[32px]">
               <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">confirmation_number</span>
               <p className="text-slate-500 font-bold text-sm">Bạn chưa đăng ký sự kiện nào.</p>
               <button onClick={() => navigate('/events')} className="text-indigo-600 font-black text-xs mt-3 hover:underline flex items-center gap-1 mx-auto">
                 Khám phá sự kiện ngay <ArrowRight className="w-3.5 h-3.5" />
               </button>
             </div>
           )}
        </div>

        {/* Quick Actions & Suggestions */}
        <div className="xl:col-span-4 space-y-10">
           {/* Recommendation Card */}
           <div className="bg-indigo-50/50 p-10 rounded-[48px] border border-indigo-100 space-y-8">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-[22px] flex items-center justify-center">
                 <TrendingUp className="w-7 h-7" />
              </div>
              <div>
                 <h4 className="text-xl font-black text-slate-800 tracking-tight mb-2">Gợi ý sự kiện</h4>
                 <p className="text-[13px] font-bold text-slate-500 leading-relaxed">Chúng tôi có những sự kiện hội thảo công nghệ mới phù hợp với bạn.</p>
              </div>
              <button 
                onClick={() => navigate('/events')}
                className="w-full bg-white text-indigo-600 py-4 rounded-[22px] font-black text-[14px] shadow-sm border border-indigo-100 hover:bg-slate-50 transition-all"
              >
                Khám phá ngay
              </button>
           </div>

           {/* Quick Check-in Card */}
           <div className="bg-slate-900 p-10 rounded-[48px] text-white space-y-8">
              <div className="w-14 h-14 bg-white/10 text-white rounded-[22px] flex items-center justify-center">
                 <QrCode className="w-7 h-7" />
              </div>
              <div>
                 <h4 className="text-xl font-black tracking-tight mb-2">Check-in nhanh</h4>
                 <p className="text-[13px] font-bold text-white/50 leading-relaxed">Lấy mã QR vé để tham gia sự kiện nhanh chóng hơn.</p>
              </div>
              <button 
                onClick={() => navigate('/attendee/tickets')}
                className="w-full bg-indigo-600 text-white py-4 rounded-[22px] font-black text-[14px] shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
              >
                Lấy mã QR
              </button>
           </div>
        </div>
      </div>

    </div>
  );
};

export default AttendeeDashboardPage;
