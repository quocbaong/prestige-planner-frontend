import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../stores/AuthContext';
import UserProfileModal from '../../modals/UserProfileModal';
import NotificationDropdown from '../../common/NotificationDropdown';
import axios from '../../../lib/axios';

const OrganizerHeader = ({ onToggleSidebar }) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/notifications');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Refresh every 30 seconds for dynamic feel
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const getTitle = () => {
    const path = location.pathname;
    
    // Xử lý tiêu đề cho module Báo cáo với phân cấp
    if (path === '/organizer/reports') return { main: "Báo cáo & Phân tích" };
    if (path === '/organizer/reports/analytics') return { parent: "Báo cáo thống kê", parentPath: "/organizer/reports", child: "Phân tích Chuyên sâu" };
    if (path === '/organizer/reports/templates') return { parent: "Báo cáo thống kê", parentPath: "/organizer/reports", child: "Thư viện Mẫu Báo cáo" };

    // Check for dynamic path /organizer/events/:id/attendees
    if (path.startsWith('/organizer/events/') && path.endsWith('/attendees')) {
      return { main: "Quản lý Sự kiện" };
    }

    const items = [
      { path: "/organizer/dashboard", label: "Tổng quan" },
      { path: "/organizer/events", label: "Quản lý Sự kiện" },
      { path: "/organizer/attendees", label: "Danh sách Khách mời" },
      { path: "/organizer/schedule", label: "Quản lý Lịch trình" },
      { path: "/organizer/timeline", label: "Quản lý Dòng thời gian" },
      { path: "/organizer/finance", label: "Quản lý tài chính" },
      { path: "/organizer/settings", label: "Cài đặt Hệ thống" },
      { path: "/organizer/help", label: "Trung tâm Hỗ trợ" },
    ];
    const current = items.find(item => item.path === path);
    return { main: current ? current.label : "Quản lý Sự kiện" };
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };



  const getInitials = (name) => {
    if (!name) return 'PP';
    return name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm border-b border-slate-200/50">
        <div className="flex items-center justify-between px-8 py-4">
          {/* Page Title / Breadcrumb */}
          <div className="flex items-center gap-2">
            <button 
              onClick={onToggleSidebar}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors mr-1"
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">menu</span>
            </button>
            
            <div className="flex items-center gap-1.5 overflow-hidden">
              {getTitle().parent ? (
                <>
                  <button 
                    onClick={() => navigate(getTitle().parentPath)}
                    className="text-[15px] font-medium text-slate-400 whitespace-nowrap hover:text-indigo-500 transition-colors"
                  >
                    {getTitle().parent}
                  </button>
                  <span className="material-symbols-outlined text-[16px] text-slate-300 mt-0.5">chevron_right</span>
                  <h2 className="text-[15px] font-bold text-indigo-600 truncate">
                    {getTitle().child}
                  </h2>
                </>
              ) : (
                <h2 className="text-[15px] font-bold text-indigo-600 truncate">
                  {getTitle().main}
                </h2>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative flex items-center bg-surface-container-high rounded-full px-4 py-2 w-64">
              <span className="material-symbols-outlined text-slate-400 text-lg mr-2">search</span>
              <input 
                className="bg-transparent border-none focus:ring-0 text-sm w-full p-0 outline-none" 
                placeholder="Tìm kiếm..." 
                type="text"
              />
            </div>
            
            <div className="flex items-center gap-2 relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all relative"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 border border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
              
              <button 
                onClick={() => navigate('/organizer/settings')}
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                title="Cài đặt hệ thống"
              >
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
            
            {/* User Profile Trigger and Menu */}
            <div className="relative">
              <div 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer group select-none"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                    {user?.fullName || 'Hoàng Nam'}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {user?.role === 'ORGANIZER' ? 'Nhà tổ chức Prestige' : 'Ban tổ chức'}
                  </p>
                </div>
                
                {/* Custom Avatar with premium initials layout */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-gradient-to-tr from-indigo-500 to-purple-600 text-white ring-2 ring-indigo-100 dark:ring-indigo-900 group-hover:ring-indigo-300 transition-all overflow-hidden shadow-sm">
                  {getInitials(user?.fullName)}
                </div>
              </div>

              {/* Floating Dropdown Menu */}
              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-3 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-base bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md">
                        {getInitials(user?.fullName)}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-bold text-slate-950 dark:text-white truncate">
                          {user?.fullName || 'Nhà tổ chức'}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        {user?.isVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-[12px] font-black">verified</span> Đã xác thực
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="px-2 py-2 border-b border-slate-100 dark:border-slate-800">
                      <button 
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition-colors"
                      >
                        <span className="material-symbols-outlined text-slate-400 text-lg">person</span>
                        Hồ sơ của tôi
                      </button>
                      <button 
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          navigate('/organizer/settings');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition-colors"
                      >
                        <span className="material-symbols-outlined text-slate-400 text-lg">settings</span>
                        Cài đặt tài khoản
                      </button>
                    </div>

                    <div className="px-2 pt-2">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm font-bold rounded-xl transition-colors"
                      >
                        <span className="material-symbols-outlined text-rose-500 text-lg">logout</span>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Glassmorphism Detailed Profile Modal (Mockup design) */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
};

export default OrganizerHeader;
