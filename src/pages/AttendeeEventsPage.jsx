import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  ArrowRight, 
  TrendingUp, 
  Layout as LayoutIcon,
  QrCode
} from 'lucide-react';
import { registrationService } from '../services/registrationService';

const categoryMap = {
  MUSIC: { label: 'ÂM NHẠC', icon: 'music_note' },
  TECH: { label: 'CÔNG NGHỆ', icon: 'lan' },
  FOOD: { label: 'ẨM THỰC', icon: 'restaurant' },
  ART: { label: 'NGHỆ THUẬT', icon: 'palette' },
  BUSINESS: { label: 'DOANH NGHIỆP', icon: 'rocket_launch' },
  SPORTS: { label: 'THỂ THAO', icon: 'sports_soccer' },
  EDUCATION: { label: 'GIÁO DỤC', icon: 'school' },
  ENTERTAINMENT: { label: 'GIẢI TRÍ', icon: 'celebration' },
  OTHER: { label: 'KHÁC', icon: 'event' }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const AttendeeEventsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const response = await registrationService.getMyRegistrations();
        setRegistrations(response.data || []);
      } catch (err) {
        console.error('Error fetching registered events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  const filterEvents = () => {
    const now = new Date();
    return registrations.filter((reg) => {
      const eventDate = reg.eventStartDate ? new Date(reg.eventStartDate) : new Date(reg.createdAt);
      if (activeTab === 'upcoming') {
        return eventDate >= now;
      } else {
        return eventDate < now;
      }
    });
  };

  const displayedEvents = filterEvents();

  return (
    <div className="p-6 lg:p-8 space-y-8 lg:space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 bg-[#fbfcff] min-h-screen pb-16">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200/80 pb-6 lg:pb-8">
        <div className="space-y-1.5">
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 leading-none tracking-tight">
            Sự kiện của tôi
          </h1>
          <p className="text-xs font-semibold text-slate-500 max-w-none">
            Quản lý và theo dõi tất cả các sự kiện bạn đã đăng ký hoặc sắp tham gia.
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/events')}
          className="flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-black text-xs shadow-md shadow-indigo-100 transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Khám phá thêm sự kiện</span>
        </button>
      </div>

      {/* 2. Tabs Section */}
      <div className="flex gap-2 p-1.5 bg-slate-100/70 border border-slate-200 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
            activeTab === 'upcoming' 
            ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60' 
            : 'text-slate-600 hover:text-slate-900 font-extrabold'
          }`}
        >
          Sắp diễn ra
        </button>
        <button 
          onClick={() => setActiveTab('joined')}
          className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
            activeTab === 'joined' 
            ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60' 
            : 'text-slate-600 hover:text-slate-900 font-extrabold'
          }`}
        >
          Đã tham gia
        </button>
      </div>

      {/* 3. Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-slate-200 h-[380px] animate-pulse flex flex-col">
              <div className="h-[240px] bg-slate-200"></div>
              <div className="p-6 flex-1 space-y-4">
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : displayedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedEvents.map((reg) => {
            const catInfo = categoryMap[reg.eventCategory] || categoryMap.OTHER;
            const statusLabel = reg.status === 'CONFIRMED' ? 'ĐÃ XÁC NHẬN' : 'CHỜ THANH TOÁN';
            return (
              <div key={reg.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col">
                <div className="relative h-[220px] overflow-hidden bg-slate-100">
                  {reg.eventBannerUrl ? (
                    <img 
                      src={reg.eventBannerUrl} 
                      alt="" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-950 flex items-center justify-center text-slate-350">
                      <span className="material-symbols-outlined text-5xl">event</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-slate-950/40 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    {catInfo.label}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4 mb-5">
                    <h3 className="text-base font-black text-slate-900 leading-snug tracking-tight line-clamp-2">
                      {reg.eventTitle}
                    </h3>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black whitespace-nowrap uppercase tracking-wider ${
                      reg.status === 'CONFIRMED' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-250'
                    }`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-xs font-extrabold text-slate-700">
                      <Calendar className="w-4 h-4 text-indigo-600" /> 
                      <span>{formatDate(reg.eventStartDate)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 leading-tight">
                      <MapPin className="w-4 h-4 text-slate-500" /> 
                      <span>{reg.eventVenue || 'Đang cập nhật'}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-5 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-700 font-black">
                      {reg.tickets?.length || 0} vé
                    </span>
                    <button 
                      onClick={() => navigate('/attendee/tickets', { state: { selectedRegId: reg.id } })}
                      className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5 group"
                    >
                      <span>Chi tiết vé</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-300 rounded-3xl">
          <span className="material-symbols-outlined text-5xl text-slate-350 mb-3">event_busy</span>
          <h3 className="text-base font-black text-slate-800 mb-1">Không có sự kiện</h3>
          <p className="text-slate-500 text-xs font-semibold">Bạn chưa có sự kiện nào trong danh mục này.</p>
        </div>
      )}

      {/* 4. Bottom Sections Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Suggestion Section */}
        <div className="xl:col-span-8 bg-indigo-50/40 rounded-[32px] p-8 border border-indigo-100 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-5">
            <h3 className="text-xl font-black text-indigo-900 tracking-tight">Gợi ý riêng cho bạn</h3>
            <p className="text-[13px] font-bold text-indigo-800/80 leading-relaxed">
              Dựa trên các sự kiện trước đây, chúng tôi nghĩ bạn sẽ thích những chương trình này.
            </p>
            <div className="flex flex-wrap sm:flex-nowrap gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 shadow-sm flex items-center gap-5 flex-1 min-w-[200px] hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/events')}>
                <div className="w-11 h-11 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[13px] font-black text-slate-900">Khám phá Hot</p>
                  <p className="text-[11px] font-bold text-slate-400">Xem ngay các xu hướng</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 shadow-sm flex items-center gap-5 flex-1 min-w-[200px] hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/events')}>
                <div className="w-11 h-11 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                  <LayoutIcon className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[13px] font-black text-slate-900">Mục ưa thích</p>
                  <p className="text-[11px] font-bold text-slate-400">Được đề xuất nhiều</p>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:flex w-32 h-32 items-center justify-center opacity-10">
            <span className="text-[120px] font-black text-indigo-900 leading-none select-none">Q</span>
          </div>
        </div>

        {/* Check-in Widget */}
        <div className="xl:col-span-4 bg-slate-50 p-8 rounded-[32px] border border-slate-200 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-sm">
            <QrCode className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 tracking-tight mb-2">Check-in nhanh chóng</h4>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              Tất cả mã QR sự kiện của bạn đều được lưu trữ tại một nơi duy nhất.
            </p>
          </div>
          <button onClick={() => navigate('/attendee/tickets')} className="text-xs font-black text-indigo-600 hover:underline underline-offset-4">
            Xem tất cả vé
          </button>
        </div>
      </div>

      <footer className="pt-8 flex justify-center text-slate-400 font-bold text-[11px] opacity-60">
        <p>© 2024 EventArchitect. Nền tảng quản lý sự kiện thông minh.</p>
      </footer>
    </div>
  );
};

export default AttendeeEventsPage;
