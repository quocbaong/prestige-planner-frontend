import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { useAuth } from '../../../stores/AuthContext';
const OrganizerSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: "dashboard", label: "Tổng quan", path: "/organizer/dashboard" },
    { icon: "calendar_month", label: "Sự kiện", path: "/organizer/events" },
    { icon: "group", label: "Khách mời", path: "/organizer/attendees" },
    { icon: "event_note", label: "Lịch trình", path: "/organizer/schedule" },
    { icon: "timeline", label: "Dòng thời gian", path: "/organizer/timeline" },
    { icon: "analytics", label: "Báo cáo", path: "/organizer/reports" },
    { icon: "payments", label: "Tài chính", path: "/organizer/finance" },
  ];

  const bottomItems = [
    { icon: "help", label: "Hỗ trợ", path: "/organizer/help" },
  ];



  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-50 dark:bg-slate-950 flex flex-col p-4 border-r border-slate-200/50 dark:border-slate-800/50 z-50">
      <div className="mb-10 px-2 flex justify-center">
        <div 
          className="cursor-pointer group flex flex-col items-center text-center"
          onClick={() => navigate('/organizer/dashboard')}
        >
          <img 
            src={logo} 
            alt="Logo" 
            className="h-13 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="w-48 h-1 bg-indigo-100 dark:bg-indigo-900/50 my-2 rounded-full"></div>
        </div>
      </div>

      <nav className="flex-grow space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = item.label === "Sự kiện" 
            ? location.pathname.startsWith('/organizer/events') 
            : item.label === "Báo cáo"
            ? location.pathname.startsWith('/organizer/reports')
            : item.label === "Tài chính"
            ? location.pathname.startsWith('/organizer/finance')
            : location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-transform hover:translate-x-1 ${
                isActive 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <span 
                className="material-symbols-outlined" 
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-headline text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>



      <div className="mt-auto pt-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-1">
        {bottomItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-transform hover:translate-x-1"
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-headline text-sm">{item.label}</span>
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-transform hover:translate-x-1"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-headline text-sm">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default OrganizerSidebar;
