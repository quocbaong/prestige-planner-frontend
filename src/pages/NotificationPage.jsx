import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { 
  Bell, 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  QrCode, 
  ChevronRight, 
  MoreHorizontal,
  RefreshCcw,
  ArrowRight,
  Filter
} from 'lucide-react';

const NotificationPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/notifications');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const mockNotifications = [
    {
      id: 'mock-1',
      type: 'location',
      title: 'Thay đổi địa điểm: Hội thảo AI 2024',
      description: 'Sự kiện đã được chuyển sang Grand Ballroom, Khách sạn Park Hyatt thay vì địa điểm cũ tại Trung tâm Hội nghị Quốc gia. Vui lòng cập nhật lộ trình của bạn.',
      time: '10 phút trước',
      location: 'Quận 1, TP. HCM',
      actionLabel: 'XEM BẢN ĐỒ',
      isNew: true,
      unread: true,
    },
    {
      id: 'mock-2',
      type: 'reminder',
      title: 'Nhắc nhở lịch trình: Lễ ra mắt sản phẩm X',
      description: 'Chương trình sẽ bắt đầu trong vòng 2 giờ tới. Đừng quên mang theo mã QR để check-in nhanh chóng tại quầy đón tiếp.',
      time: '2 giờ trước',
      actionLabel: 'Xem mã QR',
      isNew: true,
      unread: true,
    },
    {
      id: 'mock-3',
      type: 'approval',
      title: 'Xác nhận đăng ký: Đêm nhạc Indigo Nexus',
      description: 'Yêu cầu đăng ký của bạn đã được phê duyệt thành công. Vé điện tử đã được gửi tới email cá nhân của bạn.',
      date: '15 Th05, 2024',
      actionLabel: 'CHI TIẾT VÉ',
      isNew: false,
      unread: false,
    },
    {
      id: 'mock-4',
      type: 'update',
      title: 'Cập nhật phiên thảo luận',
      description: 'Phiên thảo luận "Tương lai của thiết kế" sẽ bắt đầu muộn hơn 15 phút so với dự kiến ban đầu. Rất xin lỗi vì sự bất tiện này.',
      date: '14 Th05, 2024',
      isNew: false,
      unread: false,
    }
  ];

  const getNotificationsList = () => {
    if (notifications && notifications.length > 0) {
      return notifications;
    }
    return mockNotifications;
  };

  const unreadCount = getNotificationsList().filter(n => n.unread).length;

  const filters = [
    { id: 'all', label: 'Tất cả' },
    { id: 'unread', label: `Chưa đọc (${unreadCount})` },
    { id: 'calendar', label: 'Cập nhật lịch' },
    { id: 'confirmation', label: 'Xác nhận' }
  ];

  const filteredNotifications = getNotificationsList().filter(notif => {
    if (activeFilter === 'unread') return notif.unread;
    if (activeFilter === 'calendar') return notif.type === 'location' || notif.type === 'reminder' || notif.type === 'update';
    if (activeFilter === 'confirmation') return notif.type === 'approval';
    return true;
  });

  const handleSelectNotification = async (notif) => {
    setSelectedNotif(notif);
    if (notif.unread && !String(notif.id).startsWith('mock-')) {
      try {
        await axios.post(`/notifications/${notif.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false, isNew: false } : n));
      } catch (error) {
        console.error('Lỗi khi đánh dấu đã đọc:', error);
      }
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'location': return <MapPin className="w-6 h-6 text-indigo-600" />;
      case 'reminder': return <Clock className="w-6 h-6 text-purple-600" />;
      case 'approval': return <CheckCircle2 className="w-6 h-6 text-indigo-600" />;
      case 'update': return <RefreshCcw className="w-6 h-6 text-slate-500" />;
      default: return <Bell className="w-6 h-6 text-indigo-600" />;
    }
  };

  const getBgColor = (type) => {
    switch(type) {
      case 'location': return 'bg-indigo-50';
      case 'reminder': return 'bg-purple-50';
      case 'approval': return 'bg-indigo-50/50';
      case 'update': return 'bg-slate-100';
      default: return 'bg-indigo-50/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] font-sans overflow-hidden">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-100 px-10 py-10 flex-shrink-0">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="text-4xl font-black text-indigo-600 tracking-tight mb-2">Trung tâm Thông báo</h1>
          <p className="text-slate-400 font-bold text-sm">Theo dõi cập nhật quan trọng từ các sự kiện của bạn.</p>
          
          <div className="flex items-center gap-3 mt-8">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-black transition-all duration-300 ${
                  activeFilter === filter.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/50">
        <div className="max-w-[1000px] mx-auto p-10 space-y-4">
          {filteredNotifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => handleSelectNotification(notif)}
              className={`relative group bg-white rounded-[32px] p-8 border-2 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex items-start gap-6 cursor-pointer ${
                notif.unread ? 'border-indigo-600/30' : 'border-white'
              }`}
            >
              {/* Status Badge */}
              {notif.isNew && (
                <span className="absolute top-6 right-8 bg-indigo-100 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Mới
                </span>
              )}
              {!notif.unread && !notif.isNew && (
                <span className="absolute top-6 right-8 text-slate-300 text-[10px] font-black uppercase tracking-widest">
                  Đã đọc
                </span>
              )}

              {/* Icon Container */}
              <div className={`w-14 h-14 ${getBgColor(notif.type)} rounded-[20px] flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-110`}>
                {getIcon(notif.type)}
              </div>

              {/* Text Content */}
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                  {notif.title}
                </h3>
                <p className="text-slate-500 text-[13px] leading-relaxed font-medium max-w-[80%]">
                  {notif.description}
                </p>

                {/* Footer Info & Actions */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-5 text-[11px] font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{notif.time || notif.date}</span>
                    </div>
                    {notif.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{notif.location}</span>
                      </div>
                    )}
                  </div>

                  {notif.actionLabel && (
                    <button className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">
                      {notif.actionLabel}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Gradient Border Overlay for Unread */}
              {notif.unread && (
                <div className="absolute inset-0 rounded-[32px] pointer-events-none border-2 border-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              )}
            </div>
          ))}

          {/* Load More */}
          <div className="pt-10 pb-20 flex flex-col items-center gap-4">
            <button className="bg-white px-10 py-4 rounded-2xl border border-slate-100 font-bold text-sm text-indigo-600 shadow-sm hover:shadow-md transition-all">
              Tải thêm thông báo
            </button>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              Hiển thị {filteredNotifications.length} trên tổng số {notifications.length} thông báo
            </p>
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) - For marking all as read or settings */}
      <button className="fixed bottom-10 right-10 w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-2xl shadow-indigo-300 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
         <Filter className="w-6 h-6" />
      </button>

      {/* Detail Modal Overlay */}
      {selectedNotif && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[32px] p-8 border border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex flex-col gap-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className={`w-14 h-14 ${getBgColor(selectedNotif.type)} rounded-[20px] flex items-center justify-center shadow-inner`}>
                {getIcon(selectedNotif.type)}
              </div>
              <button 
                onClick={() => setSelectedNotif(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  selectedNotif.unread ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {selectedNotif.unread ? 'Mới' : 'Đã xem'}
                </span>
                <span className="text-[11px] font-bold text-slate-400">{selectedNotif.time || selectedNotif.date}</span>
              </div>
              
              <h3 className="text-xl font-black text-slate-800 leading-tight">
                {selectedNotif.title}
              </h3>
              
              <p className="text-slate-500 text-sm leading-relaxed font-medium pt-2">
                {selectedNotif.description}
              </p>
              
              {selectedNotif.location && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 p-3.5 rounded-xl mt-4">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <span>Địa điểm: {selectedNotif.location}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-4">
              {selectedNotif.actionLabel && (
                <button className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95">
                  {selectedNotif.actionLabel}
                </button>
              )}
              <button 
                onClick={() => setSelectedNotif(null)}
                className={`py-4 font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 ${
                  selectedNotif.actionLabel ? 'flex-1 bg-slate-50 hover:bg-slate-100 text-slate-500' : 'w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100'
                }`}
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
