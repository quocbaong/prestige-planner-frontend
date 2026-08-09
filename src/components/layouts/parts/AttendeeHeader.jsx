import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User as UserIcon, Settings, LogOut, Check } from 'lucide-react';
import NotificationDropdown from '../../common/NotificationDropdown';
import { useAuth } from '../../../stores/AuthContext';
import UserProfileModal from '../../modals/UserProfileModal';
import axios from '../../../lib/axios';

const AttendeeHeader = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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

  const navLinks = [
    { label: 'Sự kiện của tôi', path: '/attendee/events' },
    { label: 'Khám phá sự kiện', path: '/attendee/explore' }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <>
      <header className="h-[var(--topbar-height)] border-b border-slate-50 bg-white sticky top-0 z-[100] px-8 flex items-center justify-between">
        {/* Left: Search Bar */}
        <div className="flex-1 max-w-[400px]">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-all" />
            <input 
              type="text" 
              placeholder="Tìm kiếm sự kiện..." 
              className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-[14px] font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>
        </div>

        {/* Middle: Custom Navigation Links for Attendee Header */}
        <nav className="hidden xl:flex items-center gap-10">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.path)}
              className={`text-[14px] font-black tracking-tight transition-all pb-1 border-b-2 ${
                location.pathname === link.path 
                ? 'text-indigo-600 border-indigo-600' 
                : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          {/* Notification Icon */}
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`p-2 rounded-xl transition-all relative ${isNotifOpen ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 border border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
          </div>

          {/* Settings Icon */}
          <button 
            onClick={() => navigate('/attendee/settings')}
            className={`p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all ${
              location.pathname === '/attendee/settings' ? 'text-indigo-600 bg-indigo-50' : ''
            }`}
            title="Cài đặt hệ thống"
          >
            <Settings className="w-6 h-6" />
          </button>

          {/* User Profile Trigger and Menu */}
          <div className="relative">
            <div 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer group select-none"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {user?.fullName || 'Người tham gia'}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {user?.role === 'ATTENDEE' ? 'Thành viên Nexus' : 'Khách mời'}
                </p>
              </div>
              
              {/* Custom Avatar with premium initials layout */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-gradient-to-tr from-indigo-500 to-purple-600 text-white ring-2 ring-indigo-100 group-hover:ring-indigo-300 transition-all overflow-hidden shadow-sm">
                {getInitials(user?.fullName)}
              </div>
            </div>

            {/* Floating Dropdown Menu */}
            {isProfileMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsProfileMenuOpen(false)} />
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-base bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md">
                      {getInitials(user?.fullName)}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-slate-955 truncate">
                        {user?.fullName || 'Người tham gia'}
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
                      <span>Hồ sơ của tôi</span>
                    </button>
                    <button 
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate('/attendee/settings');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                    >
                      <Settings className="text-slate-400 w-4.5 h-4.5" />
                      <span>Cài đặt tài khoản</span>
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

      {/* Glassmorphism Detailed Profile Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
};

export default AttendeeHeader;
