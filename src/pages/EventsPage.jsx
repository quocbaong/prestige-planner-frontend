import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import LandingNavbar from '../components/common/LandingNavbar';
import LandingFooter from '../components/common/LandingFooter';

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

const FilterSection = ({ onSearch }) => {
  const [localQuery, setLocalQuery] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(localQuery);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setLocalQuery(value);
    if (value === '') {
      onSearch('');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 mt-8 mb-12">
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="flex-1 flex items-center bg-slate-100 rounded-full px-5 py-3.5 w-full focus-within:ring-2 focus-within:ring-[#5c46e5]/30">
          <span 
            className="material-symbols-outlined text-slate-400 mr-3 cursor-pointer hover:text-[#5c46e5] transition-colors"
            onClick={() => onSearch(localQuery)}
          >
            search
          </span>
          <input
            type="text"
            value={localQuery}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Tìm kiếm sự kiện, hội thảo, buổi hòa nhạc..."
            className="bg-transparent border-none outline-none text-slate-700 w-full placeholder:text-slate-400 font-medium text-[15px]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-slate-100 rounded-full px-5 py-3.5 cursor-pointer hover:bg-slate-200 transition">
            <span className="material-symbols-outlined text-slate-600 mr-2 text-[20px]">calendar_today</span>
            <span className="text-slate-700 font-medium text-[15px]">Ngày</span>
          </div>
          <div className="flex items-center bg-slate-100 rounded-full px-5 py-3.5 cursor-pointer hover:bg-slate-200 transition">
            <span className="material-symbols-outlined text-slate-600 mr-2 text-[20px]">location_on</span>
            <span className="text-slate-700 font-medium text-[15px]">Vị trí</span>
          </div>
          <div className="flex items-center justify-center bg-[#5c46e5] rounded-full w-12 h-12 min-w-[3rem] cursor-pointer hover:bg-[#4d38da] transition shadow-md shadow-[#5c46e5]/20">
            <span className="material-symbols-outlined text-white text-[20px]">tune</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturedEvents = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await eventService.getPublicFeaturedEvents();
        setFeatured(response.data || []);
      } catch (error) {
        console.error('Error fetching featured events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 mb-16 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-48 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[480px]">
          <div className="lg:col-span-2 bg-slate-200 rounded-3xl"></div>
          <div className="flex flex-col gap-6">
            <div className="flex-1 bg-slate-200 rounded-3xl"></div>
            <div className="flex-1 bg-slate-200 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (featured.length === 0) return null;

  const mainEvent = featured[0];
  const sideEvents = featured.slice(1, 3);

  return (
    <div className="max-w-[1400px] mx-auto px-6 mb-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2 font-headline">Sự kiện nổi bật</h2>
          <p className="text-slate-500 font-medium">Những trải nghiệm độc đáo được đề xuất riêng cho bạn.</p>
        </div>
        <div className="hidden sm:flex items-center text-[#5c46e5] font-semibold cursor-pointer hover:text-[#4d38da] transition group">
          Xem tất cả
          <span className="material-symbols-outlined ml-1 text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto">
        {/* Big Card */}
        {mainEvent && (
          <div 
            className="lg:col-span-2 group relative rounded-3xl overflow-hidden cursor-pointer h-[400px] lg:h-[480px]"
            onClick={() => navigate(`/events/${mainEvent.slug}`)}
          >
            <img
              src={mainEvent.bannerUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200&h=800"}
              alt={mainEvent.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
              <span className="bg-[#5c46e5] text-white text-xs font-bold px-3 py-1.5 rounded-full w-fit mb-4 tracking-wide uppercase">
                {categoryMap[mainEvent.category]?.label || 'HỘI THẢO'}
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {mainEvent.title}
              </h3>
              <div className="flex items-center gap-6 text-slate-200 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  {formatDate(mainEvent.startDate)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  {mainEvent.venue || mainEvent.city}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Small Cards Stack */}
        <div className="flex flex-col gap-6 h-[480px] lg:h-[480px]">
          {sideEvents.map((event) => (
            <div 
              key={event.id}
              className="flex-1 group relative rounded-3xl overflow-hidden cursor-pointer"
              onClick={() => navigate(`/events/${event.slug}`)}
            >
              <img
                src={event.thumbnailUrl || event.bannerUrl || "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600&h=400"}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white mb-2 leading-snug">
                  {event.title}
                </h3>
                <p className="text-slate-300 text-xs font-medium">
                  {formatDate(event.startDate)} • {event.venue || event.city}
                </p>
              </div>
            </div>
          ))}
          {sideEvents.length === 0 && !loading && (
            <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-400 text-sm font-medium">
              Không có thêm sự kiện nổi bật
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DiscoverEvents = ({ searchQuery = "" }) => {
  const navigate = useNavigate();
  const tabs = [
    { label: 'Tất cả', category: null },
    { label: 'Âm nhạc', category: 'MUSIC' },
    { label: 'Công nghệ', category: 'TECH' },
    { label: 'Ẩm thực', category: 'FOOD' },
    { label: 'Nghệ thuật', category: 'ART' },
    { label: 'Doanh nghiệp', category: 'BUSINESS' }
  ];

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {
        page: page - 1, // Spring Boot is 0-indexed
        size: 6,
        search: searchQuery || undefined,
        category: tabs[activeTabIndex].category || undefined
      };
      const response = await eventService.getPublicEvents(params);
      setEvents(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching public events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [activeTabIndex, searchQuery, page]);

  useEffect(() => {
    setPage(1);
  }, [activeTabIndex, searchQuery]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 mb-20 relative">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-8 gap-6 pt-10">
        <h2 className="text-3xl font-bold text-slate-900 font-headline whitespace-nowrap">Khám phá mọi sự kiện</h2>
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 xl:pb-0 w-full xl:w-auto relative pr-12">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              onClick={() => setActiveTabIndex(index)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeTabIndex === index
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-[24px] overflow-hidden border border-slate-100 h-[420px] animate-pulse flex flex-col">
              <div className="h-[220px] bg-slate-200"></div>
              <div className="p-6 flex-1 space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-10 bg-slate-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => {
            const catInfo = categoryMap[event.category] || categoryMap.OTHER;
            return (
              <div 
                key={event.id} 
                className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col h-full"
                onClick={() => navigate(`/events/${event.slug}`)}
              >
                <div className="relative h-[220px] overflow-hidden">
                  <img
                    src={event.thumbnailUrl || event.bannerUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600&h=400"}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {event.isFeatured && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      Nổi bật
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 text-[#5c46e5] text-xs font-bold uppercase tracking-wider mb-3">
                    <span className="material-symbols-outlined text-[16px]">{catInfo.icon}</span>
                    {catInfo.label}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#5c46e5] transition-colors leading-snug line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-2 leading-relaxed">
                    {event.shortDesc || event.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <span className="material-symbols-outlined text-[18px]">group</span>
                      {event.currentAttendees || 0} / {event.maxAttendees || '∞'} tham gia
                    </div>
                    <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                      Xem vé
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-slate-200 rounded-3xl">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">event_busy</span>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Không có sự kiện</h3>
          <p className="text-slate-500">Hiện chưa có sự kiện nào phù hợp với bộ lọc.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-12 gap-2">
          <button 
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-slate-300 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                page === p
                  ? 'bg-[#5c46e5] text-white shadow-md shadow-[#5c46e5]/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}

          <button 
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-slate-300 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

const EventsPage = () => {
  const [activeSearchQuery, setActiveSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#fafafc] font-sans selection:bg-[#5c46e5]/20 flex flex-col">
      <LandingNavbar />
      <main className="pt-24 lg:pt-[100px] flex-1">
        <FilterSection onSearch={setActiveSearchQuery} />
        <FeaturedEvents />
        <DiscoverEvents searchQuery={activeSearchQuery} />
      </main>
      <LandingFooter />
    </div>
  );
};

export default EventsPage;
