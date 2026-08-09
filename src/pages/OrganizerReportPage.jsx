import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { id: 'analytics', label: 'Phân tích Chuyên sâu', icon: 'analytics', path: '/organizer/reports/analytics' },
  { id: 'templates', label: 'Thư viện Mẫu Báo cáo', icon: 'library_books', path: '/organizer/reports/templates' },
];

const OrganizerReportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = tabs.find(t => location.pathname.startsWith(t.path))?.id || 'analytics';

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto bg-[#f8fafc] min-h-screen">
      {/* ── Report Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 font-headline tracking-tight mb-1">
          Báo cáo &amp; Phân tích
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Quản lý dữ liệu, xuất báo cáo và theo dõi hiệu suất sự kiện của bạn.
        </p>
      </motion.div>



      {/* ── Tab Hint Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tabs.map((tab, i) => (
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(99,102,241,0.12)' }}
            onClick={() => navigate(tab.path)}
            className="cursor-pointer rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:border-indigo-200 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[26px] text-indigo-600">
                {tab.icon}
              </span>
            </div>
            <h3 className="font-black text-lg mb-2 text-slate-800">
              {tab.label}
            </h3>
            <p className="text-sm font-medium leading-relaxed mb-4 text-slate-500">
              {tab.id === 'analytics'
                ? 'Xem KPI tổng quan, heatmap tham dự, phễu chuyển đổi và so sánh hiệu suất giữa các sự kiện.'
                : 'Khám phá thư viện mẫu báo cáo có sẵn, tạo báo cáo AI và xuất dữ liệu nhanh theo định dạng PDF, Excel, CSV.'}
            </p>
            <button className="flex items-center gap-1.5 text-sm font-black text-indigo-600 transition-all hover:gap-2.5">
              Đi đến trang
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Stats Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
      >
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Tóm tắt nhanh</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: 'description', label: 'Báo cáo đã tạo', value: '24', color: 'text-indigo-600 bg-indigo-50' },
            { icon: 'download', label: 'Lượt xuất tháng này', value: '8', color: 'text-violet-600 bg-violet-50' },
            { icon: 'schedule', label: 'Đang xử lý', value: '2', color: 'text-amber-600 bg-amber-50' },
            { icon: 'check_circle', label: 'Đã hoàn thành', value: '22', color: 'text-emerald-600 bg-emerald-50' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color.split(' ')[1]}`}>
                <span className={`material-symbols-outlined text-[20px] ${s.color.split(' ')[0]}`}>{s.icon}</span>
              </div>
              <div>
                <p className="text-xl font-black text-slate-800">{s.value}</p>
                <p className="text-[11px] font-semibold text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default OrganizerReportPage;
