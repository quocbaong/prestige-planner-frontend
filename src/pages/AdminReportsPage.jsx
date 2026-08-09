import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp,
  Download,
  Calendar,
  Users2,
  Ticket,
  DollarSign,
  AlertTriangle,
  Award,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldAlert,
  Search,
  Filter,
  Check,
  Zap
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';

const AdminReportsPage = () => {
  const [period, setPeriod] = useState(30);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeTab, setActiveTab] = useState('revenue');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [selectedReportedEvent, setSelectedReportedEvent] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  // Custom Toast trigger
  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  // ─── Mock Data for Charts & Tables ──────────────────────────────────────────
  
  // Platform Monthly Financial Stats
  const revenueHistory = [
    { month: 'Tháng 12', revenue: 1200, commission: 120 },
    { month: 'Tháng 1', revenue: 1850, commission: 185 },
    { month: 'Tháng 2', revenue: 2400, commission: 240 },
    { month: 'Tháng 3', revenue: 3100, commission: 310 },
    { month: 'Tháng 4', revenue: 2900, commission: 290 },
    { month: 'Tháng 5', revenue: 4200, commission: 420 },
  ];

  // Top Organizers by Platform Contribution
  const topOrganizers = [
    { id: 1, name: 'Công ty Cổ phần Sự kiện FPT', eventsCount: 18, totalSales: '1,450,000,000đ', commission: '145,000,000đ', rating: 4.8 },
    { id: 2, name: 'Học viện Âm nhạc Quốc gia', eventsCount: 8, totalSales: '980,000,000đ', commission: '98,000,000đ', rating: 4.9 },
    { id: 3, name: 'VTI Academy', eventsCount: 12, totalSales: '820,000,000đ', commission: '82,000,000đ', rating: 4.7 },
    { id: 4, name: 'Trường Đại học Bách Khoa', eventsCount: 22, totalSales: '680,000,000đ', commission: '68,000,000đ', rating: 4.6 },
    { id: 5, name: 'Vietnam Tech Community', eventsCount: 14, totalSales: '590,000,000đ', commission: '59,000,000đ', rating: 4.5 },
  ];

  // Ticket Class Distribution
  const ticketClassData = [
    { name: 'Vé VIP', value: 4200, color: '#f59e0b' },
    { name: 'Vé Thường', value: 16800, color: '#6366f1' },
    { name: 'Vé Sớm (Early Bird)', value: 3500, color: '#10b981' }
  ];

  // Top Performing Events (by Rating & Attendance)
  const topEvents = [
    { name: 'Vietnam Tech Summit 2024', category: 'Công nghệ', ticketsSold: 1200, revenue: '420.5M', rating: 4.9, status: 'Hoàn tất' },
    { name: 'Music Fest – Summer Heat', category: 'Âm nhạc', ticketsSold: 4800, revenue: '1.2B', rating: 4.8, status: 'Đang diễn ra' },
    { name: 'Hội thảo AI & Robotics', category: 'Khoa học', ticketsSold: 850, revenue: '180.2M', rating: 4.8, status: 'Hoàn tất' },
    { name: 'Gala Dinner: Night of Stars', category: 'Nghệ thuật', ticketsSold: 350, revenue: '95M', rating: 4.7, status: 'Hoàn tất' },
    { name: 'Startup Pitching Day', category: 'Kinh doanh', ticketsSold: 780, revenue: '150M', rating: 4.7, status: 'Đang diễn ra' }
  ];

  // System Reported & Flagged Events (Moderation Panel)
  const [reportedEvents, setReportedEvents] = useState([
    { id: 101, eventName: 'Khóa Học Hack Mọi Tài Khoản Facebook', organizer: 'Lâm Tặc Coder', category: 'Nội dung cấm', reporter: 'hoangnam@email.com', date: '18/05/2026', reportsCount: 15, status: 'Đang xử lý', severity: 'Cao' },
    { id: 102, eventName: 'Live Concert: Đêm Nhạc Trẻ Lậu', organizer: 'Music Underground', category: 'Bản quyền hình ảnh', reporter: 'fpt_legal@fpt.vn', date: '17/05/2026', reportsCount: 6, status: 'Đang xử lý', severity: 'Trung bình' },
    { id: 103, eventName: 'Hội thảo Nhận Quà Miễn Phí 100k', organizer: 'Trí Tuệ Việt Group', category: 'Lừa đảo / Spam', reporter: 'trunghieu@gmail.com', date: '16/05/2026', reportsCount: 22, status: 'Đang xử lý', severity: 'Cao' },
    { id: 104, eventName: 'Triển lãm Vẽ Bậy Đường Phố', organizer: 'Graffiti Club', category: 'Thiếu giấy phép', reporter: 'chinhquyen_quan1@gov.vn', date: '14/05/2026', reportsCount: 4, status: 'Đã bỏ qua', severity: 'Thấp' },
    { id: 105, eventName: 'Giải Đua Xe Địa Hình Chui', organizer: 'Riders Sài Gòn', category: 'Nguy hiểm / Bạo lực', reporter: 'admin_sys@eventarchitect.com', date: '12/05/2026', reportsCount: 12, status: 'Đã khóa', severity: 'Cao' }
  ]);

  // Action Handlers
  const handleExportReport = () => {
    showToast('Đang biên dịch và kết xuất Báo cáo hệ thống định dạng PDF...', 'info');
    setTimeout(() => {
      showToast('Đã tải xuống Báo cáo hệ thống thành công!', 'success');
    }, 1500);
  };

  const handleModerationAction = (actionType) => {
    const updatedStatus = actionType === 'suspend' ? 'Đã khóa' : 'Đã bỏ qua';
    setReportedEvents(prev => prev.map(item => 
      item.id === selectedReportedEvent.id ? { ...item, status: updatedStatus } : item
    ));
    
    showToast(
      actionType === 'suspend' 
        ? `Đã khóa vĩnh viễn sự kiện và đình chỉ nhà tổ chức!`
        : `Đã bác bỏ tất cả báo cáo cho sự kiện này!`,
      actionType === 'suspend' ? 'error' : 'success'
    );
    
    setSelectedReportedEvent(null);
    setActionNotes('');
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Báo cáo & Phân tích Hệ thống</h1>
          <p className="text-slate-500 max-w-2xl font-medium">Giám sát hiệu suất kinh doanh, quản lý chỉ số tăng trưởng và kiểm duyệt tính an toàn của tất cả sự kiện trên nền tảng.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Date Filter */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 bg-white text-slate-700 px-6 py-3.5 rounded-full font-bold border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all active:scale-95 duration-200 whitespace-nowrap cursor-pointer"
            >
              <Calendar className="w-5 h-5 text-slate-400" />
              <span>{period === 'custom' ? 'Tự chọn ngày' : `${period} ngày qua`}</span>
            </button>

            <AnimatePresence>
              {showDatePicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-50 origin-top-right min-w-[240px]"
                >
                  <div className="space-y-2">
                    {[7, 30, 90].map(d => (
                      <button
                        key={d}
                        onClick={() => { setPeriod(d); setShowDatePicker(false); }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${period === d ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        {d} ngày qua
                      </button>
                    ))}
                    <div className="h-px bg-slate-100 my-2" />
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tự chọn khoảng</p>
                      <input
                        type="date"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                        value={customRange.start}
                        onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                      />
                      <input
                        type="date"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                        value={customRange.end}
                        onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                      />
                    </div>
                    <button
                      onClick={() => { setPeriod('custom'); setShowDatePicker(false); }}
                      className="w-full mt-2 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all cursor-pointer"
                    >
                      Áp dụng ngày
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Export Report PDF */}
          <button 
            onClick={handleExportReport}
            className="flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-full font-bold border-none shadow-lg shadow-primary/20 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 duration-200 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-5 h-5 text-white" />
            Tải Báo cáo Hệ thống (PDF)
          </button>
        </div>
      </div>

      {/* ── Core KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Doanh thu hệ thống"
          value="4.2 Tỷ đ"
          subtext="so với tháng trước"
          trend="up"
          trendValue="+18.2%"
          icon={DollarSign}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
        />
        <StatCard
          title="Vé đã bán trên sàn"
          value="24,500 vé"
          subtext="so với tháng trước"
          trend="up"
          trendValue="+12.4%"
          icon={Ticket}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
        />
        <StatCard
          title="Sự kiện đang hoạt động"
          value="158 sự kiện"
          subtext="tỷ lệ lấp đầy đạt 78.5%"
          trend="up"
          trendValue="+8.5%"
          icon={Calendar}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-500"
        />
        <StatCard
          title="Báo cáo chờ xử lý"
          value="3 báo cáo"
          subtext="giảm so với tuần trước"
          trend="down"
          trendValue="-25%"
          icon={AlertTriangle}
          iconBg="bg-rose-50"
          iconColor="text-rose-500"
        />
      </div>

      {/* ── Premium Tabbed Navigation ── */}
      <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {[
          { id: 'revenue', label: 'Doanh thu & Đối tác', icon: DollarSign },
          { id: 'performance', label: 'Hiệu suất Sự kiện', icon: Award },
          { id: 'moderation', label: 'Kiểm duyệt & An toàn', icon: ShieldAlert },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-white text-slate-900 shadow-md scale-[1.02]' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Main Tab Contents ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'revenue' && (
            <div className="space-y-8">
              {/* Charts grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Monthly Sales Area Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950">Lịch sử Doanh thu & Tiền Hoa hồng</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">Biểu đồ tổng doanh thu vé và 10% tiền commission thuộc về nền tảng</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-primary" />
                        <span className="text-slate-500">Doanh thu bán vé</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-emerald-500" />
                        <span className="text-slate-500">Hoa hồng hệ thống (10%)</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 'bold' }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} unit="M" />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" name="Tổng doanh thu" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        <Area type="monotone" dataKey="commission" name="Tiền hoa hồng" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCommission)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Ticket category distribution */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">Phân khúc hạng vé bán lẻ</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Tỷ lệ số lượng vé đã xuất ra theo từng phân khúc</p>
                  </div>
                  
                  <div className="h-56 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ticketClassData}
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {ticketClassData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-slate-900">24,500</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Vé bán ra</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {ticketClassData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs font-semibold p-2 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-600">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-900">{item.value.toLocaleString()} vé ({Math.round(item.value / 24500 * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Organizers Table */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">Nhà tổ chức Sự kiện Hàng đầu</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Danh sách đối tác có doanh thu phát sinh và đóng góp nhiều nhất</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tên đơn vị đối tác</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Số sự kiện đã tạo</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tổng doanh thu bán vé</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Hoa hồng góp về (10%)</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Đánh giá chung</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {topOrganizers.map(org => (
                        <tr key={org.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{org.name}</td>
                          <td className="px-6 py-4 text-center font-bold text-indigo-600">{org.eventsCount}</td>
                          <td className="px-6 py-4 font-bold text-slate-800">{org.totalSales}</td>
                          <td className="px-6 py-4 font-black text-emerald-600">{org.commission}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-xl font-bold text-xs">
                              ★ {org.rating}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-8">
              {/* Event success metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Event Tickets Sold Bar Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950">Chỉ số Vé Bán ra của Top Sự kiện</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">Biểu đồ so sánh số vé xuất ra giữa các sự kiện ăn khách nhất</p>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topEvents} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <Tooltip />
                        <Bar dataKey="ticketsSold" fill="#6366f1" radius={[8, 8, 0, 0]}>
                          {topEvents.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 1 ? '#8b5cf6' : '#6366f1'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* AI Advice Card */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 translate-y-12 translate-x-12 opacity-10">
                    <Zap className="w-80 h-80 text-white" />
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-amber-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Khuyến nghị của Hệ thống AI</span>
                    <h3 className="text-2xl font-black leading-snug tracking-tight">Khai thác tối đa Doanh thu từ Âm nhạc & Hội thảo</h3>
                  </div>

                  <div className="space-y-3 relative z-10 my-6">
                    <p className="text-sm font-medium text-slate-300 leading-relaxed">
                      Phân tích của chúng tôi cho thấy **Live Concert** và các **Hội thảo Công nghệ** đang chiếm tới **68%** dòng tiền bán lẻ.
                    </p>
                    <p className="text-sm font-medium text-slate-300 leading-relaxed">
                      Đề xuất nâng tỷ lệ chia sẻ hoa hồng cho sự kiện âm nhạc lên **12%** trong mùa hè nhằm tối ưu lợi nhuận nền tảng.
                    </p>
                  </div>

                  <button 
                    onClick={() => showToast('Đang tối ưu hóa phân tích dữ liệu AI...')}
                    className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl hover:bg-slate-100 active:scale-95 transition-all shadow-lg"
                  >
                    Xem chi tiết Phân tích AI
                  </button>
                </div>
              </div>

              {/* Top Events list */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">Sự kiện Đột phá nổi bật nhất</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Xếp hạng dựa trên tỷ lệ bán vé nhanh và lượng người quan tâm lớn</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề Sự kiện</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Danh mục</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Số lượng vé bán ra</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Doanh thu đạt được</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Đánh giá sao</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {topEvents.map((evt, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{evt.name}</td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-xl font-bold text-xs">
                              {evt.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-indigo-600">{evt.ticketsSold.toLocaleString()} vé</td>
                          <td className="px-6 py-4 font-bold text-slate-800">{evt.revenue}</td>
                          <td className="px-6 py-4 text-amber-500 font-bold">★ {evt.rating}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold 
                              ${evt.status === 'Hoàn tất' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${evt.status === 'Hoàn tất' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                              {evt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="space-y-8">
              
              {/* Warning banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-rose-50 border border-rose-100 rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center shrink-0 text-white shadow-lg shadow-rose-100">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Trung tâm Điều phối & An toàn Hệ thống</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Vui lòng rà soát kỹ các phản ánh từ khách mời. Việc đình chỉ sự kiện sẽ ảnh hưởng trực tiếp tới tài chính của đối tác.</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-rose-600 bg-white border border-rose-200 px-4 py-2 rounded-xl">
                  Có 3 sự kiện cần phê duyệt khẩn cấp
                </div>
              </div>

              {/* Reported Events List */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50">
                  <h3 className="text-lg font-bold text-slate-950">Sự kiện đang bị Báo cáo vi phạm</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Danh sách các chương trình bị khách hàng tố cáo vi phạm quy chế nền tảng</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Sự kiện & Nhà tổ chức</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Lý do báo cáo</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Người tố cáo</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Số lượt phản hồi</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Mức độ</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {reportedEvents.map(evt => (
                        <tr key={evt.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900">{evt.eventName}</p>
                            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">ID: {evt.id} • Bởi: {evt.organizer}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3 py-1 rounded-xl font-bold text-xs">
                              {evt.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-600">{evt.reporter}</td>
                          <td className="px-6 py-4 text-center font-bold text-slate-800">{evt.reportsCount} lượt</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full 
                              ${evt.severity === 'Cao' ? 'bg-rose-100 text-rose-700' : evt.severity === 'Trung bình' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                              {evt.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                              ${evt.status === 'Đang xử lý' ? 'bg-amber-50 text-amber-600' : evt.status === 'Đã khóa' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${evt.status === 'Đang xử lý' ? 'bg-amber-400' : evt.status === 'Đã khóa' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                              {evt.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {evt.status === 'Đang xử lý' ? (
                              <button 
                                onClick={() => setSelectedReportedEvent(evt)}
                                className="bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer active:scale-95 shadow-sm"
                              >
                                Xem & Giải quyết
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 font-bold">Đã hoàn thành</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Toast Notifications ── */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="fixed bottom-10 right-10 z-[300] flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl min-w-[320px] border border-slate-800"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-indigo-500'}`}>
              {toast.type === 'success' ? (
                <Check className="w-4 h-4 text-white" />
              ) : toast.type === 'error' ? (
                <ShieldAlert className="w-4 h-4 text-white" />
              ) : (
                <Zap className="w-4 h-4 text-white" />
              )}
            </div>
            <p className="text-sm font-black tracking-tight">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Moderation Action Modal ── */}
      <AnimatePresence>
        {selectedReportedEvent && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedReportedEvent(null)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6 text-rose-600 animate-pulse" />
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Giải quyết Báo cáo Vi phạm</h2>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Sự kiện: {selectedReportedEvent.eventName}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedReportedEvent(null)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-all font-black">✕</button>
              </div>

              <div className="p-8 space-y-6">
                
                {/* Event report details */}
                <div className="grid grid-cols-2 gap-4 text-sm font-semibold p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Nhà tổ chức</p>
                    <p className="text-slate-800">{selectedReportedEvent.organizer}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Lý do bị tố cáo</p>
                    <p className="text-rose-600 font-bold">{selectedReportedEvent.category}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Người phản hồi chính</p>
                    <p className="text-slate-600 font-medium">{selectedReportedEvent.reporter}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Mức độ nghiêm trọng</p>
                    <p className="text-slate-800 font-black">{selectedReportedEvent.severity}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Ghi chú xử lý (Gửi đến Nhà tổ chức)</label>
                  <textarea 
                    rows={4} 
                    value={actionNotes} 
                    onChange={e => setActionNotes(e.target.value)} 
                    placeholder="Nhập lý do chi tiết về quyết định khóa hoặc bỏ qua báo cáo để hệ thống gửi thư điện tử thông báo đến nhà tổ chức..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-600 transition-all outline-none resize-none" 
                  />
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={() => handleModerationAction('dismiss')}
                  className="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all rounded-xl cursor-pointer"
                >
                  Bác bỏ báo cáo
                </button>
                <button 
                  onClick={() => handleModerationAction('suspend')}
                  className="px-8 py-3.5 bg-rose-600 text-white font-black text-sm rounded-xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 cursor-pointer"
                >
                  Đóng & Khóa sự kiện
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminReportsPage;
