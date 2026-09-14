import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Settings,
  ChevronRight,
  Menu,
  Check,
} from 'lucide-react';
import { useAuth } from '../../../stores/useAuth';

const VendorHeader = ({ onToggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getBreadcrumb = () => {
    const map = {
      '/vendor/dashboard': ['Tổng quan', 'Bảng điều khiển'],
      '/vendor/services': ['Dịch vụ', 'Quản lý dịch vụ'],
      '/vendor/orders': ['Đơn hàng', 'Quản lý đơn'],
      '/vendor/chat': ['Chat', 'Tin nhắn'],
      '/vendor/ai': ['AI', 'Trợ lý thông minh'],
      '/vendor/reports': ['Báo cáo', 'Phân tích'],
      '/vendor/settings': ['Cài đặt', 'Tài khoản'],
    };

    return map[location.pathname] || ['Vendor', 'Dashboard'];
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase()
    : 'VN';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{getBreadcrumb()[0]}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold text-primary">{getBreadcrumb()[1]}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden w-[300px] items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 md:flex">
            <Search className="h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ, đơn hàng..."
              className="w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <button className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100">
            <Bell className="h-4 w-4" />
          </button>

          <button
            onClick={() => navigate('/vendor/settings')}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
          >
            <Settings className="h-4 w-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 hover:bg-slate-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-500 text-sm font-bold text-white">
                {initials}
              </div>
              <div className="hidden text-left text-sm md:block">
                <div className="font-semibold text-slate-800">{user?.fullName || 'Vendor'}</div>
                <div className="text-xs text-slate-500">Nhà cung cấp dịch vụ</div>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 z-50 mt-3 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-500 font-bold text-white">
                    {initials}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{user?.fullName || 'Vendor'}</div>
                    <div className="text-xs text-slate-500">{user?.email || 'vendor@prestige.vn'}</div>
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      <Check className="h-3 w-3" />
                      Đã xác thực
                    </div>
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => navigate('/vendor/settings')}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Cài đặt tài khoản
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default VendorHeader;
