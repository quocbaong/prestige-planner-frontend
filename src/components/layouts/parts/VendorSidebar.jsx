import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BriefcaseBusiness,
  ShoppingBag,
  MessageSquareText,
  Bot,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import logo from '../../../assets/logo.png';
import { useAuth } from '../../../stores/useAuth';

const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 ${
      active
        ? 'bg-primary/10 text-primary border border-primary/10 shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon className="h-5 w-5" />
    <span className="text-sm font-semibold">{label}</span>
  </button>
);

const VendorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/vendor/dashboard' },
    { icon: BriefcaseBusiness, label: 'Dịch vụ', path: '/vendor/services' },
    { icon: ShoppingBag, label: 'Đơn hàng', path: '/vendor/orders' },
    { icon: MessageSquareText, label: 'Chat', path: '/vendor/chat' },
    { icon: Bot, label: 'AI hỗ trợ', path: '/vendor/ai' },
    { icon: BarChart3, label: 'Báo cáo', path: '/vendor/reports' },
    { icon: Settings, label: 'Cài đặt', path: '/vendor/settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white px-4 py-5 shadow-sm">
      <div className="mb-8 px-2">
        <div
          onClick={() => navigate('/vendor/dashboard')}
          className="flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-slate-50"
        >
          <img src={logo} alt="Prestige Planner" className="h-12 w-auto object-contain" />
        </div>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          return (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={isActive}
              onClick={() => navigate(item.path)}
            />
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl border border-primary/10 bg-primary/5 p-4">
        <div className="mb-2 flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-[0.12em]">AI Vendor</span>
        </div>
        <p className="text-sm text-slate-600">Gợi ý tối ưu dịch vụ và tăng tỷ lệ booking hôm nay.</p>
      </div>

      <div className="mt-auto pt-6">
        <SidebarItem
          icon={LogOut}
          label="Đăng xuất"
          onClick={handleLogout}
        />
      </div>
    </aside>
  );
};

export default VendorSidebar;
