import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../lib/axios';
import { 
  Bell, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  RefreshCcw,
  ChevronRight,
  Settings
} from 'lucide-react';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
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
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const mockNotifications = [
    {
      id: 'mock-1',
      type: 'location',
      title: 'Thay đổi địa điểm',
      subtitle: 'Hội thảo AI 2024 đã chuyển sang Park Hyatt.',
      description: 'Sự kiện đã được chuyển sang Grand Ballroom, Khách sạn Park Hyatt thay vì địa điểm cũ tại Trung tâm Hội nghị Quốc gia. Vui lòng cập nhật lộ trình của bạn.',
      time: '10 phút trước',
      isNew: true,
      actionLabel: 'XEM BẢN ĐỒ',
      location: 'Quận 1, TP. HCM',
      unread: true
    },
    {
      id: 'mock-2',
      type: 'reminder',
      title: 'Nhắc nhở lịch trình',
      subtitle: 'Lễ ra mắt sản phẩm X sẽ bắt đầu trong 2 giờ tới.',
      description: 'Chương trình sẽ bắt đầu trong vòng 2 giờ tới. Đừng quên mang theo mã QR để check-in nhanh chóng tại quầy đón tiếp.',
      time: '2 giờ trước',
      isNew: true,
      actionLabel: 'XEM MÃ QR',
      unread: true
    },
    {
      id: 'mock-3',
      type: 'approval',
      title: 'Xác nhận đăng ký',
      subtitle: 'Vé của bạn đã được phê duyệt thành công.',
      description: 'Yêu cầu đăng ký của bạn đã được phê duyệt thành công. Vé điện tử đã được gửi tới email cá nhân của bạn.',
      time: '5 giờ trước',
      isNew: false,
      actionLabel: 'CHI TIẾT VÉ',
      unread: false
    },
    {
      id: 'mock-4',
      type: 'update',
      title: 'Cập nhật phiên thảo luận',
      subtitle: 'Phiên thảo luận sẽ bắt đầu muộn hơn 15 phút.',
      description: 'Phiên thảo luận "Tương lai của thiết kế" sẽ bắt đầu muộn hơn 15 phút so với dự kiến ban đầu. Rất xin lỗi vì sự bất tiện này.',
      time: '8 giờ trước',
      isNew: false,
      unread: false
    }
  ];

  const getNotificationsList = () => {
    if (notifications && notifications.length > 0) {
      return notifications;
    }
    return mockNotifications;
  };

  const handleSelectNotif = async (notif) => {
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
      case 'location': return <MapPin className="w-4 h-4 text-indigo-600" />;
      case 'reminder': return <Clock className="w-4 h-4 text-purple-600" />;
      case 'approval': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'update': return <RefreshCcw className="w-4 h-4 text-amber-600" />;
      default: return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  const getBgColor = (type) => {
    switch(type) {
      case 'location': return 'bg-indigo-50';
      case 'reminder': return 'bg-purple-50';
      case 'approval': return 'bg-emerald-50';
      case 'update': return 'bg-amber-50';
      default: return 'bg-primary/5';
    }
  };

  const handleViewAll = () => {
    onClose();
    if (location.pathname.startsWith('/admin')) {
      navigate('/admin/notifications');
    } else if (location.pathname.startsWith('/attendee')) {
      navigate('/attendee/notifications');
    } else if (location.pathname.startsWith('/organizer')) {
      navigate('/organizer/notifications');
    } else {
      navigate('/attendee/notifications');
    }
  };

  return (
    <>
      <div className="absolute top-[calc(100%+12px)] -right-12 w-[400px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-in fade-in zoom-in slide-in-from-top-2 duration-300 z-[101]">
        {/* Arrow */}
        <div className="absolute -top-2 right-16 w-4 h-4 bg-white border-l border-t border-slate-100 rotate-45"></div>
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Thông báo</h3>
             <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full">
               {getNotificationsList().filter(n => n.unread).length} MỚI
             </span>
          </div>
          <button className="text-slate-400 hover:text-primary transition-colors">
             <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[480px] overflow-y-auto no-scrollbar">
          {getNotificationsList().map((notif) => (
            <div 
              key={notif.id}
              onClick={() => handleSelectNotif(notif)}
              className="p-6 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer group relative flex items-start gap-4"
            >
              {notif.isNew && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              )}
              
              <div className={`w-10 h-10 ${getBgColor(notif.type)} rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                  {getIcon(notif.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[13px] font-black text-slate-800 group-hover:text-primary transition-colors line-clamp-1">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400 font-bold">{notif.time}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                  {notif.description || notif.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white">
          <button 
            onClick={handleViewAll}
            className="w-full py-4 bg-slate-50 hover:bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-2"
          >
             Xem tất cả thông báo
             <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

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
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  selectedNotif.isNew ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {selectedNotif.isNew ? 'Mới' : 'Đã xem'}
                </span>
                <span className="text-[11px] font-bold text-slate-400">{selectedNotif.time}</span>
              </div>
              
              <h3 className="text-xl font-black text-slate-800 leading-tight">
                {selectedNotif.title}
              </h3>
              
              <p className="text-slate-500 text-sm leading-relaxed font-medium pt-2">
                {selectedNotif.description || selectedNotif.subtitle}
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
                <button className="flex-1 py-4 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95">
                  {selectedNotif.actionLabel}
                </button>
              )}
              <button 
                onClick={() => setSelectedNotif(null)}
                className={`py-4 font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 ${
                  selectedNotif.actionLabel ? 'flex-1 bg-slate-50 hover:bg-slate-100 text-slate-500' : 'w-full bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20'
                }`}
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default NotificationDropdown;
