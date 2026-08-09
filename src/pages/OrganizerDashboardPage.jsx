import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardService } from '../services/dashboardService';
import { eventService } from '../services/eventService';
import { useAuth } from '../stores/AuthContext';

const getDatesInRange = (fromStr, toStr) => {
  const dates = [];
  const current = new Date(fromStr);
  const end = new Date(toStr);
  for (let i = 0; i < 31; i++) {
    if (current > end) break;
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const formatWeekday = (date) => {
  const day = date.getDay();
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dayNames[day]} (${dd}/${mm})`;
};

const formatDateKey = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const OrganizerDashboardPage = () => {
  const [period, setPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [dateRange, setDateRange] = useState({ from: '2026-04-20', to: '2026-04-26' });

  const [overview, setOverview] = useState({ totalAttendees: 0, totalRevenue: 0, upcomingEvents: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiPeriod = period === 'week' ? 'day' : period;
        
        const [overviewRes, revenueRes, eventsRes, eventRevenueRes] = await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getRevenue(apiPeriod),
          eventService.getEvents(),
          dashboardService.getRevenue('event')
        ]);
        
        let revenueList = revenueRes.data;
        let calculatedRevenue = 0;
        let calculatedAttendees = 0;
        
        if (period === 'week') {
          const dates = getDatesInRange(dateRange.from, dateRange.to);
          const revenueMap = new Map(revenueList.map(item => [item.groupKey, Number(item.revenue)]));
          const countMap = new Map(revenueList.map(item => [item.groupKey, Number(item.count || 0)]));
          
          revenueList = dates.map(date => {
            const key = formatDateKey(date);
            const label = formatWeekday(date);
            const rev = revenueMap.get(key) || 0;
            const cnt = countMap.get(key) || 0;
            calculatedRevenue += rev;
            calculatedAttendees += cnt;
            return {
              groupKey: key,
              groupLabel: label,
              revenue: rev,
              count: cnt
            };
          });
        } else if (period === 'month') {
          const filteredItems = revenueList.filter(item => item.groupKey.startsWith(selectedYear));
          const revenueMap = new Map(filteredItems.map(item => [item.groupKey, Number(item.revenue)]));
          const countMap = new Map(filteredItems.map(item => [item.groupKey, Number(item.count || 0)]));
          
          const monthsData = Array.from({ length: 12 }, (_, i) => {
            const m = String(i + 1).padStart(2, '0');
            const key = `${selectedYear}-${m}`;
            const rev = revenueMap.get(key) || 0;
            const cnt = countMap.get(key) || 0;
            calculatedRevenue += rev;
            calculatedAttendees += cnt;
            return {
              groupKey: key,
              groupLabel: `Th ${i + 1}`,
              revenue: rev,
              count: cnt
            };
          });
          revenueList = monthsData;
        }
        
        setOverview({
          totalAttendees: calculatedAttendees,
          totalRevenue: calculatedRevenue,
          upcomingEvents: overviewRes.data?.upcomingEvents || 0
        });
        
        const colors = ['from-indigo-500 to-indigo-600', 'from-blue-500 to-indigo-500', 'from-indigo-400 to-indigo-500', 'from-indigo-600 to-indigo-700', 'from-indigo-700 to-indigo-800'];
        const mappedRevenue = revenueList.map((item, i) => {
          const maxRev = Math.max(...revenueList.map(r => r.revenue)) || 1;
          const height = Math.max((item.revenue / maxRev) * 100, 5);
          return {
            label: item.groupLabel,
            height: height,
            color: colors[i % colors.length],
            value: new Intl.NumberFormat('vi-VN').format(item.revenue),
            percent: `${Math.round(height)}%`
          };
        });
        setRevenueData(mappedRevenue);

        const eventRevenues = eventRevenueRes.data.reduce((acc, curr) => {
          acc[curr.groupKey] = curr.revenue;
          return acc;
        }, {});

        const sortedEvents = eventsRes.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .map(e => ({
             name: e.title,
             type: e.category || 'Sự kiện',
             date: e.startDate ? new Date(e.startDate).toLocaleDateString('vi-VN') : '--',
             status: e.status === 'PUBLISHED' || e.status === 'ON_SALE' ? 'Đang bán vé' : e.status === 'DRAFT' ? 'Sắp diễn ra' : 'Hoàn thành',
             statusColor: e.status === 'PUBLISHED' || e.status === 'ON_SALE' ? 'green' : e.status === 'DRAFT' ? 'amber' : 'slate',
             income: eventRevenues[e.id] ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(eventRevenues[e.id]) : '0 ₫',
             img: e.bannerUrl || 'https://images.unsplash.com/photo-1540575861501-7ad05823c9f5?auto=format&fit=crop&q=80&w=200'
          }));
        setRecentEvents(sortedEvents);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [period, dateRange, selectedYear]);

  const currentData = revenueData;

  return (
    <div className="p-8 min-h-screen bg-[#fcfdff] animate-in fade-in duration-700">
      <section className="mb-8">
        <h2 className="text-3xl font-black font-headline text-slate-900 mb-1 tracking-tight">Chào, {user?.fullName || 'Nhà tổ chức'}! 👋</h2>
        <p className="text-slate-500 font-semibold text-base opacity-80">Dưới đây là tóm tắt những gì đang diễn ra với các sự kiện của bạn.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Tổng người tham dự', value: loading ? '...' : overview.totalAttendees.toLocaleString('vi-VN'), change: period === 'week' ? 'Trong tuần chọn' : `Năm ${selectedYear}`, icon: 'group', color: 'indigo' },
          { label: 'Doanh thu tổng', value: loading ? '...' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(overview.totalRevenue || 0), change: period === 'week' ? 'Trong tuần chọn' : `Năm ${selectedYear}`, icon: 'payments', color: 'purple' },
          { label: 'Sự kiện sắp tới', value: loading ? '...' : overview.upcomingEvents.toString(), change: 'Chưa diễn ra', icon: 'event_available', color: 'orange' },
        ].map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white p-5 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 hover:shadow-[0_20px_50px_rgba(79,70,229,0.08)] transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-transparent opacity-50 rounded-full -mr-12 -mt-12"></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${card.color}-50 rounded-xl group-hover:bg-${card.color}-100 transition-colors duration-300`}>
                  <span className={`material-symbols-outlined text-${card.color}-600 text-base`} style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
                </div>
                <p className="text-slate-500 text-xs font-black font-headline uppercase tracking-wider">{card.label}</p>
              </div>
              <span className={`text-[9px] font-black ${card.change.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-50'} px-2.5 py-1 rounded-full shadow-sm`}>{card.change}</span>
            </div>
            <h3 className="text-2xl font-black font-headline text-slate-900 relative z-10 tracking-tight">{card.value}</h3>
          </motion.div>
        ))}

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-[#4f46e5] to-[#4338ca] p-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.25)] flex flex-col justify-between text-white relative overflow-hidden group cursor-pointer"
        >
          {/* GIANT background star icons */}
          <div className="absolute bottom-[-150px] right-[-100px] opacity-[0.12] group-hover:scale-110 group-hover:rotate-[30deg] transition-transform duration-1000">
            <span className="material-symbols-outlined text-[500px] select-none" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <div className="absolute top-[-20px] left-[-30px] opacity-[0.06] group-hover:-rotate-12 transition-transform duration-1000">
            <span className="material-symbols-outlined text-[150px] select-none" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>

          <div className="z-10 relative">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-bold font-headline leading-tight">Mở rộng mạng lưới</h3>
              <span className="material-symbols-outlined text-white/40 text-xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>grade</span>
            </div>
            <p className="text-indigo-50 text-[10px] opacity-80 mb-4 font-medium leading-relaxed max-w-[140px]">
              Mời thêm đối tác vào hệ thống chuyên nghiệp.
            </p>
            <button className="bg-white text-[#4f46e5] px-8 py-2.5 rounded-2xl text-[10px] font-black hover:bg-indigo-50 transition-all shadow-lg active:scale-95 uppercase tracking-widest">
              Mời ngay
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 pb-6 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100/80 overflow-hidden">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5 mb-6">
              <div>
                <h3 className="text-xl font-black font-headline text-slate-900 tracking-tight">Biểu đồ tăng trưởng</h3>
                <p className="text-xs text-slate-400 font-bold opacity-70">Theo dõi hiệu suất kinh doanh qua thời gian</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {period === 'month' ? (
                  <div className="relative group">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="appearance-none bg-slate-50 border border-slate-100 text-slate-700 text-[10px] font-black py-2.5 pl-4 pr-10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer transition-all hover:bg-white hover:border-indigo-200"
                    >
                      <option value="2026">Năm 2026</option>
                      <option value="2025">Năm 2025</option>
                      <option value="2024">Năm 2024</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none group-hover:scale-110 transition-transform">event</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-right-4 duration-300">
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                      className="bg-white border-none text-[9px] font-black text-indigo-600 px-2.5 py-1.5 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                    <span className="text-slate-300 font-black text-xs">→</span>
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                      className="bg-white border-none text-[9px] font-black text-indigo-600 px-2.5 py-1.5 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                  </div>
                )}

                <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
                  <button
                    onClick={() => setPeriod('week')}
                    className={`text-[9px] font-black px-5 py-2 rounded-xl transition-all duration-300 uppercase tracking-wider ${period === 'week' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Tuần
                  </button>
                  <button
                    onClick={() => setPeriod('month')}
                    className={`text-[9px] font-black px-5 py-2 rounded-xl transition-all duration-300 uppercase tracking-wider ${period === 'month' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Tháng
                  </button>
                </div>
              </div>
            </div>

            <div className="h-96 w-full flex items-end justify-between relative px-4 mt-6">
              {/* Grid Background Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-full border-t border-slate-50 h-0"></div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={period}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full flex items-end justify-between gap-2 h-full z-10 pb-2"
                >
                  {currentData.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      {/* Floating Data Label */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-20 flex flex-col items-center pointer-events-none">
                        <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-2xl whitespace-nowrap">
                          {item.value}{period === 'week' ? ' VND' : ' VND'}
                        </span>
                        <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 shadow-2xl"></div>
                      </div>

                      {/* The Slim Bar (Neon Style) */}
                      <div className="w-full h-full flex flex-col justify-end items-center relative">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${item.height}%` }}
                          transition={{ delay: i * 0.04, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                          className={`w-4 sm:w-6 bg-gradient-to-t ${item.color} rounded-full relative group-hover:w-6 sm:group-hover:w-9 transition-all duration-500 shadow-[0_10px_30px_rgba(79,70,229,0.15)]`}
                        >
                          {/* Inner Glow */}
                          <div className="absolute inset-0 rounded-full border border-white/20"></div>

                          {/* Percentage inside */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                            <span className="text-[8px] sm:text-[11px] font-black text-white rotate-[-90deg] whitespace-nowrap drop-shadow-md">
                              {item.percent}
                            </span>
                          </div>
                        </motion.div>
                      </div>

                      <span className="mt-3 text-[9px] sm:text-[11px] font-black text-slate-400 group-hover:text-indigo-600 transition-all duration-300 uppercase tracking-widest">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100/80">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black font-headline text-slate-900 tracking-tight">Sự kiện gần đây</h3>
              <button className="text-indigo-600 text-sm font-black hover:text-indigo-800 transition-colors bg-indigo-50 px-5 py-2 rounded-xl">Xem tất cả</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[11px] font-black border-b border-slate-50 uppercase tracking-[0.2em]">
                    <th className="pb-6 font-label">Tên sự kiện</th>
                    <th className="pb-6 font-label">Ngày tổ chức</th>
                    <th className="pb-6 font-label">Trạng thái</th>
                    <th className="pb-6 font-label text-right">Thu nhập</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentEvents.map((event, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-all duration-300 group">
                      <td className="py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm transition-transform group-hover:scale-105 duration-500">
                            <img alt={event.name} className="w-full h-full object-cover" src={event.img} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 tracking-tight">{event.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{event.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 text-xs text-slate-500 font-bold">{event.date}</td>
                      <td className="py-6">
                        <span className={`px-4 py-1.5 bg-${event.statusColor}-50 text-${event.statusColor}-600 text-[9px] font-black rounded-full uppercase tracking-widest shadow-sm`}>{event.status}</span>
                      </td>
                      <td className="py-6 text-sm font-black text-slate-900 text-right tabular-nums">{event.income}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50/50 rounded-full -mr-10 -mt-10"></div>
            <h3 className="text-lg font-black font-headline text-slate-900 mb-5 relative z-10 tracking-tight">Thao tác nhanh</h3>
            <div className="space-y-3 relative z-10">
              {[
                { icon: 'confirmation_number', label: 'Kiểm tra mã vé', color: 'indigo' },
                { icon: 'person_add', label: 'Thêm khách mời', color: 'purple' },
                { icon: 'mail', label: 'Gửi thông báo loạt', color: 'blue' },
              ].map((action, i) => (
                <button key={i} className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 border border-transparent hover:border-slate-100 rounded-[1.5rem] transition-all duration-500 group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-${action.color}-50 rounded-xl group-hover:bg-${action.color}-100 transition-colors duration-300`}>
                      <span className={`material-symbols-outlined text-${action.color}-600 text-base`}>{action.icon}</span>
                    </div>
                    <span className="text-xs font-black text-slate-800 tracking-tight">{action.label}</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 text-base group-hover:translate-x-1 transition-transform duration-300">chevron_right</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100/80">
            <h3 className="text-xl font-black font-headline text-slate-900 mb-6 tracking-tight">Việc cần làm</h3>
            <div className="relative space-y-1">
              {/* Refined Timeline Line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-indigo-500 via-purple-500 to-slate-100 rounded-full"></div>

              {[
                { time: '09:00 AM', title: 'Họp nhà cung cấp', subtitle: 'Tech Summit 2024', color: 'indigo', dotColor: 'bg-indigo-500' },
                { time: '02:30 PM', title: 'Duyệt Backdrop', subtitle: 'Summer Beat Festival', color: 'purple', dotColor: 'bg-purple-500' },
                { time: '04:00 PM', title: 'Gửi email diễn giả', subtitle: null, color: 'orange', dotColor: 'bg-orange-500' },
              ].map((task, i) => (
                <div key={i} className="relative pl-10 py-3 rounded-2xl transition-all duration-300 hover:bg-slate-50/80 group cursor-pointer">
                  {/* Glowing Dot */}
                  <div className={`absolute left-0 top-[18px] w-[16px] h-[16px] rounded-full border-4 border-white shadow-lg z-10 transition-all duration-500 group-hover:scale-125 ${task.dotColor} ${task.color === 'indigo' ? 'shadow-indigo-200' : task.color === 'purple' ? 'shadow-purple-200' : 'shadow-orange-200'}`}>
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${task.dotColor}`}></div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{task.time}</span>
                      <div className="h-[1px] w-4 bg-slate-100"></div>
                    </div>
                    <h4 className="text-sm font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                    {task.subtitle && (
                      <p className="text-xs text-slate-400 font-bold mt-1 opacity-70 group-hover:opacity-100 transition-opacity italic">{task.subtitle}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <h3 className="text-xs font-black mb-4 relative z-10 uppercase tracking-widest opacity-80">Gói dịch vụ</h3>
            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dung lượng</span>
              <span className="text-xs font-black text-indigo-400">85%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 mb-6 relative z-10 overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="bg-gradient-to-r from-indigo-500 to-blue-400 h-full rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"
              ></motion.div>
            </div>
            <div className="flex justify-center relative z-10">
              <button className="px-8 py-2.5 bg-white text-indigo-600 rounded-xl text-[11px] font-black hover:bg-indigo-50 hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(79,70,229,0.3)] transition-all duration-300 uppercase tracking-widest active:scale-95">
                Nâng cấp ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboardPage;
