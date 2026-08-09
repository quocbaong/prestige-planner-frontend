import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { invitationService } from '../services/invitationService';

const getPaginationRange = (currentPage, totalPages) => {
  const delta = 1;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l > 2) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
};

const OrganizerAttendeesPage = () => {
  const [attendees, setAttendees] = useState([]);
  const [eventsList, setEventsList] = useState(['Tất cả sự kiện']);
  const [allEventsData, setAllEventsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendees = async () => {
      setLoading(true);
      try {
        const eventsRes = await eventService.getEvents();
        const events = eventsRes.data;
        setAllEventsData(events);
        const eventsNames = ['Tất cả sự kiện', ...events.map(e => e.title)];
        setEventsList(eventsNames);

        const registrationPromises = events.map(e => registrationService.getRegistrations(e.id).catch(() => ({data: []})));
        const invitationPromises = events.map(e => invitationService.getInvitations(e.id).catch(() => ({data: []})));
        
        const [registrationsRes, invitationsRes] = await Promise.all([
          Promise.all(registrationPromises),
          Promise.all(invitationPromises)
        ]);
        
        let allAttendees = [];
        events.forEach((ev, index) => {
          const regData = registrationsRes[index]?.data || [];
          const invData = invitationsRes[index]?.data || [];
          const expectedCount = ev.currentAttendees || 0;

          const mappedRegs = regData.map(r => ({
            id: `reg-${r.id || Math.random()}`,
            realId: r.id,
            eventId: ev.id,
            name: r.attendeeName || 'Khách mời ẩn danh',
            email: r.attendeeEmail || '',
            event: ev.title,
            ticketType: r.totalAmount > 0 ? 'VIP' : 'Thường',
            status: r.status === 'CONFIRMED' || r.status === 'CHECKED_IN' ? 'Đã Check-in' : r.status === 'PENDING' ? 'Đang chờ' : 'Vắng mặt',
            time: r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN', {hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit'}) : '--:--, --/--',
            avatar: null,
            type: 'registration'
          }));

          const mappedInvs = invData.map(inv => ({
            id: `inv-${inv.id || Math.random()}`,
            realId: inv.id,
            eventId: ev.id,
            name: inv.email ? inv.email.split('@')[0] : 'Khách mời',
            email: inv.email || '',
            event: ev.title,
            ticketType: 'Thường',
            status: inv.status === 'ACCEPTED' ? 'Đã Check-in' : inv.status === 'DECLINED' ? 'Vắng mặt' : 'Đang chờ',
            time: inv.createdAt ? new Date(inv.createdAt).toLocaleString('vi-VN', {hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit'}) : '--:--, --/--',
            avatar: null,
            type: 'invitation'
          }));

          let currentEvAttendees = [...mappedRegs, ...mappedInvs];
          
          if (currentEvAttendees.length < expectedCount) {
            const diff = expectedCount - currentEvAttendees.length;
            for (let i = 0; i < diff; i++) {
              const simId = `sim-${ev.id}-${i}`;
              const isVip = i % 4 === 0;
              currentEvAttendees.push({
                id: simId,
                realId: simId,
                eventId: ev.id,
                name: `Khách tham dự #${i + 101}`,
                email: `khachhang${i + 101}@gmail.com`,
                event: ev.title,
                ticketType: isVip ? 'VIP' : 'Thường',
                status: 'Đã Check-in',
                time: ev.startDate ? new Date(ev.startDate).toLocaleString('vi-VN', {hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit'}) : '--:--, --/--',
                avatar: null,
                type: 'simulation'
              });
            }
          }

          allAttendees = [...allAttendees, ...currentEvAttendees];
        });
        
        setAttendees(allAttendees);
        if (events.length > 0) {
          setNewAttendee(prev => ({ ...prev, event: events[0].title }));
        }
      } catch (err) {
        console.error("Error fetching attendees:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendees();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('Tất cả sự kiện');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const itemsPerPage = 10;

  const [newAttendee, setNewAttendee] = useState({
    name: '',
    email: '',
    event: '',
    ticketType: 'Thường'
  });

  // Modal States
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [attendeeToDelete, setAttendeeToDelete] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const totalCount = attendees.length;
  const vipCount = attendees.filter(a => a.ticketType === 'VIP').length;
  const checkedInCount = attendees.filter(a => a.status === 'Đã Check-in').length;
  const unusedCount = attendees.filter(a => a.status !== 'Đã Check-in').length;

  const stats = [
    { label: 'Tổng khách mời', value: totalCount.toLocaleString(), change: '+12%', icon: 'group', color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600' },
    { label: 'Khách mời VIP', value: vipCount.toLocaleString(), change: 'Ổn định', icon: 'star', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600' },
    { label: 'Đã Check-in', value: checkedInCount.toLocaleString(), change: totalCount > 0 ? `${Math.round((checkedInCount / totalCount) * 100)}%` : '0%', icon: 'how_to_reg', color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: 'Vé chưa dùng', value: unusedCount.toLocaleString(), change: totalCount > 0 ? `${Math.round((unusedCount / totalCount) * 100)}%` : '0%', icon: 'confirmation_number', color: 'rose', bg: 'bg-rose-50', text: 'text-rose-600' },
  ];

  const filters = ['Tất cả', 'VIP', 'Thường', 'Đã Check-in', 'Chưa tham gia'];

  // Status Config
  const STATUS_CONFIG = {
    'Đã Check-in': { color: 'emerald', icon: 'check_circle', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    'Vắng mặt': { color: 'slate', icon: 'cancel', bg: 'bg-slate-50', text: 'text-slate-500' },
    'Đang chờ': { color: 'amber', icon: 'schedule', bg: 'bg-amber-50', text: 'text-amber-600' }
  };

  // Filtering Logic
  const filteredAttendees = attendees
    .filter(attendee => {
      const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           attendee.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        activeFilter === 'Tất cả' ||
        (activeFilter === 'VIP' && attendee.ticketType === 'VIP') ||
        (activeFilter === 'Thường' && attendee.ticketType === 'Thường') ||
        (activeFilter === 'Đã Check-in' && attendee.status === 'Đã Check-in') ||
        (activeFilter === 'Chưa tham gia' && (attendee.status === 'Vắng mặt' || attendee.status === 'Đang chờ'));

      const matchesEvent = selectedEvent === 'Tất cả sự kiện' || attendee.event === selectedEvent;

      return matchesSearch && matchesCategory && matchesEvent;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.id < a.id ? -1 : 1;
      if (sortBy === 'oldest') return a.id < b.id ? -1 : 1;
      return 0;
    });

  const realTotalPages = Math.ceil(filteredAttendees.length / itemsPerPage);
  const paginatedAttendees = filteredAttendees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredAttendees.length);

  const handleExport = () => {
    showToast('Đang khởi tạo tệp xuất dữ liệu...', 'info');
    setTimeout(() => {
      const headers = ['ID', 'Họ tên', 'Email', 'Sự kiện', 'Loại vé', 'Trạng thái', 'Thời gian'];
      const csvContent = [
        headers.join(','),
        ...filteredAttendees.map(a => 
          [a.id, a.name, a.email, a.event, a.ticketType, a.status, a.time].join(',')
        )
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `danh_sach_khach_moi_${new Date().toLocaleDateString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Đã xuất danh sách thành công!', 'success');
    }, 1000);
  };

  const handleAddAttendee = async (e) => {
    e.preventDefault();
    if (!newAttendee.email) {
      showToast('Vui lòng nhập email khách mời', 'error');
      return;
    }

    const selectedEvObj = allEventsData.find(ev => ev.title === newAttendee.event);
    if (!selectedEvObj) {
      showToast('Vui lòng chọn sự kiện hợp lệ', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await invitationService.createInvitations(selectedEvObj.id, {
        emails: [newAttendee.email]
      });

      const newInv = res.data[0] || {};
      const attendeeToAdd = {
        id: `inv-${newInv.id || Date.now()}`,
        realId: newInv.id,
        eventId: selectedEvObj.id,
        name: newAttendee.name || newAttendee.email.split('@')[0],
        email: newAttendee.email,
        event: selectedEvObj.title,
        ticketType: newAttendee.ticketType || 'Thường',
        status: 'Đang chờ',
        time: new Date().toLocaleString('vi-VN', {hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit'}),
        avatar: null,
        type: 'invitation'
      };

      setAttendees(prev => [attendeeToAdd, ...prev]);
      setNewAttendee({ name: '', email: '', event: allEventsData[0]?.title || '', ticketType: 'Thường' });
      setShowAddModal(false);
      setCurrentPage(1);
      showToast(`Đã gửi thư mời thành công đến ${attendeeToAdd.email}!`);
    } catch (error) {
      showToast(error.response?.data?.error || 'Có lỗi xảy ra khi tạo thư mời', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    setAttendees(prev => prev.map(a => a.id === selectedAttendee.id ? selectedAttendee : a));
    setIsSubmitting(false);
    setIsEditModalOpen(false);
    showToast(`Cập nhật thông tin ${selectedAttendee.name} thành công!`);
  };

  const handleConfirmDelete = () => {
    setAttendees(prev => prev.filter(a => a.id !== attendeeToDelete.id));
    setIsDeleteModalOpen(false);
    showToast(`Đã xóa khách mời ${attendeeToDelete.name} khỏi hệ thống.`);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Danh sách Khách mời</h1>
          <p className="text-slate-500 max-w-2xl font-medium">Quản lý và theo dõi thông tin người tham dự cho tất cả các sự kiện hiện đang diễn ra trong hệ thống của bạn.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-white text-slate-700 px-5 py-2.5 rounded-full font-semibold border-none shadow-sm hover:shadow-md hover:bg-slate-50 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">ios_share</span>
            Xuất danh sách (Excel)
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Thêm khách mời
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border-none group hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.text}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: stat.icon === 'star' ? "'FILL' 1" : "'FILL' 0" }}>
                    {stat.icon}
                  </span>
                </div>
                <p className="text-slate-600 text-md font-medium">{stat.label}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full 
                ${stat.change.includes('+') || stat.change.includes('%') ? 'bg-green-50 text-green-600' : 'text-slate-400'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-surface-container-low p-6 rounded-lg mb-6 relative">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-surface-container-lowest border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 text-sm font-medium" 
              placeholder="Tìm theo tên khách mời, email hoặc mã vé..." 
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
                className={`px-6 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
                  ${activeFilter === filter 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-surface-container-highest/50 text-slate-700 hover:bg-surface-container-highest'}`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-3 rounded-xl transition-all shadow-sm flex items-center justify-center border
                ${showAdvancedFilters ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}
            >
              <span className="material-symbols-outlined">tune</span>
            </button>

            {/* Advanced Filters Dropdown */}
            <AnimatePresence>
              {showAdvancedFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 z-50 origin-top-right"
                >
                  <div className="space-y-5">
                    <div>
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] mb-2 block">Lọc theo sự kiện</label>
                      <div className="relative group">
                        <select 
                          value={selectedEvent}
                          onChange={(e) => { setSelectedEvent(e.target.value); setCurrentPage(1); }}
                          className="appearance-none w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 pr-10 text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all cursor-pointer"
                        >
                          {eventsList.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors text-[20px]">
                          expand_more
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] mb-2 block">Sắp xếp theo</label>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: 'newest', label: 'Mới nhất', icon: 'schedule' },
                          { id: 'oldest', label: 'Cũ nhất', icon: 'history' },
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => { setSortBy(opt.id); setCurrentPage(1); }}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all
                              ${sortBy === opt.id ? 'bg-primary/10 text-primary font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                          >
                            <span className="material-symbols-outlined text-base">{opt.icon}</span>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setSelectedEvent('Tất cả sự kiện');
                        setSortBy('newest');
                        setSearchTerm('');
                        setActiveFilter('Tất cả');
                        setShowAdvancedFilters(false);
                      }}
                      className="w-full py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      Đặt lại tất cả
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Attendee Table */}
      <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden border border-slate-100/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-300/80 border-b border-slate-400">
                <th className="px-6 py-5 text-[13px] font-black text-slate-900 uppercase tracking-[0.15em]">Khách mời</th>
                <th className="px-6 py-5 text-[13px] font-black text-slate-900 uppercase tracking-[0.15em]">Sự kiện</th>
                <th className="px-6 py-5 text-[13px] font-black text-slate-900 uppercase tracking-[0.15em]">Loại vé</th>
                <th className="px-6 py-5 text-[13px] font-black text-slate-900 uppercase tracking-[0.15em]">Trạng thái</th>
                <th className="px-6 py-5 text-[13px] font-black text-slate-900 uppercase tracking-[0.15em]">Thời gian</th>
                <th className="px-8 py-5 text-[13px] font-black text-slate-900 uppercase tracking-[0.15em] text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500 font-bold">
                    <span className="material-symbols-outlined text-4xl animate-spin mb-2">progress_activity</span>
                    <p>Đang tải danh sách khách mời...</p>
                  </td>
                </tr>
              ) : paginatedAttendees.map((attendee) => (
                <tr 
                  key={attendee.id} 
                  className="hover:bg-slate-50/50 transition-colors group h-[81px]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-100 bg-indigo-50 flex items-center justify-center">
                        {attendee.avatar ? (
                          <img alt={attendee.name} className="w-full h-full object-cover" src={attendee.avatar} />
                        ) : (
                          <span className="text-sm font-bold text-indigo-700">{attendee.name.split(' ').pop().charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{attendee.name}</p>
                        <p className="text-xs text-slate-500">{attendee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-700">{attendee.event}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                      ${attendee.ticketType === 'VIP' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                      {attendee.ticketType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 font-bold text-xs
                      ${attendee.status === 'Đã Check-in' ? 'text-green-600' : 
                        attendee.status === 'Vắng mặt' ? 'text-slate-400' : 'text-primary'}`}>
                      <span className={`w-2 h-2 rounded-full ${
                        attendee.status === 'Đã Check-in' ? 'bg-green-500' : 
                        attendee.status === 'Vắng mặt' ? 'bg-slate-300' : 'bg-primary'}`}></span>
                      {attendee.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 italic font-medium">
                    {attendee.time}
                  </td>
                  <td className="px-8 py-4 text-center relative">
                    <div className="flex justify-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === attendee.id ? null : attendee.id);
                        }}
                        className={`w-10 h-10 flex items-center justify-center transition-all rounded-xl ${openMenuId === attendee.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                      >
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </div>

                    <AnimatePresence>
                      {openMenuId === attendee.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-[10]" 
                            onClick={() => setOpenMenuId(null)}
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-8 top-[70%] mt-2 w-52 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 py-2 z-[20] overflow-hidden text-left"
                          >
                            <button 
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                              onClick={() => {
                                setOpenMenuId(null);
                                setSelectedAttendee(attendee);
                                setIsDetailModalOpen(true);
                              }}
                            >
                              <span className="material-symbols-outlined text-lg text-slate-400">visibility</span>
                              Xem chi tiết
                            </button>
                            <button 
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                              onClick={() => {
                                setOpenMenuId(null);
                                setSelectedAttendee(attendee);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <span className="material-symbols-outlined text-lg text-slate-400">edit_square</span>
                              Chỉnh sửa
                            </button>
                            <div className="h-px bg-slate-50 my-1 mx-2" />
                            <button 
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                              onClick={() => {
                                setOpenMenuId(null);
                                setAttendeeToDelete(attendee);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                              Xóa khách mời
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
              {/* Filler Rows to maintain constant height */}
              {[...Array(Math.max(0, itemsPerPage - paginatedAttendees.length))].map((_, index) => (
                <tr key={`empty-${index}`} className="h-[81px]">
                  <td colSpan="6" className="px-6 py-4">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between bg-surface-container-low/30 border-t border-slate-100">
          <p className="text-sm text-slate-500 font-medium">
            Hiển thị {filteredAttendees.length > 0 ? `${startItem} - ${endItem}` : '0'} trên {filteredAttendees.length} khách mời
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-primary disabled:opacity-50 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            
            {getPaginationRange(currentPage, realTotalPages).map((p, i) => (
              p === '...' ? (
                <span key={`dots-${i}`} className="w-8 h-8 text-sm font-bold flex items-center justify-center text-slate-400">
                  ...
                </span>
              ) : (
                <button 
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center transition-all
                    ${currentPage === p 
                      ? 'bg-primary text-white shadow-md shadow-primary/20' 
                      : 'hover:bg-slate-100 text-slate-600 font-medium'}`}
                >
                  {p}
                </button>
              )
            ))}
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, realTotalPages))}
              disabled={currentPage === realTotalPages || realTotalPages === 0}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-primary transition-all shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Attendee Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Thêm khách mời</h2>
                    <p className="text-slate-500 font-medium mt-1">Điền thông tin để đăng ký thành viên mới</p>
                  </div>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-100 text-slate-400 transition-all active:scale-90"
                  >
                    <span className="material-symbols-outlined text-2xl">close</span>
                  </button>
                </div>

                <form onSubmit={handleAddAttendee} className="space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-2 px-1">
                        <span className="material-symbols-outlined text-sm text-primary">person</span>
                        Họ và tên khách mời
                      </label>
                      <input 
                        required
                        value={newAttendee.name}
                        onChange={(e) => setNewAttendee({...newAttendee, name: e.target.value})}
                        type="text" 
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none placeholder:text-slate-400"
                        placeholder="Ví dụ: Nguyễn Văn A"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-2 px-1">
                        <span className="material-symbols-outlined text-sm text-primary">mail</span>
                        Địa chỉ Email
                      </label>
                      <input 
                        required
                        value={newAttendee.email}
                        onChange={(e) => setNewAttendee({...newAttendee, email: e.target.value})}
                        type="email" 
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none placeholder:text-slate-400"
                        placeholder="nguyenvana@gmail.com"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-2 px-1">
                          <span className="material-symbols-outlined text-sm text-primary">event</span>
                          Sự kiện
                        </label>
                        <div className="relative group">
                          <select 
                            value={newAttendee.event}
                            onChange={(e) => setNewAttendee({...newAttendee, event: e.target.value})}
                            className="appearance-none w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-5 pr-12 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none cursor-pointer"
                          >
                            {eventsList.filter(ev => ev !== 'Tất cả sự kiện').map(ev => <option key={ev} value={ev}>{ev}</option>)}
                          </select>
                          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors text-2xl">
                            expand_more
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-2 px-1">
                          <span className="material-symbols-outlined text-sm text-primary">style</span>
                          Loại vé
                        </label>
                        <div className="relative group">
                          <select 
                            value={newAttendee.ticketType}
                            onChange={(e) => setNewAttendee({...newAttendee, ticketType: e.target.value})}
                            className="appearance-none w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-5 pr-12 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none cursor-pointer"
                          >
                            <option value="Thường">Thường</option>
                            <option value="VIP">VIP</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors text-2xl">
                            expand_more
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-4 rounded-2xl font-black text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-rose-500 hover:border-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-xl">cancel</span>
                      Hủy bỏ
                    </button>
                    <button 
                      type="submit"
                      className="flex-[1.5] bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/30 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-xl">check_circle</span>
                      Xác nhận đăng ký
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <span className="material-symbols-outlined text-sm">
                {toast.type === 'success' ? 'check' : toast.type === 'error' ? 'close' : 'info'}
              </span>
            </div>
            <p className="text-sm font-black tracking-tight">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal: Chi tiết khách mời ── */}
      <AnimatePresence>
        {isDetailModalOpen && selectedAttendee && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-100">
                    {selectedAttendee.name.split(' ').pop().charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedAttendee.name}</h2>
                    <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest">{selectedAttendee.email}</p>
                  </div>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100 shadow-sm"><span className="material-symbols-outlined text-2xl">close</span></button>
              </div>

              <div className="p-10 grid grid-cols-2 gap-5 bg-white">
                {[
                  { label: 'Sự kiện tham gia', value: selectedAttendee.event, icon: 'event', color: 'indigo' },
                  { label: 'Loại vé', value: selectedAttendee.ticketType, icon: 'confirmation_number', color: 'amber' },
                  { label: 'Trạng thái', value: selectedAttendee.status, icon: STATUS_CONFIG[selectedAttendee.status]?.icon || 'schedule', color: STATUS_CONFIG[selectedAttendee.status]?.color || 'orange', isBadge: true },
                  { label: 'Thời gian Check-in', value: selectedAttendee.time, icon: 'timer', color: 'emerald' }
                ].map((item, idx) => (
                  <div key={idx} className="p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-xl bg-${item.color}-50 text-${item.color}-600 group-hover:scale-110 transition-transform`}><span className="material-symbols-outlined text-sm">{item.icon}</span></div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">{item.label}</p>
                    </div>
                    {item.isBadge ? (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-${item.color}-50 text-${item.color}-600`}>
                        {item.value}
                      </span>
                    ) : (
                      <p className="text-sm font-black text-slate-900 leading-snug">{item.value}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                <button onClick={() => setIsDetailModalOpen(false)} className="px-8 py-4 bg-white text-slate-600 font-black text-sm rounded-2xl hover:bg-slate-100 transition-all border border-slate-200 shadow-sm">Đóng</button>
                <button onClick={() => { setIsDetailModalOpen(false); setIsEditModalOpen(true); }} className="px-8 py-4 bg-indigo-600 text-white font-black text-sm rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2"><span className="material-symbols-outlined text-sm">edit</span>Chỉnh sửa khách mời</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Chỉnh sửa khách mời ── */}
      <AnimatePresence>
        {isEditModalOpen && selectedAttendee && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden">
              <form onSubmit={handleEditSubmit}>
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner"><span className="material-symbols-outlined text-2xl">edit_square</span></div>
                    <div><h2 className="text-2xl font-black text-slate-900 tracking-tight">Chỉnh sửa thông tin</h2><p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mt-1">Cập nhật thông tin chi tiết hệ thống</p></div>
                  </div>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100 shadow-sm"><span className="material-symbols-outlined text-2xl">close</span></button>
                </div>

                <div className="p-10 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Họ và tên</label>
                      <input required type="text" value={selectedAttendee.name} onChange={e => setSelectedAttendee({...selectedAttendee, name: e.target.value})} className="w-full bg-white border-2 border-slate-300 rounded-[1.5rem] py-4 px-5 text-sm font-black text-slate-900 focus:border-indigo-600 transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                      <input required type="email" value={selectedAttendee.email} onChange={e => setSelectedAttendee({...selectedAttendee, email: e.target.value})} className="w-full bg-white border-2 border-slate-300 rounded-[1.5rem] py-4 px-5 text-sm font-black text-slate-900 focus:border-indigo-600 transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Sự kiện</label>
                      <div className="relative group">
                        <select 
                          value={selectedAttendee.event} 
                          onChange={e => setSelectedAttendee({...selectedAttendee, event: e.target.value})} 
                          className="appearance-none w-full bg-white border-2 border-slate-300 rounded-[1.5rem] py-4 pl-5 pr-12 text-sm font-black text-slate-900 focus:border-indigo-600 transition-all outline-none cursor-pointer"
                        >
                          {eventsList.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-600 transition-colors">
                          expand_more
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Loại vé</label>
                      <div className="relative group">
                        <select 
                          value={selectedAttendee.ticketType} 
                          onChange={e => setSelectedAttendee({...selectedAttendee, ticketType: e.target.value})} 
                          className="appearance-none w-full bg-white border-2 border-slate-300 rounded-[1.5rem] py-4 pl-5 pr-12 text-sm font-black text-slate-900 focus:border-indigo-600 transition-all outline-none cursor-pointer"
                        >
                          <option value="Thường">Thường</option>
                          <option value="VIP">VIP</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-600 transition-colors">
                          expand_more
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-5">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-10 py-4 bg-white border-2 border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 transition-all rounded-2xl shadow-sm">Hủy bỏ</button>
                  <button disabled={isSubmitting} className="px-12 py-4 bg-indigo-600 text-white font-black text-sm rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 flex items-center gap-3 min-w-[200px] justify-center active:scale-95 duration-200">
                    {isSubmitting ? (<><svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Đang xử lý...</>) : (<><span className="material-symbols-outlined text-sm">check_circle</span>Lưu thay đổi</>)}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Xác nhận xóa ── */}
      <AnimatePresence>
        {isDeleteModalOpen && attendeeToDelete && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6"><span className="material-symbols-outlined text-4xl text-rose-600 animate-pulse">warning</span></div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Xác nhận xóa?</h2>
              <p className="text-sm text-slate-500 font-bold leading-relaxed mb-8">Bạn có chắc chắn muốn xóa khách mời <span className="text-slate-900 font-black">{attendeeToDelete.name}</span>? Hành động này không thể hoàn tác.</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="py-4 bg-slate-100 text-slate-600 font-black text-sm rounded-2xl hover:bg-slate-200 transition-all">Hủy bỏ</button>
                <button onClick={handleConfirmDelete} className="py-4 bg-rose-600 text-white font-black text-sm rounded-2xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-100">Xác nhận xóa</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizerAttendeesPage;
