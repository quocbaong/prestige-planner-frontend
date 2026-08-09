import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  UserX, 
  UserCheck, 
  Mail, 
  Download, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Ticket,
  Users2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  MessageSquare
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';

const GuestsPage = () => {
  // Premium Mock Attendees / Guests Database for Admin Panel
  const [guests, setGuests] = useState([
    { 
      id: 1, 
      name: 'Lê Minh Anh', 
      email: 'minhanh.le@email.com', 
      phone: '0912 345 678',
      joinedDate: '12/01/2024',
      totalSpent: '12,500,000đ',
      ticketsCount: 8,
      status: 'Hoạt động', // 'Hoạt động' or 'Đã khóa'
      preferredCategory: 'Công nghệ',
      recentEvent: 'Vietnam Tech Summit 2024',
      ticketType: 'VIP',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRH6VK7Zu4rCm5nTo3CMXKlUWaPqlN5PKWQ6QLxMCzoPocFkFRu22-WAI3S5CHf26KzxM0Qh0P_2O3ckeDNJKd4OTcg-i16AyQ05N0oXMcIVf37Pkdj-ynRTSuJ0_k458AZOtTqN-artRQ39q8PWoA4cK_jyJWT_8jjNIhP7bsf3muaKvc-0VfQoSG_D2IwHZBVIgSoDV81-djG5K2xGVjh-6cOanOlUlQsl5TzPs4vy2PuE2esHKl-T4M6MLirCRN8o0ugoqF0HdW' 
    },
    { 
      id: 2, 
      name: 'Nguyễn Thành Trung', 
      email: 'trung.nt@workmail.vn', 
      phone: '0988 765 432',
      joinedDate: '28/02/2024',
      totalSpent: '4,200,000đ',
      ticketsCount: 3,
      status: 'Hoạt động',
      preferredCategory: 'Khoa học',
      recentEvent: 'Hội thảo AI & Robotics',
      ticketType: 'Thường',
      avatar: null 
    },
    { 
      id: 3, 
      name: 'Trần Hoàng Long', 
      email: 'long.th@creative-agency.com', 
      phone: '0909 112 233',
      joinedDate: '05/03/2024',
      totalSpent: '18,900,000đ',
      ticketsCount: 12,
      status: 'Hoạt động',
      preferredCategory: 'Nghệ thuật',
      recentEvent: 'Gala Dinner: Night of Stars',
      ticketType: 'VIP',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvprpCeJzOAnx-LoHVMcc-pUpA5fHzkPvEIoCe3m691NNvr3DJhdiW7liOTMgbJ6yypaTKNqmxNrgRH0fu2luocDxDOyPjQA4JsKP0_Us32UveDuwZ-TMNulMoqZj6kbQG4YOLvIL0K7qWHeYK_hcnpVFMTQvbYKRxm_fGzsKRz_Tv4iTJaP6R50idLqxlGx2q0RvoB4M5BVwjGx2bpzwOyzLQF8rnoJyQECw_Bv-s2vQTOw8wOCYvgUFcH7YStQbOOrPDC5Gh76U2' 
    },
    { 
      id: 4, 
      name: 'Phạm Thúy Hằng', 
      email: 'hang.pt@marketinghub.vn', 
      phone: '0933 445 566',
      joinedDate: '19/03/2024',
      totalSpent: '3,100,000đ',
      ticketsCount: 2,
      status: 'Đã khóa',
      preferredCategory: 'Kinh doanh',
      recentEvent: 'Vietnam Tech Summit 2024',
      ticketType: 'Thường',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsFLHYlqHxoVmim5G01IOaD61afrRb76l13V1oDS8WxSfQai0a9twFDb0Di8all8_3XATB9CJJmDt9FrvMrH0bzAXtESdi81hsk2uEXVNzDeX2CVOCvJubWOCbYCgb6ZDEroawuuPvzZBjkDKMXxN5LDgWX_SJxbsMSCeYzb2PDOgFsSoyzfeHJzP4kaX0rKQxj_vpzLKfXY5qOcKGZLWQv-PulDDHwzML8WbS-orT1ESwsuSb2i8uh3EMMbzOH5LRkOZGVcOcTdbZ' 
    },
    { 
      id: 5, 
      name: 'Hoàng Văn Nam', 
      email: 'nam.hv@outlook.com', 
      phone: '0911 223 344',
      joinedDate: '24/03/2024',
      totalSpent: '8,500,000đ',
      ticketsCount: 6,
      status: 'Hoạt động',
      preferredCategory: 'Âm nhạc',
      recentEvent: 'Gala Dinner: Night of Stars',
      ticketType: 'Thường',
      avatar: null 
    },
    { 
      id: 6, 
      name: 'Bùi Thị Ngọc', 
      email: 'ngoc.bt@fpt.com.vn', 
      phone: '0944 556 677',
      joinedDate: '01/04/2024',
      totalSpent: '15,600,000đ',
      ticketsCount: 9,
      status: 'Hoạt động',
      preferredCategory: 'Công nghệ',
      recentEvent: 'Hội thảo AI & Robotics',
      ticketType: 'VIP',
      avatar: null 
    },
    { 
      id: 7, 
      name: 'Vũ Minh Đức', 
      email: 'duc.vm@gmail.com', 
      phone: '0977 889 900',
      joinedDate: '15/04/2024',
      totalSpent: '2,500,000đ',
      ticketsCount: 2,
      status: 'Hoạt động',
      preferredCategory: 'Thể thao',
      recentEvent: 'Vietnam Tech Summit 2024',
      ticketType: 'Thường',
      avatar: null 
    },
    { 
      id: 8, 
      name: 'Đỗ Kim Liên', 
      email: 'lien.dk@vietcombank.com.vn', 
      phone: '0922 334 455',
      joinedDate: '22/04/2024',
      totalSpent: '24,000,000đ',
      ticketsCount: 15,
      status: 'Hoạt động',
      preferredCategory: 'Tài chính',
      recentEvent: 'Vietnam Tech Summit 2024',
      ticketType: 'VIP',
      avatar: null 
    },
    { 
      id: 9, 
      name: 'Trịnh Gia Bảo', 
      email: 'bao.tg@vinfast.vn', 
      phone: '0966 778 899',
      joinedDate: '05/05/2024',
      totalSpent: '5,800,000đ',
      ticketsCount: 4,
      status: 'Đã khóa',
      preferredCategory: 'Công nghiệp',
      recentEvent: 'Hội thảo AI & Robotics',
      ticketType: 'Thường',
      avatar: null 
    },
    { 
      id: 10, 
      name: 'Lý Thanh Hà', 
      email: 'ha.lt@shopee.vn', 
      phone: '0955 667 788',
      joinedDate: '10/05/2024',
      totalSpent: '9,200,000đ',
      ticketsCount: 7,
      status: 'Hoạt động',
      preferredCategory: 'Thời trang',
      recentEvent: 'Gala Dinner: Night of Stars',
      ticketType: 'VIP',
      avatar: null 
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả danh mục');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const itemsPerPage = 8;

  // Modal and Message States
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [guestToLock, setGuestToLock] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const stats = [
    { 
      title: 'Tổng người dùng', 
      value: '2,540', 
      subtext: 'so với tháng trước', 
      trend: 'up',
      trendValue: '+15%',
      icon: Users2, 
      iconBg: 'bg-indigo-50', 
      iconColor: 'text-indigo-500' 
    },
    { 
      title: 'Khách hàng VIP', 
      value: '380', 
      subtext: '12% hệ thống', 
      icon: Ticket, 
      iconBg: 'bg-amber-50', 
      iconColor: 'text-amber-500' 
    },
    { 
      title: 'Chi tiêu nhiều nhất', 
      value: '24,000,000đ', 
      subtext: 'Đỗ Kim Liên', 
      icon: DollarSign, 
      iconBg: 'bg-emerald-50', 
      iconColor: 'text-emerald-500' 
    },
    { 
      title: 'Đang bị khóa', 
      value: '14 tài khoản', 
      subtext: 'giảm so với tháng trước', 
      trend: 'down',
      trendValue: '-2%',
      icon: UserX, 
      iconBg: 'bg-rose-50', 
      iconColor: 'text-rose-500' 
    },
  ];

  const filters = ['Tất cả', 'VIP', 'Thường', 'Hoạt động', 'Đã khóa'];
  const categoriesList = ['Tất cả danh mục', 'Công nghệ', 'Khoa học', 'Nghệ thuật', 'Kinh doanh', 'Âm nhạc', 'Tài chính', 'Thời trang'];

  // Status Style Resolver
  const getStatusBadgeClass = (status) => {
    return status === 'Hoạt động'
      ? 'bg-emerald-50 text-emerald-600'
      : 'bg-rose-50 text-rose-600';
  };

  // Filter & Search Logic
  const filteredGuests = guests
    .filter(guest => {
      const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           guest.phone.includes(searchTerm);
      
      const matchesCategory = 
        activeFilter === 'Tất cả' ||
        (activeFilter === 'VIP' && guest.ticketType === 'VIP') ||
        (activeFilter === 'Thường' && guest.ticketType === 'Thường') ||
        (activeFilter === 'Hoạt động' && guest.status === 'Hoạt động') ||
        (activeFilter === 'Đã khóa' && guest.status === 'Đã khóa');

      const matchesPref = selectedCategory === 'Tất cả danh mục' || guest.preferredCategory === selectedCategory;

      return matchesSearch && matchesCategory && matchesPref;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.id - a.id;
      if (sortBy === 'oldest') return a.id - b.id;
      if (sortBy === 'spent') {
        const spentA = parseInt(a.totalSpent.replace(/[^0-9]/g, ''));
        const spentB = parseInt(b.totalSpent.replace(/[^0-9]/g, ''));
        return spentB - spentA;
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);
  const paginatedGuests = filteredGuests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredGuests.length);

  const handleExport = () => {
    showToast('Đang tạo báo cáo danh sách khách mời...', 'info');
    setTimeout(() => {
      const headers = ['ID', 'Họ tên', 'Email', 'Số điện thoại', 'Ngày tham gia', 'Tổng chi tiêu', 'Số vé mua', 'Trạng thái', 'Danh mục ưu thích'];
      const csvContent = [
        headers.join(','),
        ...filteredGuests.map(g => 
          [g.id, g.name, g.email, g.phone, g.joinedDate, g.totalSpent, g.ticketsCount, g.status, g.preferredCategory].join(',')
        )
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `danh_sach_nguoi_dung_he_thong_${new Date().toLocaleDateString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Đã xuất danh sách thành công!', 'success');
    }, 1000);
  };

  const handleToggleLockStatus = () => {
    const updatedStatus = guestToLock.status === 'Hoạt động' ? 'Đã khóa' : 'Hoạt động';
    setGuests(prev => prev.map(g => g.id === guestToLock.id ? { ...g, status: updatedStatus } : g));
    setIsLockModalOpen(false);
    showToast(
      updatedStatus === 'Đã khóa' 
        ? `Đã khóa thành công tài khoản của ${guestToLock.name}!`
        : `Đã mở khóa thành công tài khoản của ${guestToLock.name}!`,
      updatedStatus === 'Đã khóa' ? 'error' : 'success'
    );
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate Notification API push
    setTimeout(() => {
      setIsSubmitting(false);
      setIsMessageModalOpen(false);
      setMessageTitle('');
      setMessageBody('');
      showToast(`Đã gửi thông báo trực tiếp đến ${selectedGuest.name} thành công!`);
    }, 1200);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Quản lý Khách mời hệ thống</h1>
          <p className="text-slate-500 max-w-2xl font-medium">Giám sát, phân tích chi tiết, cập nhật trạng thái và hỗ trợ tất cả người tham dự sự kiện trên toàn bộ nền tảng.</p>
        </div>
        <div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold border-none shadow-lg shadow-primary/20 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 duration-200 cursor-pointer"
          >
            <Download className="w-5 h-5 text-white" />
            Xuất dữ liệu hệ thống (CSV)
          </button>
        </div>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              subtext={stat.subtext}
              trend={stat.trend}
              trendValue={stat.trendValue}
              icon={stat.icon}
              iconBg={stat.iconBg}
              iconColor={stat.iconColor}
            />
          </motion.div>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-50 p-6 rounded-3xl mb-6 border border-slate-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-primary/10 focus:border-primary placeholder:text-slate-400 text-sm font-medium outline-none transition-all" 
              placeholder="Tìm theo họ tên khách mời, email hoặc số điện thoại..." 
              type="text"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  setCurrentPage(1);
                }}
                className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200
                  ${activeFilter === filter 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center border
                ${showAdvancedFilters ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              <Filter className="w-5 h-5" />
            </button>

            {/* Advanced Dropdown */}
            <AnimatePresence>
              {showAdvancedFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-50 origin-top-right"
                >
                  <div className="space-y-5">
                    <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Danh mục ưa thích</label>
                      <select 
                        value={selectedCategory}
                        onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all cursor-pointer"
                      >
                        {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Sắp xếp theo</label>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: 'newest', label: 'Tham gia mới nhất' },
                          { id: 'oldest', label: 'Tham gia cũ nhất' },
                          { id: 'spent', label: 'Chi tiêu cao nhất' },
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => { setSortBy(opt.id); setCurrentPage(1); }}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                              ${sortBy === opt.id ? 'bg-primary/10 text-primary font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setSelectedCategory('Tất cả danh mục');
                        setSortBy('newest');
                        setSearchTerm('');
                        setActiveFilter('Tất cả');
                        setShowAdvancedFilters(false);
                      }}
                      className="w-full py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                    >
                      Đặt lại cấu hình lọc
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest">Họ tên & Tài khoản</th>
                <th className="px-6 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest">Liên hệ</th>
                <th className="px-6 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest">Danh mục thích</th>
                <th className="px-6 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest">Loại vé gần đây</th>
                <th className="px-6 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest">Tổng chi tiêu</th>
                <th className="px-6 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedGuests.length > 0 ? (
                paginatedGuests.map((guest) => (
                  <tr 
                    key={guest.id} 
                    className="hover:bg-slate-50/30 transition-colors group h-[81px]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-100 bg-indigo-50 flex items-center justify-center">
                          {guest.avatar ? (
                            <img alt={guest.name} className="w-full h-full object-cover" src={guest.avatar} />
                          ) : (
                            <span className="text-sm font-black text-indigo-700">{guest.name.split(' ').pop().charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{guest.name}</p>
                          <p className="text-xs text-slate-400 font-medium">Khách mời ngày {guest.joinedDate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-700 leading-none">{guest.email}</p>
                      <p className="text-[11px] text-slate-400 font-bold mt-1.5">{guest.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">{guest.preferredCategory}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black
                        ${guest.ticketType === 'VIP' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {guest.ticketType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-800">
                      {guest.totalSpent}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(guest.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${guest.status === 'Hoạt động' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {guest.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-center relative">
                      <div className="flex justify-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === guest.id ? null : guest.id);
                          }}
                          className={`w-10 h-10 flex items-center justify-center transition-all rounded-xl ${openMenuId === guest.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>

                      <AnimatePresence>
                        {openMenuId === guest.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-[10]" 
                              onClick={() => setOpenMenuId(null)}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute right-8 top-[70%] mt-2 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 py-2.5 z-[20] overflow-hidden text-left"
                            >
                              <button 
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setSelectedGuest(guest);
                                  setIsDetailModalOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4 text-slate-400" />
                                Xem chi tiết hồ sơ
                              </button>
                              <button 
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setSelectedGuest(guest);
                                  setIsMessageModalOpen(true);
                                }}
                              >
                                <MessageSquare className="w-4 h-4 text-slate-400" />
                                Gửi thông báo hệ thống
                              </button>
                              <div className="h-px bg-slate-100 my-1.5 mx-2" />
                              <button 
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors
                                  ${guest.status === 'Hoạt động' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setGuestToLock(guest);
                                  setIsLockModalOpen(true);
                                }}
                              >
                                {guest.status === 'Hoạt động' ? (
                                  <>
                                    <UserX className="w-4 h-4 text-rose-500" />
                                    Khóa tài khoản
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 text-emerald-500" />
                                    Mở khóa tài khoản
                                  </>
                                )}
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-20">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Không tìm thấy khách mời phù hợp</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between bg-slate-50/50 border-t border-slate-100">
            <p className="text-sm text-slate-500 font-medium">
              Hiển thị {startItem} - {endItem} trên {filteredGuests.length} khách mời
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-primary disabled:opacity-50 transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-black flex items-center justify-center transition-all
                    ${currentPage === i + 1 
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.05]' 
                      : 'hover:bg-slate-100 text-slate-600 font-medium'}`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-primary disabled:opacity-50 transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="fixed bottom-10 right-10 z-[300] flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl min-w-[320px] border border-slate-800"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-indigo-500'}`}>
              <span className="text-white text-xs font-black">✓</span>
            </div>
            <p className="text-sm font-black tracking-tight">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Details view */}
      <AnimatePresence>
        {isDetailModalOpen && selectedGuest && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailModalOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-100">
                    {selectedGuest.name.split(' ').pop().charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedGuest.name}</h2>
                    <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">{selectedGuest.email}</p>
                  </div>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100 shadow-sm">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-10 grid grid-cols-2 gap-5 bg-white">
                {[
                  { label: 'Số điện thoại', value: selectedGuest.phone, icon: Mail, color: 'indigo' },
                  { label: 'Ngày tham gia hệ thống', value: selectedGuest.joinedDate, icon: Calendar, color: 'emerald' },
                  { label: 'Sự kiện tham gia gần nhất', value: selectedGuest.recentEvent, icon: MapPin, color: 'rose' },
                  { label: 'Loại vé sử dụng', value: selectedGuest.ticketType, icon: Ticket, color: 'amber' },
                  { label: 'Tổng chi tiêu', value: selectedGuest.totalSpent, icon: DollarSign, color: 'emerald' },
                  { label: 'Danh mục ưa thích', value: selectedGuest.preferredCategory, icon: Filter, color: 'indigo' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className={`p-2 rounded-xl bg-${item.color}-50 text-${item.color}-600 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                      </div>
                      <p className="text-sm font-black text-slate-900 leading-snug">{item.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                <button onClick={() => setIsDetailModalOpen(false)} className="px-8 py-4 bg-white text-slate-600 font-black text-sm rounded-2xl hover:bg-slate-100 transition-all border border-slate-200 shadow-sm">Đóng cửa sổ</button>
                <button 
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setIsMessageModalOpen(true);
                  }}
                  className="px-8 py-4 bg-indigo-600 text-white font-black text-sm rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Gửi thông báo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Direct Message */}
      <AnimatePresence>
        {isMessageModalOpen && selectedGuest && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMessageModalOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSendMessage}>
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-indigo-600" />
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Gửi thông báo hệ thống</h2>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Đến khách mời: {selectedGuest.name}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsMessageModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Tiêu đề thông báo</label>
                    <input 
                      required 
                      type="text" 
                      value={messageTitle} 
                      onChange={e => setMessageTitle(e.target.value)} 
                      placeholder="Ví dụ: Cảnh báo bảo mật / Ưu đãi đặc biệt..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-5 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Nội dung chi tiết</label>
                    <textarea 
                      required 
                      rows={5} 
                      value={messageBody} 
                      onChange={e => setMessageBody(e.target.value)} 
                      placeholder="Nhập nội dung thông báo gửi trực tiếp vào hòm thư hệ thống của người dùng..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all outline-none resize-none" 
                    />
                  </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsMessageModalOpen(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all rounded-xl">Hủy</button>
                  <button 
                    disabled={isSubmitting} 
                    type="submit" 
                    className="px-8 py-3 bg-indigo-600 text-white font-black text-sm rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2"
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi thông báo ngay'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Suspend / Unlock */}
      <AnimatePresence>
        {isLockModalOpen && guestToLock && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLockModalOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 text-center"
            >
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 
                ${guestToLock.status === 'Hoạt động' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <AlertTriangle className="w-10 h-10 animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                {guestToLock.status === 'Hoạt động' ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?'}
              </h2>
              
              <p className="text-sm text-slate-500 font-bold leading-relaxed mb-8">
                {guestToLock.status === 'Hoạt động' 
                  ? `Bạn có chắc chắn muốn khóa tài khoản của ${guestToLock.name}? Người dùng này sẽ không thể đăng nhập hoặc mua vé sự kiện nữa.`
                  : `Bạn có chắc chắn muốn kích hoạt lại tài khoản của ${guestToLock.name}?`}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIsLockModalOpen(false)} className="py-4 bg-slate-100 text-slate-600 font-black text-sm rounded-2xl hover:bg-slate-200 transition-all">Hủy bỏ</button>
                <button 
                  onClick={handleToggleLockStatus} 
                  className={`py-4 text-white font-black text-sm rounded-2xl transition-all shadow-xl
                    ${guestToLock.status === 'Hoạt động' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
                >
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuestsPage;
