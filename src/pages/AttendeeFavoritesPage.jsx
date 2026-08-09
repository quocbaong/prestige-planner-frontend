import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Calendar, MapPin, Search, ArrowRight, Sparkles, Smile, Filter, ChevronDown } from 'lucide-react';

const categoryMap = {
  MUSIC: { label: 'Âm nhạc', color: 'from-pink-500 to-rose-600', text: 'text-rose-500', bg: 'bg-rose-50' },
  TECH: { label: 'Công nghệ', color: 'from-blue-500 to-indigo-600', text: 'text-indigo-500', bg: 'bg-indigo-50' },
  FOOD: { label: 'Ẩm thực', color: 'from-amber-500 to-orange-600', text: 'text-orange-500', bg: 'bg-orange-50' },
  ART: { label: 'Nghệ thuật', color: 'from-purple-500 to-violet-600', text: 'text-violet-500', bg: 'bg-purple-50' },
  BUSINESS: { label: 'Doanh nghiệp', color: 'from-emerald-500 to-teal-600', text: 'text-emerald-500', bg: 'bg-emerald-50' },
  SPORTS: { label: 'Thể thao', color: 'from-sky-500 to-blue-600', text: 'text-sky-500', bg: 'bg-sky-50' },
  EDUCATION: { label: 'Giáo dục', color: 'from-cyan-500 to-blue-500', text: 'text-cyan-600', bg: 'bg-cyan-50' },
  ENTERTAINMENT: { label: 'Giải trí', color: 'from-fuchsia-500 to-pink-600', text: 'text-fuchsia-500', bg: 'bg-fuchsia-50' },
  OTHER: { label: 'Khác', color: 'from-slate-500 to-slate-700', text: 'text-slate-600', bg: 'bg-slate-50' }
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

const AttendeeFavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    const loadFavorites = () => {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavorites(favs);
    };
    loadFavorites();

    // Listen to changes in localStorage
    window.addEventListener('storage', loadFavorites);
    return () => window.removeEventListener('storage', loadFavorites);
  }, []);

  const handleRemoveFavorite = (eventId, e) => {
    e.stopPropagation(); // Avoid navigating to details
    const updated = favorites.filter(item => item.id !== eventId);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  // Categories list derived from favorite events
  const categories = ['Tất cả', ...new Set(favorites.map(item => item.category).filter(Boolean))];

  // Filtering logic
  const filteredFavorites = favorites.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Tất cả' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-[1400px] mx-auto px-6 pt-6 pb-12 animate-in fade-in duration-500">
        
        {/* Page Header */}
        <div className="mb-5 border-b border-slate-100 pb-3">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sự kiện yêu thích</h1>
          <p className="text-slate-550 text-xs font-medium mt-1">Lưu trữ các sự kiện bạn quan tâm và muốn tham dự.</p>
        </div>

        {favorites.length === 0 ? (
          /* Empty State */
          <div className="max-w-md mx-auto py-16 px-6 text-center flex flex-col items-center justify-center bg-white border border-slate-200 rounded-[32px] shadow-sm">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[28px] border border-rose-100 flex items-center justify-center mb-6 shadow-sm">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Danh sách yêu thích trống</h2>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-[320px] mb-8">
              Khám phá hàng loạt sự kiện công nghệ, âm nhạc, nghệ thuật thú vị xung quanh bạn và nhấn nút thả tim để lưu trữ nhé.
            </p>
            <button
              onClick={() => navigate('/attendee/explore')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-black text-xs shadow-md shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Khám phá sự kiện ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Search Box */}
              <div className="flex-1 flex items-center bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 shadow-sm w-full sm:max-w-md">
                <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sự kiện yêu thích..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-slate-700 w-full placeholder:text-slate-400 font-semibold text-xs"
                />
              </div>

              {/* Category Selector */}
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-350 rounded-2xl text-xs font-bold text-slate-700 transition-all active:scale-95 shadow-sm shadow-slate-100/50 min-w-[140px]"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{categoryMap[selectedCategory]?.label || selectedCategory}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200" />
                </button>

                {showFilterMenu && (
                  <>
                    {/* Click backdrop */}
                    <div className="fixed inset-0 z-20" onClick={() => setShowFilterMenu(false)} />
                    
                    {/* Custom Popover Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200/80 rounded-2xl shadow-xl p-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setShowFilterMenu(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                            selectedCategory === cat 
                              ? 'bg-indigo-50/60 text-indigo-600 font-bold' 
                              : 'text-slate-650 hover:bg-slate-50/80'
                          }`}
                        >
                          <span>{categoryMap[cat]?.label || cat}</span>
                          {selectedCategory === cat && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Favorite Events Grid */}
            {filteredFavorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavorites.map(event => {
                  const catInfo = categoryMap[event.category] || categoryMap.OTHER;
                  return (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/attendee/events/${event.slug}`)}
                      className="bg-white rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-indigo-500 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full relative"
                    >
                      {/* Favorite Button on card top-right */}
                      <button
                        onClick={(e) => handleRemoveFavorite(event.id, e)}
                        className="absolute top-3 right-3 z-10 w-8.5 h-8.5 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-rose-500 border border-white/20 shadow-md hover:bg-rose-50 hover:text-rose-600 transition-all duration-205 active:scale-90"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>

                      {/* Image header */}
                      <div className="relative h-40 overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={event.thumbnailUrl || event.bannerUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600"}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                        
                        {/* Category tag directly on image */}
                        <span className={`absolute bottom-3 left-3 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r ${catInfo.color} shadow-md border border-white/20`}>
                          {catInfo.label}
                        </span>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex flex-col flex-1 pb-4">
                        <h3 className="text-[14px] font-black text-slate-800 group-hover:text-indigo-650 transition-colors leading-snug line-clamp-2 mb-1.5">
                          {event.title}
                        </h3>

                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed line-clamp-2">
                          {event.shortDesc || event.description}
                        </p>
                      </div>

                      {/* Card Footer Metadata */}
                      <div className="bg-slate-50/50 px-5 py-3.5 border-t-2 border-slate-200 space-y-2 mt-auto">
                        <div className="flex items-center gap-2 text-slate-600 text-[11px] font-bold">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 text-[11px] font-bold">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{event.venue || event.city}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* No search results empty state */
              <div className="text-center py-20 bg-white border border-slate-200 rounded-[32px] shadow-sm">
                <Smile className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-base font-black text-slate-800 mb-1">Không tìm thấy sự kiện nào</h3>
                <p className="text-slate-500 text-xs font-semibold">Thử thay đổi từ khóa tìm kiếm hoặc danh mục bộ lọc xem nhé.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendeeFavoritesPage;
