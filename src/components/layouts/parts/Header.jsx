import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Mail, ChevronRight, Settings, User as UserIcon, LogOut, Check } from 'lucide-react';
import UserProfileModal from '../../modals/UserProfileModal';
import NotificationDropdown from '../../common/NotificationDropdown';
import { useAuth } from '../../../stores/AuthContext';
import axios from '../../../lib/axios';

const Header = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/notifications');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getBreadcrumbs = () => {
    switch (location.pathname) {
      case '/admin/broadcast':
        return (
          <>
            <span className="text-slate-400 font-medium">Hệ thống</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-primary font-black uppercase tracking-wider text-sm">Phát tin toàn cầu</span>
          </>
        );
      case '/admin/feedback':
        return (
          <>
            <span className="text-slate-400 font-medium">Hệ thống</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-primary font-black uppercase tracking-wider text-sm">Kiểm duyệt phản hồi</span>
          </>
        );
      case '/admin/settings':
        return (
          <>
            <span className="text-slate-400 font-medium">Hệ thống</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-primary font-black uppercase tracking-wider text-sm">Cấu hình hệ thống</span>
          </>
        );
      case '/admin/events':
        return (
          <>
            <span className="text-slate-400 font-medium">Hệ thống</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-primary font-black uppercase tracking-wider text-sm">Quản lý Sự kiện</span>
          </>
        );
      case '/admin/dashboard':
        return (
          <>
            <span className="text-slate-400 font-medium">Bảng điều khiển</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-primary font-black uppercase tracking-wider text-sm">Tổng quan</span>
          </>
        );
      default:
        return (
          <>
            <span className="text-slate-400 font-medium">Quản trị</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-primary font-black uppercase tracking-wider text-sm">Chi tiết</span>
          </>
        );
    }
  };

  return (
    <>
      <header className="h-[var(--topbar-height)] border-b border-border-color bg-white sticky top-0 z-[100] px-8 flex items-center justify-between">
        {/* Title / Breadcrumbs */}
        <div className="flex items-center gap-2">
          {getBreadcrumbs()}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Search Bar - hidden for broadcast and settings */}
          {!['/admin/broadcast', '/admin/settings'].includes(location.pathname) && (
            <div className="relative w-[320px] mr-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder={location.pathname === '/admin/feedback' ? "Tìm kiếm phản hồi..." : "Tìm kiếm nhanh..."}
                className="w-full bg-slate-100 border-none rounded-full py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          )}

          {/* Icons */}
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`relative p-2 rounded-xl transition-all ${isNotifOpen ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 text-slate-600'}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 border border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

            <Link 
              to="/admin/settings" 
              className={`p-2 rounded-xl transition-all ${
                location.pathname === '/admin/settings' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 text-slate-600'
              }`}
              title="Cấu hình hệ thống"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>

          <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

          {/* User Profile */}
          <div className="relative">
            <div
              className="flex items-center gap-3 cursor-pointer group select-none"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                  {user?.fullName || 'Quản trị viên'}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {user?.role === 'ADMIN' ? 'Hệ thống Quản trị' : 'Quản trị viên'}
                </p>
              </div>
              
              {/* Custom Avatar with premium initials layout */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-gradient-to-tr from-primary to-indigo-600 text-white ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all overflow-hidden shadow-sm">
                {getInitials(user?.fullName)}
              </div>
            </div>

            {/* Floating Dropdown Menu */}
            {isProfileMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsProfileMenuOpen(false)} />
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-base bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-md">
                      {getInitials(user?.fullName)}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-slate-955 truncate">
                        {user?.fullName || 'Quản trị viên'}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      {user?.isVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 mt-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3 text-emerald-600" /> Đã xác thực
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="px-2 py-2 border-b border-slate-100">
                    <button 
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                    >
                      <UserIcon className="text-slate-400 w-4.5 h-4.5" />
                      <span>Hồ sơ cá nhân</span>
                    </button>
                    <button 
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate('/admin/settings');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                    >
                      <Settings className="text-slate-400 w-4.5 h-4.5" />
                      <span>Cấu hình hệ thống</span>
                    </button>
                  </div>

                  <div className="px-2 pt-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 text-rose-600 text-sm font-bold rounded-xl transition-colors"
                    >
                      <LogOut className="text-rose-500 w-4.5 h-4.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};

export default Header;
