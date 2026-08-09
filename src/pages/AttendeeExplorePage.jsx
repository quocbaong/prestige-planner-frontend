import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  ChevronRight, 
  Search,
  Layout,
  Filter,
  Heart
} from 'lucide-react';
import { eventService } from '../services/eventService';

const categoryMap = {
  MUSIC: { label: 'Âm nhạc', icon: 'music_note' },
  TECH: { label: 'Công nghệ', icon: 'lan' },
  FOOD: { label: 'Ẩm thực', icon: 'restaurant' },
  ART: { label: 'Nghệ thuật', icon: 'palette' },
  BUSINESS: { label: 'Doanh nghiệp', icon: 'rocket_launch' },
  SPORTS: { label: 'Thể thao', icon: 'sports_soccer' },
  EDUCATION: { label: 'Giáo dục', icon: 'school' },
  ENTERTAINMENT: { label: 'Giải trí', icon: 'celebration' },
  OTHER: { label: 'Khác', icon: 'event' }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatPrice = (price) => {
  if (price === undefined || price === null || price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const AttendeeExplorePage = () => {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage
  useEffect(() => {
    const loadFavorites = () => {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavorites(favs);
    };
    loadFavorites();
    window.addEventListener('storage', loadFavorites);
    return () => window.removeEventListener('storage', loadFavorites);
  }, []);

  const toggleFavorite = (event, e) => {
    e.stopPropagation(); // Stop navigation
    const isFav = favorites.some(f => f.id === event.id);
    let updated;
    if (isFav) {
      updated = favorites.filter(f => f.id !== event.id);
    } else {
      updated = [...favorites, {
        id: event.id,
        title: event.title,
        slug: event.slug,
        shortDesc: event.shortDesc || event.description,
        description: event.description,
        startDate: event.startDate,
        venue: event.venue,
        city: event.city,
        category: event.category,
        bannerUrl: event.bannerUrl,
        thumbnailUrl: event.thumbnailUrl
      }];
    }
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };
  
  // Filters state
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  const categories = [
    { label: 'Tất cả', value: null },
    { label: 'Công nghệ', value: 'TECH' },
    { label: 'Âm nhạc', value: 'MUSIC' },
    { label: 'Doanh nghiệp', value: 'BUSINESS' },
    { label: 'Ẩm thực', value: 'FOOD' },
    { label: 'Nghệ thuật', value: 'ART' },
    { label: 'Thể thao', value: 'SPORTS' },
    { label: 'Giáo dục', value: 'EDUCATION' }
  ];

  // Fetch Featured Events on mount
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoadingFeatured(true);
        const res = await eventService.getPublicFeaturedEvents();
        setFeaturedEvents(res.data || []);
      } catch (err) {
        console.error('Error fetching featured events:', err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  // Fetch Discover Events when filters change
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        
        // Find category value
        const catObj = categories.find(c => c.label === activeCategory);
        const categoryValue = catObj ? catObj.value : null;

        const params = {
          status: 'PUBLISHED',
          sort: 'createdAt,desc'
        };

        if (search) params.search = search;
        if (categoryValue) params.category = categoryValue;
        if (selectedCity) params.city = selectedCity;
        if (selectedDate) {
          const dateStart = new Date(selectedDate);
          params.startDateFrom = dateStart.toISOString();
        }

        const res = await eventService.getPublicEvents(params);
        setEvents(res.data?.content || []);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoadingEvents(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, activeCategory, selectedCity, selectedDate]);

  return (
    <div className="p-8 lg:p-12 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 bg-[#fbfcff] min-h-screen pb-32">
       
       {/* Filter Context */}
       <div className="flex flex-col xl:flex-row items-center gap-6 mb-4">
          <div className="flex-1 flex items-center bg-white border border-slate-100 rounded-[24px] px-6 py-4 w-full shadow-sm">
             <Search className="w-5 h-5 text-slate-400 mr-4" />
             <input 
               type="text" 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Tìm kiếm sự kiện, hội thảo..." 
               className="bg-transparent border-none outline-none text-slate-700 w-full placeholder:text-slate-400 font-bold text-[15px]" 
             />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
             <div className="bg-white border border-slate-100 px-6 py-3 rounded-[24px] font-bold text-[14px] text-slate-600 flex items-center gap-2 shadow-sm relative">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border-none outline-none font-bold text-[14px] text-slate-600 bg-transparent"
                />
             </div>
             <div className="bg-white border border-slate-100 px-6 py-3 rounded-[24px] font-bold text-[14px] text-slate-600 flex items-center gap-2 shadow-sm">
                <MapPin className="w-5 h-5 text-indigo-500" />
                <select 
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="border-none outline-none font-bold text-[14px] text-slate-600 bg-transparent cursor-pointer"
                >
                  <option value="">Tất cả địa điểm</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                </select>
             </div>
             {(search || selectedCity || selectedDate || activeCategory !== 'Tất cả') && (
               <button 
                 onClick={() => {
                   setSearch('');
                   setSelectedCity('');
                   setSelectedDate('');
                   setActiveCategory('Tất cả');
                 }}
                 className="text-xs font-black text-indigo-600 hover:underline px-4"
               >
                 Xóa bộ lọc
               </button>
             )}
          </div>
       </div>

       {/* 1. Featured Events Section */}
       <div className="space-y-8">
         <div className="flex items-end justify-between">
           <div>
             <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Sự kiện nổi bật</h2>
             <p className="text-slate-400 font-bold">Những trải nghiệm độc đáo được đề xuất riêng cho bạn.</p>
           </div>
         </div>

         {loadingFeatured ? (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 h-[480px] bg-slate-100 rounded-[40px] animate-pulse"></div>
             <div className="flex flex-col gap-8">
               <div className="flex-1 h-[224px] bg-slate-100 rounded-[32px] animate-pulse"></div>
               <div className="flex-1 h-[224px] bg-slate-100 rounded-[32px] animate-pulse"></div>
             </div>
           </div>
         ) : featuredEvents.length > 0 ? (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Highlight Card */}
             <div 
               onClick={() => navigate(`/attendee/events/${featuredEvents[0].slug}`)}
               className="lg:col-span-2 group relative rounded-[40px] overflow-hidden cursor-pointer h-[480px] shadow-sm hover:shadow-xl transition-all duration-500"
             >
                {/* Favorite Heart Button */}
                <button
                  onClick={(e) => toggleFavorite(featuredEvents[0], e)}
                  className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center text-rose-500 border border-slate-200/60 shadow-md active:scale-90 hover:bg-rose-50 transition-all"
                  title={favorites.some(f => f.id === featuredEvents[0].id) ? "Bỏ yêu thích" : "Yêu thích"}
                >
                  <Heart className={`w-5 h-5 ${favorites.some(f => f.id === featuredEvents[0].id) ? 'fill-current' : 'text-slate-400'}`} />
                </button>

               {featuredEvents[0].bannerUrl ? (
                 <img src={featuredEvents[0].bannerUrl} alt={featuredEvents[0].title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
               ) : (
                 <div className="w-full h-full bg-indigo-950 flex items-center justify-center text-slate-400">
                   <span className="material-symbols-outlined text-6xl">event</span>
                 </div>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent flex flex-col justify-end p-10">
                 <span className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-xl w-fit mb-4 uppercase tracking-widest">
                   {categoryMap[featuredEvents[0].category]?.label || 'Sự kiện'}
                 </span>
                 <h3 className="text-3xl font-black text-white mb-6 leading-tight tracking-tight line-clamp-2">{featuredEvents[0].title}</h3>
                 <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm font-bold">
                   <div className="flex items-center gap-2.5"><Calendar className="w-5 h-5 text-indigo-400" /> {formatDate(featuredEvents[0].startDate)}</div>
                   <div className="flex items-center gap-2.5"><MapPin className="w-5 h-5 text-indigo-400" /> {featuredEvents[0].venue}</div>
                 </div>
               </div>
             </div>

             {/* Small Cards */}
             <div className="flex flex-col gap-8">
               {featuredEvents.slice(1, 3).map(c => (
                 <div 
                   key={c.id} 
                   onClick={() => navigate(`/attendee/events/${c.slug}`)}
                   className="flex-1 group relative rounded-[32px] overflow-hidden cursor-pointer h-[224px] shadow-sm hover:shadow-xl transition-all duration-500"
                 >
                    {/* Favorite Heart Button */}
                    <button
                      onClick={(e) => toggleFavorite(c, e)}
                      className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center text-rose-500 border border-slate-200/60 shadow-sm active:scale-90 hover:bg-rose-50 transition-all"
                      title={favorites.some(f => f.id === c.id) ? "Bỏ yêu thích" : "Yêu thích"}
                    >
                      <Heart className={`w-4 h-4 ${favorites.some(f => f.id === c.id) ? 'fill-current' : 'text-slate-400'}`} />
                    </button>

                   {c.bannerUrl ? (
                     <img src={c.bannerUrl} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                   ) : (
                     <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500">
                       <span className="material-symbols-outlined text-4xl">event</span>
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent flex flex-col justify-end p-8">
                     <h3 className="text-[19px] font-black text-white mb-2 leading-snug tracking-tight line-clamp-1">{c.title}</h3>
                     <p className="text-white/50 text-[12px] font-bold tracking-wide uppercase">
                       {formatDate(c.startDate)} • {c.venue}
                     </p>
                   </div>
                 </div>
               ))}
               
               {/* If only 1 featured event exists, display standard suggestions */}
               {featuredEvents.length === 1 && (
                 <div className="flex-1 bg-indigo-50/40 border border-dashed border-indigo-100 rounded-[32px] p-8 flex flex-col justify-center items-center text-center">
                   <span className="material-symbols-outlined text-3xl text-indigo-400 mb-2">auto_awesome</span>
                   <p className="text-xs text-slate-500 font-bold">Khám phá thêm sự kiện bên dưới</p>
                 </div>
               )}
             </div>
           </div>
         ) : (
           <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-[32px]">
             <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">auto_awesome</span>
             <p className="text-slate-500 font-bold text-sm">Chưa có sự kiện nổi bật nào được thiết lập.</p>
           </div>
         )}
       </div>

       {/* 2. Discover Events Section */}
       <div className="space-y-10">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-t border-slate-50 pt-14">
           <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Khám phá mọi sự kiện</h2>
              <p className="text-slate-400 font-bold">Tìm kiếm niềm đam mê từ hàng trăm sự kiện sắp tới.</p>
           </div>
           <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
             {categories.map(cat => (
               <button 
                 key={cat.label} 
                 onClick={() => setActiveCategory(cat.label)} 
                 className={`px-6 py-2.5 rounded-full text-[13px] font-black tracking-wide whitespace-nowrap transition-all ${activeCategory === cat.label ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
               >
                 {cat.label}
               </button>
             ))}
           </div>
         </div>

         {loadingEvents ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {[1, 2, 3].map(i => (
               <div key={i} className="bg-white rounded-[40px] border border-slate-100 h-[400px] animate-pulse"></div>
             ))}
           </div>
         ) : events.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {events.map(event => (
               <div 
                 key={event.id} 
                 onClick={() => navigate(`/attendee/events/${event.slug}`)}
                 className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-50 hover:shadow-xl transition-all group cursor-pointer flex flex-col h-full"
               >
                 <div className="relative h-[240px] overflow-hidden bg-slate-100 relative">
                    {/* Favorite Heart Button */}
                    <button
                      onClick={(e) => toggleFavorite(event, e)}
                      className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center text-rose-500 border border-slate-200/60 shadow-sm active:scale-90 hover:bg-rose-50 transition-all"
                      title={favorites.some(f => f.id === event.id) ? "Bỏ yêu thích" : "Yêu thích"}
                    >
                      <Heart className={`w-4 h-4 ${favorites.some(f => f.id === event.id) ? 'fill-current' : 'text-slate-400'}`} />
                    </button>
                   {event.bannerUrl ? (
                     <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                   ) : (
                     <div className="w-full h-full bg-[#5c46e5]/10 flex items-center justify-center text-slate-300">
                       <span className="material-symbols-outlined text-4xl">event</span>
                     </div>
                   )}
                 </div>
                 <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-indigo-600 text-[11px] font-black uppercase mb-4">
                      <Layout className="w-4 h-4" /> {categoryMap[event.category]?.label || 'Sự kiện'}
                    </div>
                    <h3 className="text-[19px] font-black text-slate-900 mb-4 tracking-tight leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-slate-400 text-[14px] font-medium leading-relaxed mb-6 flex-1 line-clamp-2">
                      {event.shortDesc || event.description || 'Chưa có mô tả chi tiết.'}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                       <div className="text-slate-500 text-[12px] font-bold">
                         {event.currentAttendees || 0} / {event.maxAttendees} đã đăng ký
                       </div>
                       <div className="text-[15px] font-black text-slate-900 flex items-center gap-1">
                         <span className="material-symbols-outlined text-base text-indigo-500">location_on</span> {event.city}
                       </div>
                    </div>
                 </div>
               </div>
             ))}
           </div>
         ) : (
           <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-[32px]">
             <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">search_off</span>
             <p className="text-slate-500 font-bold text-sm">Không tìm thấy sự kiện nào khớp với bộ lọc.</p>
           </div>
         )}
       </div>
    </div>
  );
};

export default AttendeeExplorePage;
