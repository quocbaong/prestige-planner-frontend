import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  BarChart3,
  Wallet,
  Settings,
  Plus,
  HelpCircle,
  LogOut,
  Megaphone,
  MessageSquare
} from 'lucide-react';

import logo from '../../../assets/logo.png';
import { useAuth } from '../../../stores/AuthContext';

const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 rounded-xl group ${active
        ? 'bg-primary/10 text-primary border-r-4 border-primary'
        : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
      }`}>
    <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'}`} />
    <span className="font-semibold text-[15px]">{label}</span>
  </div>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Tổng quan", path: "/admin/dashboard" },
    { icon: Calendar, label: "Sự kiện", path: "/admin/events" },
    { icon: Megaphone, label: "Phát tin", path: "/admin/broadcast" },
    { icon: MessageSquare, label: "Phản hồi", path: "/admin/feedback" },
    { icon: Users, label: "Khách mời", path: "/admin/guests" },
    { icon: BarChart3, label: "Báo cáo", path: "/admin/reports" },
    { icon: Wallet, label: "Tài chính", path: "/admin/finance" },
    { icon: Settings, label: "Cài đặt", path: "/admin/settings" },
  ];

  return (
    <aside className="w-[var(--sidebar-width)] h-screen bg-white border-r border-border-color flex flex-col pt-4 pb-6">
      {/* Logo */}
      <div 
        onClick={() => navigate('/admin/dashboard')}
        className="px-6 mb-8 cursor-pointer hover:opacity-85 transition-opacity"
      >
        <img src={logo} alt="EventArchitect" className="h-14 w-auto object-contain" />
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-4 space-y-4">
        {/* Create Event Button */}
        <button 
          onClick={() => navigate('/admin/events/create')}
          className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/25 transition-all duration-300 transform hover:-translate-y-1"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo sự kiện mới</span>
        </button>

        <div className="pt-4 space-y-1 border-t border-border-color">
          <SidebarItem 
            icon={HelpCircle} 
            label="Hỗ trợ" 
            active={location.pathname === '/admin/help'} 
            onClick={() => navigate('/admin/help')} 
          />
          <SidebarItem icon={LogOut} label="Đăng xuất" onClick={handleLogout} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
