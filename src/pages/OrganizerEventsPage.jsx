import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { eventService } from '../services/eventService';
import { ticketTypeService } from '../services/ticketTypeService';

const STATUS_MAP = {
  DRAFT: { label: 'Draft', color: 'slate', pulse: false },
  PUBLISHED: { label: 'Live', color: 'emerald', pulse: true },
  ON_SALE: { label: 'Live', color: 'emerald', pulse: true },
  SOLD_OUT: { label: 'Sold Out', color: 'amber', pulse: false },
  ONGOING: { label: 'Ongoing', color: 'emerald', pulse: true },
  COMPLETED: { label: 'Completed', color: 'indigo', pulse: false },
  CANCELLED: { label: 'Cancelled', color: 'rose', pulse: false },
};

const STATUS_FILTERS = ['All', 'DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED'];

const STATUS_LABELS = {
  All: 'Tất cả trạng thái',
  DRAFT: 'Draft',
  PUBLISHED: 'Live',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const toLocalISOString = (dateObj) => {
  if (!dateObj) return '';
  const d = new Date(dateObj);
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().slice(0, 16);
};

const mapEventFromApi = (event) => {
  const statusInfo = STATUS_MAP[event.status] || { label: event.status, color: 'slate', pulse: false };
  const location = [event.venue, event.address, event.city].filter(Boolean).join(', ');
  const date = event.startDate ? new Date(event.startDate) : null;
  const attendance = event.maxAttendees
    ? `${event.currentAttendees || 0} / ${event.maxAttendees}`
    : `${event.currentAttendees || 0}`;

  return {
    id: event.id,
    name: event.title,
    slug: event.slug,
    location,
    date: date ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}` : '--',
    dateObj: date,
    status: statusInfo.label,
    rawStatus: event.status,
    statusColor: statusInfo.color,
    statusPulse: statusInfo.pulse,
    isApproved: event.isApproved,
    isPendingApproval: event.isPendingApproval,
    isSalesActive: event.isSalesActive,
    attendance,
    currentAttendees: event.currentAttendees || 0,
    maxAttendees: event.maxAttendees,
    rawRevenue: event.revenue || 0,
    revenue: event.revenue !== undefined && event.revenue !== null
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(event.revenue)
      : '—',
    image: event.bannerUrl || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=400',
    attendees: [],
    description: event.description,
    shortDesc: event.shortDesc,
    category: event.category,
    venue: event.venue,
    address: event.address,
    city: event.city,
    latitude: event.latitude,
    longitude: event.longitude,
    startDate: event.startDate,
    endDate: event.endDate,
    registrationDeadline: event.registrationDeadline,
    tags: event.tags,
    thumbnailUrl: event.thumbnailUrl,
    bannerUrl: event.bannerUrl,
    ticketTypes: event.ticketTypes,
    publishedAt: event.publishedAt,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
};

const OrganizerEventsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState('Mới nhất');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await eventService.getEvents();
      setEvents(res.data.map(mapEventFromApi));
    } catch (err) {
      showNotification('Không thể tải danh sách sự kiện', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const [notification, setNotification] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, event: null });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [setupTicketsLoading, setSetupTicketsLoading] = useState(false);
  const [newTicket, setNewTicket] = useState({
    name: '',
    price: '',
    totalQuantity: '',
    maxPerOrder: 5,
  });

  const [createForm, setCreateForm] = useState({
    title: '', description: '', shortDesc: '', venue: '', address: '', city: '',
    startDate: '', endDate: '', bannerUrl: '', maxAttendees: '', category: 'OTHER',
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const stats = [
    {
      label: 'Sự kiện đang chạy',
      value: events.filter(e => e.status === 'Live' || e.status === 'Ongoing').length.toString(),
      change: '—', icon: 'event_available', color: 'indigo', bg: 'bg-indigo-50', text: 'text-primary',
    },
    {
      label: 'Tổng khách mời',
      value: events.reduce((sum, e) => sum + e.currentAttendees, 0).toLocaleString(),
      change: '—', icon: 'group', color: 'purple', bg: 'bg-purple-50', text: 'text-secondary',
    },
    {
      label: 'Doanh thu dự kiến',
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
        events.reduce((sum, e) => sum + (e.rawRevenue || 0), 0)
      ),
      change: '—', icon: 'payments', color: 'amber', bg: 'bg-amber-50', text: 'text-tertiary',
    },
  ];

  const [isDateOpen, setIsDateOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('Tất cả thời gian');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const handleCreate = () => {
    setCreateForm({
      title: '', description: '', shortDesc: '', venue: '', address: '', city: '',
      startDate: '', endDate: '', bannerUrl: '', maxAttendees: '', category: 'OTHER',
    });
    setModalConfig({ isOpen: true, type: 'create', event: null });
  };

  const handleEdit = (event) => {
    setModalConfig({ isOpen: true, type: 'edit', event });
  };

  const handleDelete = (event) => {
    setModalConfig({ isOpen: true, type: 'delete', event });
  };

  const generateAiAdvice = (event, sellThroughRate, totalSold, totalCapacity) => {
    if (!event || !event.ticketTypes || event.ticketTypes.length === 0) {
      return {
        title: "💡 Khởi tạo hạng vé để bắt đầu phân tích",
        text: "Sự kiện hiện chưa được thiết lập hạng vé mở bán. Hãy vào mục chỉnh sửa để thêm các hạng vé và giá bán, AI sẽ tự động phân tích cơ cấu doanh thu và đưa ra giải pháp tiếp thị tối ưu nhất cho bạn."
      };
    }

    let best = event.ticketTypes[0];
    let slowest = event.ticketTypes[0];
    event.ticketTypes.forEach(tt => {
      const pct = tt.totalQuantity > 0 ? (tt.soldQuantity / tt.totalQuantity) : 0;
      const bestPct = best.totalQuantity > 0 ? (best.soldQuantity / best.totalQuantity) : 0;
      const slowestPct = slowest.totalQuantity > 0 ? (slowest.soldQuantity / slowest.totalQuantity) : 0;
      if (pct > bestPct) best = tt;
      if (pct < slowestPct) slowest = tt;
    });

    const bestPct = best.totalQuantity > 0 ? Math.round((best.soldQuantity / best.totalQuantity) * 100) : 0;
    const slowestPct = slowest.totalQuantity > 0 ? Math.round((slowest.soldQuantity / slowest.totalQuantity) * 100) : 0;

    let daysLeft = 0;
    if (event.startDate) {
      const start = new Date(event.startDate);
      const now = new Date();
      const diffTime = start - now;
      daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const daysLeftText = daysLeft > 0 ? `Chỉ còn ${daysLeft} ngày` : 'Sự kiện đã diễn ra';

    if (sellThroughRate >= 80) {
      return {
        title: "🔥 Đạt hiệu suất bán vé cao (AI Copilot Advice)",
        text: `Chào nhà tổ chức! AI Copilot nhận thấy sự kiện "${event.name}" đang có sức hút cực kỳ bùng nổ với tỷ lệ lấp đầy tổng thể đạt ${sellThroughRate}%. Hạng vé "${best.name}" là điểm sáng lớn nhất khi đạt tỷ lệ lấp đầy ${bestPct}%. Với thời gian ${daysLeftText.toLowerCase()}, nhu cầu tham dự đang ở mức đỉnh điểm.\n\n👉 Đề xuất chiến lược từ AI:\n1. Cân nhắc bổ sung thêm 5-10% số lượng vé cho hạng vé "${best.name}" nếu điều kiện địa điểm cho phép.\n2. Gửi ngay Email hướng dẫn check-in và sơ đồ vị trí cho ${totalSold} khách tham dự để đảm bảo khâu vận hành diễn ra mượt mà nhất.`
      };
    } else if (sellThroughRate >= 40) {
      return {
        title: "📈 Tốc độ bán vé ổn định (AI Copilot Advice)",
        text: `Chào nhà tổ chức! AI Copilot nhận thấy sự kiện "${event.name}" đang duy trì nhịp độ bán vé khá ổn định ở mức ${sellThroughRate}%. Trong đó, hạng vé "${best.name}" đang dẫn đầu doanh thu với tỷ lệ lấp đầy ${bestPct}%. Tuy nhiên, hạng vé "${slowest.name}" đang bán khá chậm (chỉ đạt ${slowestPct}%).\n\n👉 Đề xuất chiến lược từ AI:\n1. Tạo chiến dịch Email Marketing gửi riêng cho nhóm khách hàng quan tâm sự kiện với ưu đãi giảm giá 10% độc quyền cho hạng vé "${slowest.name}".\n2. Cập nhật banner sự kiện và thêm thông báo "Chỉ còn ${totalCapacity - totalSold} vé cuối cùng" để tạo tâm lý khan hiếm (FOMO) kích thích người mua hành động.`
      };
    } else {
      return {
        title: "💡 Đề xuất đẩy mạnh truyền thông (AI Copilot Advice)",
        text: `Chào nhà tổ chức! Phân tích của AI Copilot cho thấy sự kiện "${event.name}" đang gặp khó khăn trong việc tiếp cận khách hàng khi tỷ lệ lấp đầy mới đạt ${sellThroughRate}%. Hạng vé "${slowest.name}" có tỷ lệ bán vé rất thấp (${slowestPct}%).\n\n👉 Đề xuất chiến lược từ AI:\n1. Áp dụng ngay chương trình Flash Sale "Mua 2 Tặng 1" hoặc giảm giá 15% giới hạn trong 24h đối với hạng vé "${slowest.name}".\n2. Đẩy mạnh tiếp cận bằng cách chia sẻ nội dung giới thiệu diễn giả/hoạt động nổi bật của sự kiện lên các hội nhóm cộng đồng liên quan đến lĩnh vực của sự kiện.`
      };
    }
  };

  const handleAnalytics = async (event) => {
    setModalConfig({ isOpen: true, type: 'analytics', event });
    setLoadingAnalytics(true);
    setLoadingAi(true);
    try {
      const res = await eventService.getEvent(event.id);
      setModalConfig(prev => ({
        ...prev,
        event: {
          ...prev.event,
          ticketTypes: res.data.ticketTypes || [],
        }
      }));
      setTimeout(() => {
        setLoadingAi(false);
      }, 1200);
    } catch (err) {
      showNotification('Không thể tải thông tin chi tiết phân tích', 'error');
      setLoadingAi(false);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handlePublish = async (event) => {
    setSetupTicketsLoading(true);
    setModalConfig({ isOpen: true, type: 'setup_tickets', event });
    try {
      const res = await ticketTypeService.getTicketTypes(event.id);
      setTicketTypes(res.data || []);
    } catch (err) {
      showNotification('Không thể lấy danh sách loại vé', 'error');
    } finally {
      setSetupTicketsLoading(false);
    }
  };

  const handleAddTicketType = async (e) => {
    e.preventDefault();
    if (!newTicket.name.trim()) {
      showNotification('Vui lòng nhập tên loại vé', 'error');
      return;
    }
    if (!newTicket.totalQuantity || parseInt(newTicket.totalQuantity) <= 0) {
      showNotification('Số lượng vé phải lớn hơn 0', 'error');
      return;
    }

    try {
      const payload = {
        name: newTicket.name,
        price: newTicket.price ? parseFloat(newTicket.price) : 0,
        totalQuantity: parseInt(newTicket.totalQuantity),
        maxPerOrder: parseInt(newTicket.maxPerOrder || 5),
      };
      
      const res = await ticketTypeService.createTicketType(modalConfig.event.id, payload);
      setTicketTypes(prev => [...prev, res.data]);
      setNewTicket({ name: '', price: '', totalQuantity: '', maxPerOrder: 5 });
      showNotification('Đã thêm loại vé thành công', 'success');
    } catch (err) {
      const msg = err.response?.data?.error || 'Không thể tạo loại vé';
      showNotification(msg, 'error');
    }
  };

  const handleDeleteTicketType = async (ticketId) => {
    try {
      await ticketTypeService.deleteTicketType(modalConfig.event.id, ticketId);
      setTicketTypes(prev => prev.filter(tt => tt.id !== ticketId));
      showNotification('Đã xóa loại vé thành công', 'success');
    } catch (err) {
      const msg = err.response?.data?.error || 'Không thể xóa loại vé';
      showNotification(msg, 'error');
    }
  };

  const handleConfirmPublish = async () => {
    if (ticketTypes.length === 0) {
      showNotification('Vui lòng thêm ít nhất một loại vé để mở bán', 'error');
      return;
    }

    try {
      const res = await eventService.publishEvent(modalConfig.event.id, {});
      setEvents(prev => prev.map(ev => ev.id === modalConfig.event.id ? mapEventFromApi(res.data) : ev));
      showNotification(`Đã xuất bản sự kiện: ${modalConfig.event.name}`, 'success');
      closeModal();
    } catch (err) {
      const msg = err.response?.data?.error || 'Không thể mở bán vé';
      showNotification(msg, 'error');
    }
  };

  const handleSubmitApproval = async (event) => {
    try {
      const res = await eventService.submitApproval(event.id);
      setEvents(prev => prev.map(ev => ev.id === event.id ? mapEventFromApi(res.data) : ev));
      showNotification(`Đã gửi yêu cầu phê duyệt cho sự kiện: ${event.name}`, 'success');
    } catch (err) {
      const msg = err.response?.data?.error || 'Không thể gửi yêu cầu phê duyệt';
      showNotification(msg, 'error');
    }
  };

  const closeModal = () => setModalConfig({ isOpen: false, type: null, event: null });

  const confirmDelete = async () => {
    const { event } = modalConfig;
    try {
      await eventService.deleteEvent(event.id);
      setEvents(prev => prev.filter(ev => ev.id !== event.id));
      showNotification(`Đã xóa sự kiện: ${event.name}`, 'success');
    } catch (err) {
      const msg = err.response?.data?.error || 'Không thể xóa sự kiện';
      showNotification(msg, 'error');
    }
    closeModal();
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const event = modalConfig.event;
    try {
      const payload = {};
      const title = form.title?.value;
      if (title) payload.title = title;
      const description = form.description?.value;
      if (description) payload.description = description;
      const shortDesc = form.shortDesc?.value;
      if (shortDesc) payload.shortDesc = shortDesc;
      const category = form.category?.value;
      if (category) payload.category = category;
      const venue = form.venue?.value;
      if (venue) payload.venue = venue;
      const address = form.address?.value;
      if (address) payload.address = address;
      const city = form.city?.value;
      if (city) payload.city = city;
      if (form.startDate?.value) payload.startDate = new Date(form.startDate.value).toISOString();
      if (form.endDate?.value) payload.endDate = new Date(form.endDate.value).toISOString();
      if (form.bannerUrl?.value) payload.bannerUrl = form.bannerUrl.value;
      if (form.maxAttendees?.value) payload.maxAttendees = parseInt(form.maxAttendees.value);

      const res = await eventService.updateEvent(event.id, payload);
      setEvents(prev => prev.map(ev => ev.id === event.id ? mapEventFromApi(res.data) : ev));
      showNotification('Đã cập nhật thông tin sự kiện!', 'success');
      closeModal();
    } catch (err) {
      const msg = err.response?.data?.error || 'Không thể cập nhật sự kiện';
      showNotification(msg, 'error');
    }
  };

  const saveCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: createForm.title,
        description: createForm.description,
        shortDesc: createForm.shortDesc || undefined,
        category: createForm.category || 'OTHER',
        venue: createForm.venue,
        address: createForm.address,
        city: createForm.city,
        startDate: new Date(createForm.startDate).toISOString(),
        endDate: new Date(createForm.endDate).toISOString(),
        bannerUrl: createForm.bannerUrl || undefined,
        maxAttendees: createForm.maxAttendees ? parseInt(createForm.maxAttendees) : undefined,
      };
      const res = await eventService.createEvent(payload);
      setEvents(prev => [mapEventFromApi(res.data), ...prev]);
      showNotification('Đã tạo sự kiện thành công!', 'success');
      closeModal();
    } catch (err) {
      const msg = err.response?.data?.error || 'Không thể tạo sự kiện';
      showNotification(msg, 'error');
    }
  };

  const filteredEvents = events
    .filter(event => {
      if (statusFilter !== 'All' && event.rawStatus !== statusFilter) return false;
      if (dateFilter === 'Tất cả thời gian') return true;
      if (!event.dateObj) return true;
      const now = new Date();
      if (dateFilter === 'Hôm nay') {
        return event.dateObj.getDate() === now.getDate() &&
          event.dateObj.getMonth() === now.getMonth() &&
          event.dateObj.getFullYear() === now.getFullYear();
      }
      if (dateFilter === 'Tháng này') {
        return event.dateObj.getMonth() === now.getMonth() &&
          event.dateObj.getFullYear() === now.getFullYear();
      }
      if (dateFilter === 'Tùy chọn' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const d = new Date(event.dateObj);
        d.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return d >= start && d <= end;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOption === 'Mới nhất') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortOption === 'Tên sự kiện (A-Z)') return a.name.localeCompare(b.name);
      if (sortOption === 'Doanh thu cao nhất') return b.rawRevenue - a.rawRevenue;
      if (sortOption === 'Lượt tham gia nhiều nhất') return b.currentAttendees - a.currentAttendees;
      return 0;
    });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderStatusBadge = (event) => {
    let bgClass = 'bg-slate-50 text-slate-600 border border-slate-100';
    let dotClass = 'bg-slate-400';
    let label = event.status;

    if (event.rawStatus === 'DRAFT') {
      if (event.isPendingApproval) {
        bgClass = 'bg-orange-50 text-orange-700 border border-orange-100';
        dotClass = 'bg-orange-500 animate-pulse';
        label = 'Chờ duyệt';
      } else if (event.isApproved) {
        bgClass = 'bg-sky-50 text-sky-700 border border-sky-100';
        dotClass = 'bg-sky-500';
        label = 'Đã duyệt (Chờ mở bán)';
      } else {
        bgClass = 'bg-slate-50 text-slate-500 border border-slate-100';
        dotClass = 'bg-slate-400';
        label = 'Nháp';
      }
    } else {
      const colors = {
        slate: 'bg-slate-50 text-slate-600 border border-slate-100',
        emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        amber: 'bg-amber-50 text-amber-700 border border-amber-200',
        indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
        rose: 'bg-rose-50 text-rose-700 border border-rose-100',
      };
      const dots = {
        slate: 'bg-slate-400',
        emerald: 'bg-emerald-500 animate-pulse',
        amber: 'bg-amber-500',
        indigo: 'bg-indigo-500',
        rose: 'bg-rose-500',
      };
      if (event.rawStatus === 'PUBLISHED' && event.isSalesActive === false) {
        bgClass = 'bg-amber-50 text-amber-700 border border-amber-200';
        dotClass = 'bg-amber-500';
        label = 'Tạm ngưng';
      } else {
        bgClass = colors[event.statusColor] || colors.slate;
        dotClass = dots[event.statusColor] || dots.slate;
        label = event.status === 'Cancelled' ? 'Đã hủy' : event.status === 'Completed' ? 'Hoàn thành' : event.status;
      }
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${bgClass}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
        {label}
      </span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 ${
              notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            <span className="material-symbols-outlined">
              {notification.type === 'error' ? 'error' : 'check_circle'}
            </span>
            <span className="font-bold text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Modal System */}
      <AnimatePresence>
        {modalConfig.isOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full ${
                modalConfig.type === 'analytics'
                  ? 'max-w-7xl h-[92vh] flex flex-col'
                  : modalConfig.type === 'create' || modalConfig.type === 'edit' || modalConfig.type === 'setup_tickets'
                  ? 'max-w-3xl max-h-[90vh] flex flex-col'
                  : 'max-w-xl flex flex-col'
              } bg-white rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-300`}
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black font-headline text-slate-900">
                    {modalConfig.type === 'create' && 'Tạo sự kiện mới'}
                    {modalConfig.type === 'edit' && 'Chỉnh sửa Sự kiện'}
                    {modalConfig.type === 'delete' && 'Xác nhận xóa'}
                    {modalConfig.type === 'analytics' && 'Phân tích Sự kiện'}
                    {modalConfig.type === 'setup_tickets' && 'Cấu hình vé & Mở bán'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {modalConfig.event ? (
                      <>Sự kiện: <span className="text-primary font-bold">{modalConfig.event.name}</span></>
                    ) : modalConfig.type === 'create' ? (
                      <span className="text-primary font-bold">Điền thông tin sự kiện mới</span>
                    ) : null}
                  </p>
                </div>
                <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:shadow-md transition-all">
                  <span className="material-symbols-outlined text-slate-400">close</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 flex-1 overflow-y-auto">
                {/* CREATE Modal */}
                {modalConfig.type === 'create' && (
                  <form onSubmit={saveCreate} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên sự kiện *</label>
                        <input
                          required
                          value={createForm.title}
                          onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))}
                          className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mô tả *</label>
                        <textarea
                          required
                          rows={3}
                          value={createForm.description}
                          onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
                          className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 resize-none"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mô tả ngắn *</label>
                        <input
                          required
                          value={createForm.shortDesc}
                          onChange={e => setCreateForm(p => ({ ...p, shortDesc: e.target.value }))}
                          className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Danh mục *</label>
                        <select
                          required
                          value={createForm.category}
                          onChange={e => setCreateForm(p => ({ ...p, category: e.target.value }))}
                          className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 bg-white"
                        >
                          <option value="MUSIC">Âm nhạc</option>
                          <option value="TECH">Công nghệ</option>
                          <option value="FOOD">Ẩm thực</option>
                          <option value="ART">Nghệ thuật</option>
                          <option value="BUSINESS">Kinh doanh</option>
                          <option value="SPORTS">Thể thao</option>
                          <option value="EDUCATION">Giáo dục</option>
                          <option value="ENTERTAINMENT">Giải trí</option>
                          <option value="OTHER">Khác</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Địa điểm *</label>
                        <input
                          required
                          value={createForm.venue}
                          onChange={e => setCreateForm(p => ({ ...p, venue: e.target.value }))}
                          className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Thành phố *</label>
                        <input
                          required
                          value={createForm.city}
                          onChange={e => setCreateForm(p => ({ ...p, city: e.target.value }))}
                          className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Địa chỉ chi tiết</label>
                        <input
                          value={createForm.address}
                          onChange={e => setCreateForm(p => ({ ...p, address: e.target.value }))}
                          className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ngày bắt đầu *</label>
                        <input
                          required
                          type="datetime-local"
                          value={createForm.startDate}
                          onChange={e => setCreateForm(p => ({ ...p, startDate: e.target.value }))}
                          className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ngày kết thúc *</label>
                        <input
                          required
                          type="datetime-local"
                          value={createForm.endDate}
                          onChange={e => setCreateForm(p => ({ ...p, endDate: e.target.value }))}
                          className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Số lượng tối đa</label>
                        <input
                          type="number"
                          value={createForm.maxAttendees}
                          onChange={e => setCreateForm(p => ({ ...p, maxAttendees: e.target.value }))}
                          className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">URL Banner</label>
                        <input
                          value={createForm.bannerUrl}
                          onChange={e => setCreateForm(p => ({ ...p, bannerUrl: e.target.value }))}
                          className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={closeModal} className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Hủy</button>
                      <button type="submit" className="px-10 py-3 rounded-2xl bg-primary text-white font-black shadow-lg shadow-indigo-200 hover:shadow-xl hover:translate-y-[-2px] active:scale-95 transition-all">Tạo sự kiện</button>
                    </div>
                  </form>
                )}

                {/* EDIT Modal */}
                {modalConfig.type === 'edit' && (
                  <form onSubmit={saveEdit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên sự kiện</label>
                        <input name="title" defaultValue={modalConfig.event?.name} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700" />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mô tả</label>
                        <textarea name="description" rows={3} defaultValue={modalConfig.event?.description} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 resize-none" />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mô tả ngắn</label>
                        <input name="shortDesc" defaultValue={modalConfig.event?.shortDesc} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700" />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Danh mục</label>
                        <select
                          name="category"
                          defaultValue={modalConfig.event?.category}
                          className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 bg-white"
                        >
                          <option value="MUSIC">Âm nhạc</option>
                          <option value="TECH">Công nghệ</option>
                          <option value="FOOD">Ẩm thực</option>
                          <option value="ART">Nghệ thuật</option>
                          <option value="BUSINESS">Kinh doanh</option>
                          <option value="SPORTS">Thể thao</option>
                          <option value="EDUCATION">Giáo dục</option>
                          <option value="ENTERTAINMENT">Giải trí</option>
                          <option value="OTHER">Khác</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Địa điểm</label>
                        <input name="venue" defaultValue={modalConfig.event?.venue} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Thành phố</label>
                        <input name="city" defaultValue={modalConfig.event?.city} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700" />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Địa chỉ chi tiết</label>
                        <input name="address" defaultValue={modalConfig.event?.address} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ngày bắt đầu</label>
                        <input name="startDate" type="datetime-local" defaultValue={modalConfig.event?.startDate ? toLocalISOString(modalConfig.event.startDate) : ''} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ngày kết thúc</label>
                        <input name="endDate" type="datetime-local" defaultValue={modalConfig.event?.endDate ? toLocalISOString(modalConfig.event.endDate) : ''} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">URL Banner</label>
                        <input name="bannerUrl" defaultValue={modalConfig.event?.bannerUrl} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Số lượng tối đa</label>
                        <input name="maxAttendees" type="number" defaultValue={modalConfig.event?.maxAttendees || ''} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={closeModal} className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Hủy</button>
                      <button type="submit" className="px-10 py-3 rounded-2xl bg-primary text-white font-black shadow-lg shadow-indigo-200 hover:shadow-xl hover:translate-y-[-2px] active:scale-95 transition-all">Lưu thay đổi</button>
                    </div>
                  </form>
                )}

                {/* SETUP TICKETS Modal */}
                {modalConfig.type === 'setup_tickets' && (
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100/80 flex items-center gap-4">
                      <div className="h-16 w-24 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                        <img alt={modalConfig.event?.name} className="w-full h-full object-cover" src={modalConfig.event?.image} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-base">{modalConfig.event?.name}</h4>
                        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1 font-medium">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                          {modalConfig.event?.location}
                        </p>
                      </div>
                    </div>

                    {/* Ticket List */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 ml-1">
                        <span className="material-symbols-outlined text-base text-primary">local_activity</span>
                        Hạng vé hiện tại ({ticketTypes.length})
                      </h4>

                      {setupTicketsLoading ? (
                        <div className="py-12 flex flex-col justify-center items-center text-slate-400 gap-2">
                          <span className="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
                          <span className="text-xs font-bold">Đang tải cấu hình vé...</span>
                        </div>
                      ) : ticketTypes.length === 0 ? (
                        <div className="py-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200/80 text-slate-400 text-xs font-semibold">
                          Chưa có loại vé nào. Vui lòng thêm ít nhất một hạng vé ở form bên dưới.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {ticketTypes.map((tt) => (
                            <div key={tt.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{tt.name}</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-slate-500 font-bold">
                                  <span className="flex items-center gap-0.5 text-primary">
                                    <span className="material-symbols-outlined text-[14px]">payments</span>
                                    {tt.price === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tt.price)}
                                  </span>
                                  <span className="text-slate-300">•</span>
                                  <span className="flex items-center gap-0.5 text-emerald-600">
                                    <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                                    Số lượng: {tt.totalQuantity}
                                  </span>
                                  <span className="text-slate-300">•</span>
                                  <span className="flex items-center gap-0.5 text-amber-600">
                                    <span className="material-symbols-outlined text-[14px]">lock_clock</span>
                                    Tối đa/đơn: {tt.maxPerOrder}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteTicketType(tt.id)}
                                className="w-8 h-8 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                                title="Xóa hạng vé"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add New Ticket Type Form */}
                    <form onSubmit={handleAddTicketType} className="border-t border-slate-100 pt-5 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Thêm hạng vé mới</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên hạng vé *</label>
                          <input
                            required
                            placeholder="Ví dụ: Vé Phổ Thông, Vé VIP..."
                            value={newTicket.name}
                            onChange={e => setNewTicket(p => ({ ...p, name: e.target.value }))}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-xs font-bold text-slate-700"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Giá vé (VND - Để trống nếu Miễn phí)</label>
                          <input
                            type="number"
                            placeholder="0 (Miễn phí)"
                            value={newTicket.price}
                            onChange={e => setNewTicket(p => ({ ...p, price: e.target.value }))}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-xs font-bold text-slate-700"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tổng số lượng vé *</label>
                          <input
                            required
                            type="number"
                            placeholder="Ví dụ: 100, 500..."
                            value={newTicket.totalQuantity}
                            onChange={e => setNewTicket(p => ({ ...p, totalQuantity: e.target.value }))}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-xs font-bold text-slate-700"
                          />
                        </div>
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tối đa mua mỗi đơn hàng</label>
                          <input
                            type="number"
                            placeholder="Mặc định: 5 vé"
                            value={newTicket.maxPerOrder}
                            onChange={e => setNewTicket(p => ({ ...p, maxPerOrder: e.target.value }))}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-xs font-bold text-slate-700"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-6 py-3 rounded-2xl bg-indigo-50 text-primary hover:bg-primary hover:text-white font-black text-xs transition-all active:scale-95 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                          Thêm hạng vé
                        </button>
                      </div>
                    </form>

                    <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                      <button type="button" onClick={closeModal} className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all text-xs">Hủy</button>
                      <button
                        type="button"
                        onClick={handleConfirmPublish}
                        disabled={ticketTypes.length === 0}
                        className="px-8 py-3 rounded-2xl bg-emerald-600 text-white font-black shadow-lg shadow-emerald-200 hover:shadow-xl hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all text-xs"
                      >
                        Xác nhận & Mở bán vé
                      </button>
                    </div>
                  </div>
                )}

                {/* DELETE Modal */}
                {modalConfig.type === 'delete' && (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-rose-500 text-4xl">delete_forever</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-slate-600 font-medium text-lg leading-relaxed px-10">
                        Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa sự kiện <span className="font-black text-slate-900">&ldquo;{modalConfig.event?.name}&rdquo;</span>?
                      </p>
                    </div>
                    <div className="flex justify-center gap-4 pt-4">
                      <button onClick={closeModal} className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all border border-slate-100">Quay lại</button>
                      <button onClick={confirmDelete} className="px-8 py-3 rounded-2xl bg-rose-500 text-white font-black shadow-lg shadow-rose-200 hover:bg-rose-600 active:scale-95 transition-all">Xác nhận xóa</button>
                    </div>
                  </div>
                )}

                {/* ANALYTICS Modal */}
                {modalConfig.type === 'analytics' && (() => {
                  const totalCapacity = modalConfig.event?.ticketTypes?.reduce((acc, tt) => acc + (tt.totalQuantity || 0), 0) || 0;
                  const totalSold = modalConfig.event?.ticketTypes?.reduce((acc, tt) => acc + (tt.soldQuantity || 0), 0) || 0;
                  const sellThroughRate = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;

                  return (
                    <div className="space-y-6">
                      {loadingAnalytics ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
                          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm font-semibold text-slate-500">Đang tải phân tích dữ liệu sự kiện...</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Summary Metrics */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-indigo-50/50 rounded-3xl border border-indigo-100 text-center relative overflow-hidden">
                              <span className="material-symbols-outlined text-indigo-400 absolute right-4 top-4 text-sm opacity-60">group</span>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vé đã bán</p>
                              <p className="text-xl font-black text-primary">{totalSold} <span className="text-[10px] font-bold text-slate-400">/ {totalCapacity}</span></p>
                              <div className="mt-2 bg-indigo-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${sellThroughRate}%` }}></div>
                              </div>
                            </div>
                            <div className="p-4 bg-emerald-50/40 rounded-3xl border border-emerald-100 text-center relative overflow-hidden">
                              <span className="material-symbols-outlined text-emerald-400 absolute right-4 top-4 text-sm opacity-60">payments</span>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Doanh thu</p>
                              <p className="text-xl font-black text-emerald-600">{modalConfig.event?.revenue || '0 ₫'}</p>
                              <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Hiệu suất: {sellThroughRate}%</p>
                            </div>
                            <div className="p-4 bg-amber-50/50 rounded-3xl border border-amber-100 text-center relative overflow-hidden">
                              <span className="material-symbols-outlined text-amber-400 absolute right-4 top-4 text-sm opacity-60">sentiment_satisfied</span>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hài lòng</p>
                              <p className="text-xl font-black text-amber-500">96%</p>
                              <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Cực kỳ tích cực</p>
                            </div>
                          </div>

                          {/* Ring Chart & Breakdown details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100 flex-1 min-h-0">
                            {/* Visual Progress ring */}
                            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                              <div className="relative flex items-center justify-center w-56 h-56">
                                <svg className="w-56 h-56 transform -rotate-90">
                                  <circle
                                    className="text-slate-50"
                                    strokeWidth="12"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="76"
                                    cx="112"
                                    cy="112"
                                  />
                                  <circle
                                    className="text-primary transition-all duration-1000 ease-out"
                                    strokeWidth="12"
                                    strokeDasharray="478"
                                    strokeDashoffset={478 - (478 * sellThroughRate) / 100}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="76"
                                    cx="112"
                                    cy="112"
                                  />
                                </svg>
                                <div className="absolute text-center">
                                  <span className="text-4xl font-black text-slate-800">{sellThroughRate}%</span>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Đã lấp đầy</p>
                                </div>
                              </div>
                              
                              {/* Colored Dots Indicators */}
                              <div className="flex gap-4 mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                                  <span>Đã bán ({totalSold})</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-slate-150 border border-slate-300 inline-block"></span>
                                  <span>Còn trống ({totalCapacity - totalSold})</span>
                                </div>
                              </div>
                            </div>

                            {/* Ticket types breakdown */}
                            <div className="space-y-4 flex flex-col min-h-0">
                              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">confirmation_number</span>
                                Cơ cấu vé bán ({modalConfig.event?.ticketTypes?.length || 0})
                              </h4>
                              <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[22rem]">
                                {modalConfig.event?.ticketTypes && modalConfig.event.ticketTypes.length > 0 ? (
                                  modalConfig.event.ticketTypes.map((tt, i) => {
                                    const pct = tt.totalQuantity > 0 ? Math.round((tt.soldQuantity / tt.totalQuantity) * 100) : 0;
                                    const ticketRevenue = (tt.price || 0) * (tt.soldQuantity || 0);
                                    const formattedRev = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ticketRevenue);
                                    return (
                                      <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2 hover:border-primary/20 transition-colors">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="text-xs font-black text-slate-800">{tt.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tt.price)}</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-xs font-black text-primary">{tt.soldQuantity} / {tt.totalQuantity}</p>
                                            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{formattedRev}</p>
                                          </div>
                                        </div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                          <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }}></div>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">Sự kiện chưa thiết lập hạng vé</div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* AI Copilot Insight Panel */}
                          {loadingAi ? (
                            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 text-slate-100 flex flex-col items-center justify-center gap-3 relative overflow-hidden h-32 shadow-xl shadow-indigo-950/10">
                              <div className="flex items-center gap-2.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
                                <span className="text-xs font-black uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-sm animate-spin">neurology</span>
                                  AI Copilot Analysis
                                </span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-400 animate-pulse">Đang quét vé bán chạy nhất & tính toán chiến lược tối ưu...</p>
                            </div>
                          ) : (() => {
                            const advice = generateAiAdvice(modalConfig.event, sellThroughRate, totalSold, totalCapacity);
                            return (
                              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-slate-100 shadow-xl shadow-indigo-500/10 flex gap-5 items-start relative overflow-hidden group">
                                <div className="absolute -right-16 -top-16 w-36 h-36 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-lg text-indigo-400">
                                  <span className="material-symbols-outlined text-2xl animate-pulse">neurology</span>
                                </div>
                                <div className="space-y-2 flex-1">
                                  <div className="flex justify-between items-center">
                                    <h5 className="text-sm font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                                      {advice.title}
                                    </h5>
                                    <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse">
                                      AI Smart Advice
                                    </span>
                                  </div>
                                  <p className="text-xs font-bold text-slate-300 leading-relaxed whitespace-pre-line">
                                    {advice.text}
                                  </p>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Close button */}
                          <div className="flex justify-center pt-2">
                            <button onClick={closeModal} className="px-12 py-3.5 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95">Đóng phân tích</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Page Header Section */}
      <div className="flex justify-between items-end mb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">Danh sách Sự kiện</h2>
          <p className="text-on-surface-variant font-body">Quản lý và theo dõi hiệu suất các sự kiện của bạn.</p>
        </div>
        <button
          onClick={() => navigate('/organizer/events/create')}
          className="bg-gradient-to-r from-primary to-primary-container text-white px-8 py-3.5 rounded-full font-semibold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-indigo-200"
        >
          <span className="material-symbols-outlined">add</span>
          Tạo sự kiện mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white p-5 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 hover:shadow-[0_20px_50px_rgba(79,70,229,0.08)] transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-transparent opacity-50 rounded-full -mr-12 -mt-12"></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${stat.bg} rounded-xl group-hover:bg-opacity-80 transition-colors duration-300`}>
                  <span className={`material-symbols-outlined ${stat.text} text-base`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                </div>
                <p className="text-slate-500 text-xs font-black font-headline uppercase tracking-wider">{stat.label}</p>
              </div>
              <span className={`text-[9px] font-black ${stat.change.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-rose-600 bg-rose-50'} px-2.5 py-1 rounded-full shadow-sm`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-black font-headline text-slate-900 relative z-10 tracking-tight">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Filters Area */}
      <div className="bg-slate-50 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 border border-slate-100">
        <div className="flex items-center gap-3">
          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${statusFilter !== 'All' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
            >
              <span className="material-symbols-outlined text-sm">filter_list</span>
              {STATUS_LABELS[statusFilter] || statusFilter}
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20 overflow-hidden"
                  >
                    {STATUS_FILTERS.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${statusFilter === status ? 'text-primary bg-indigo-50/50' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        {STATUS_LABELS[status] || status}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDateOpen(!isDateOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${dateFilter !== 'Tất cả thời gian' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
            >
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              {dateFilter}
            </button>

            <AnimatePresence>
              {isDateOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDateOpen(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-20 overflow-hidden"
                  >
                    <div className="space-y-1 mb-4">
                      {['Tất cả thời gian', 'Hôm nay', 'Tháng này', 'Tùy chọn'].map((range) => (
                        <button
                          key={range}
                          onClick={() => {
                            setDateFilter(range);
                            if (range !== 'Tùy chọn') {
                              setIsDateOpen(false);
                              setStartDate('');
                              setEndDate('');
                            }
                          }}
                          className={`w-full text-left px-3 py-2 text-sm font-semibold transition-colors rounded-lg ${dateFilter === range ? 'text-primary bg-indigo-50/50' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {dateFilter === 'Tùy chọn' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-3 pt-3 border-t border-slate-100 overflow-hidden"
                        >
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Từ ngày</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Đến ngày</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="relative group">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-full border border-slate-200 shadow-sm hover:border-primary/30 transition-colors w-80"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Sắp xếp:</span>
              <span className="text-sm font-bold text-slate-900 truncate">{sortOption}</span>
            </div>
            <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`}>expand_more</span>
          </button>

          <AnimatePresence>
            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)}></div>
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20 overflow-hidden"
                >
                  {[
                    { label: 'Mới nhất', value: 'newest' },
                    { label: 'Tên sự kiện (A-Z)', value: 'az' },
                    { label: 'Doanh thu cao nhất', value: 'revenue' },
                    { label: 'Lượt tham gia nhiều nhất', value: 'attendance' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortOption(option.label);
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-semibold transition-colors flex items-center justify-between group/item ${sortOption === option.label ? 'text-primary bg-indigo-50/50' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {option.label}
                      {sortOption === option.label && (
                        <span className="material-symbols-outlined text-sm">check</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Large Data Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 min-h-[715px] flex flex-col">
        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="flex flex-col items-center gap-4 text-slate-400">
                <span className="material-symbols-outlined text-5xl animate-spin">progress_activity</span>
                <p className="text-sm font-bold">Đang tải sự kiện...</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Tên Sự kiện</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Ngày tổ chức</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Tham dự</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Doanh thu</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50 transition-colors group h-[88px]">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                          <img alt={event.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={event.image} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-900 group-hover:text-primary transition-colors truncate">{event.name}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">
                          {event.date !== '--' ? event.date.split('/').slice(0, 2).join('/') : '--'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                          {event.date !== '--' ? `Năm ${event.date.split('/')[2]}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {renderStatusBadge(event)}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-slate-600">{event.attendance}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-emerald-600">{event.revenue}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {event.rawStatus === 'DRAFT' && event.isApproved && (
                          <button
                            onClick={() => handlePublish(event)}
                            className="w-9 h-9 flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md active:scale-90"
                            title="Mở bán vé (Xuất bản)"
                          >
                            <span className="material-symbols-outlined text-[18px]">publish</span>
                          </button>
                        )}
                        {event.rawStatus === 'DRAFT' && !event.isApproved && !event.isPendingApproval && (
                          <button
                            onClick={() => handleSubmitApproval(event)}
                            className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md active:scale-90"
                            title="Gửi yêu cầu duyệt"
                          >
                            <span className="material-symbols-outlined text-[18px]">rule</span>
                          </button>
                        )}
                        {event.rawStatus === 'DRAFT' && event.isPendingApproval && (
                          <button
                            disabled
                            className="w-9 h-9 flex items-center justify-center bg-orange-50 text-orange-400 rounded-xl cursor-not-allowed"
                            title="Đang chờ duyệt"
                          >
                            <span className="material-symbols-outlined text-[18px] animate-pulse">hourglass_empty</span>
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/organizer/events/${event.id}/attendees`)}
                          className="w-9 h-9 flex items-center justify-center bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md active:scale-90"
                          title="Quản lý khách mời"
                        >
                          <span className="material-symbols-outlined text-[18px]">group</span>
                        </button>
                        <button
                          onClick={() => handleEdit(event)}
                          className="w-9 h-9 flex items-center justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md active:scale-90"
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleAnalytics(event)}
                          className="w-9 h-9 flex items-center justify-center bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md active:scale-90"
                          title="Phân tích"
                        >
                          <span className="material-symbols-outlined text-[18px]">analytics</span>
                        </button>
                        {(event.rawStatus === 'DRAFT' || event.rawStatus === 'CANCELLED') && (
                          <button
                            onClick={() => handleDelete(event)}
                            className="w-9 h-9 flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md active:scale-90"
                            title="Xóa"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && paginatedEvents.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-4 text-slate-400">
                        <span className="material-symbols-outlined text-5xl">event_busy</span>
                        <p className="text-sm font-bold">Chưa có sự kiện nào</p>
                        <button onClick={handleCreate} className="px-6 py-2 rounded-full bg-primary text-white font-bold text-sm hover:brightness-110 transition-all">
                          Tạo sự kiện đầu tiên
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && paginatedEvents.length > 0 && paginatedEvents.length < itemsPerPage && (
                  [...Array(itemsPerPage - paginatedEvents.length)].map((_, i) => (
                    <tr key={`empty-${i}`} className="h-[88px] border-b border-slate-50/50">
                      <td colSpan="6" className="px-6 py-5">
                        <div className="flex items-center gap-4 opacity-5">
                          <div className="h-11 w-11 rounded-xl bg-slate-200"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-slate-200 rounded"></div>
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Section */}
        {!loading && filteredEvents.length > 0 && (
          <div className="px-6 py-5 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Hiển thị <span className="font-bold text-slate-900">
                {Math.min((currentPage - 1) * itemsPerPage + 1, filteredEvents.length)} - {Math.min(currentPage * itemsPerPage, filteredEvents.length)}
              </span> trong tổng số <span className="font-bold text-slate-900">{filteredEvents.length}</span> sự kiện
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center transition-all ${currentPage === i + 1
                    ? 'bg-primary text-white shadow-md shadow-indigo-100 scale-105'
                    : 'hover:bg-white text-sm font-medium text-slate-600'
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Promotion / Tips Card */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3 bg-gradient-to-br from-[#6366f1] to-[#4338ca] rounded-2xl p-8 text-white relative overflow-hidden group shadow-xl shadow-indigo-100">
          <div className="relative z-10 max-w-ml">
            <h4 className="text-2xl font-bold mb-3">Tăng hiệu quả bán vé với Trí tuệ Nhân tạo</h4>
            <p className="text-indigo-100 mb-6 opacity-90 leading-relaxed">Sử dụng công cụ phân tích xu hướng mới để dự đoán lượng khách mời và tối ưu hóa giá vé theo thời gian thực.</p>
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold text-sm hover:bg-indigo-50 active:scale-95 transition-all shadow-lg">Tìm hiểu thêm</button>
          </div>
          <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[200px] text-white/10 group-hover:rotate-12 transition-transform duration-700" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        </div>
        <div className="md:col-span-2 bg-slate-100 rounded-2xl p-8 flex flex-col justify-center border border-slate-200/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined">tips_and_updates</span>
            </div>
            <h5 className="font-bold text-slate-900">Mẹo quản lý</h5>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">Đừng quên gửi email xác nhận cho khách mời ít nhất 48 giờ trước khi sự kiện bắt đầu để đảm bảo tỉ lệ tham dự cao nhất.</p>
        </div>
      </div>
    </div>
  );
};

export default OrganizerEventsPage;
